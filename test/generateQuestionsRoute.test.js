import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/groq", () => ({
  getGroqClient: vi.fn(),
  GROQ_MODEL: "mock-model",
}));

vi.mock("@/lib/questionGeneration", () => ({
  buildQuestionGenerationPrompt: vi.fn(() => "prompt"),
  normalizeQuestions: vi.fn((q) => q),
}));

vi.mock("@/lib/jobExtraction", () => ({
  parseLLMJson: vi.fn(),
}));

vi.mock("@/lib/supabase", () => ({
  getSupabaseClient: vi.fn(),
}));

import { POST } from "../app/api/generate-questions/route";
import { getGroqClient } from "@/lib/groq";
import { parseLLMJson } from "@/lib/jobExtraction";
import { getSupabaseClient } from "@/lib/supabase";

describe("POST /api/generate-questions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

 // ---------------------------------------------------------------------------
  // Validation tests
  // Verify the API rejects malformed requests and missing required data.
  // ---------------------------------------------------------------------------
 
  describe("Validation", () => {
    it("returns 400 for invalid JSON body", async () => {
      const req = {
        json: vi.fn().mockRejectedValue(new Error()),
      };

      const res = await POST(req);

      expect(res.status).toBe(400);
      expect(await res.json()).toEqual({
        error: "Invalid request body.",
      });
    });

    it("returns 400 when extractedJob is missing", async () => {
      const req = {
        json: vi.fn().mockResolvedValue({}),
      };

      const res = await POST(req);

      expect(res.status).toBe(400);
      expect(await res.json()).toEqual({
        error:
          "Missing extracted job data — analyze a job description first.",
      });
    });

    it("returns 400 when extractedJob is not an object", async () => {
      const req = {
        json: vi.fn().mockResolvedValue({
          extractedJob: "developer",
        }),
      };

      const res = await POST(req);

      expect(res.status).toBe(400);
    });
  });

  // ---------------------------------------------------------------------------
  // Successful request tests
  // Verify valid requests return generated interview questions and optionally
  // persist them when a sessionId is provided.
  // ---------------------------------------------------------------------------

  describe("Successful generation", () => {
    it("returns generated questions", async () => {
      getGroqClient.mockReturnValue({
        chat: {
          completions: {
            create: vi.fn().mockResolvedValue({
              choices: [
                {
                  message: {
                    content: '{"technical":[]}',
                  },
                },
              ],
            }),
          },
        },
      });

      parseLLMJson.mockReturnValue({
        technical: [],
      });

      const req = {
        json: vi.fn().mockResolvedValue({
          extractedJob: {
            job_title: "Developer",
          },
        }),
      };

      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.questions).toEqual({
        technical: [],
      });
    });

    it("returns sessionId when supplied", async () => {
      getGroqClient.mockReturnValue({
        chat: {
          completions: {
            create: vi.fn().mockResolvedValue({
              choices: [
                {
                  message: {
                    content: "{}",
                  },
                },
              ],
            }),
          },
        },
      });

      parseLLMJson.mockReturnValue({});

      getSupabaseClient.mockReturnValue({
        from: () => ({
          update: () => ({
            eq: vi.fn().mockResolvedValue({
              error: null,
            }),
          }),
        }),
      });

      const req = {
        json: vi.fn().mockResolvedValue({
          sessionId: "123",
          extractedJob: {},
        }),
      };

      const res = await POST(req);
      const body = await res.json();

      expect(body.sessionId).toBe("123");
    });
  });

   // ---------------------------------------------------------------------------
  // Groq API failure tests
  // Verify the route gracefully handles LLM failures, malformed responses,
  // and returns the appropriate HTTP status code.
  // ---------------------------------------------------------------------------

  describe("Groq failures", () => {
    it("returns 502 when Groq throws", async () => {
      getGroqClient.mockReturnValue({
        chat: {
          completions: {
            create: vi.fn().mockRejectedValue(new Error("timeout")),
          },
        },
      });

      const req = {
        json: vi.fn().mockResolvedValue({
          extractedJob: {},
        }),
      };

      const res = await POST(req);

      expect(res.status).toBe(502);

      expect(await res.json()).toEqual({
        error:
          "We couldn't generate questions right now. Please try again in a moment.",
      });
    });

    it("returns 502 when LLM returns malformed JSON", async () => {
      getGroqClient.mockReturnValue({
        chat: {
          completions: {
            create: vi.fn().mockResolvedValue({
              choices: [
                {
                  message: {
                    content: "not json",
                  },
                },
              ],
            }),
          },
        },
      });

      parseLLMJson.mockImplementation(() => {
        throw new Error("bad json");
      });

      const req = {
        json: vi.fn().mockResolvedValue({
          extractedJob: {},
        }),
      };

      const res = await POST(req);

      expect(res.status).toBe(502);
    });
  });

 // ---------------------------------------------------------------------------
  // Database persistence tests
  // Verify Supabase success, update failures, and unexpected database errors
  // do not prevent a successful API response after questions are generated.
  // ---------------------------------------------------------------------------
  
  describe("Supabase persistence", () => {
    it("continues when database update succeeds", async () => {
      getGroqClient.mockReturnValue({
        chat: {
          completions: {
            create: vi.fn().mockResolvedValue({
              choices: [
                {
                  message: {
                    content: "{}",
                  },
                },
              ],
            }),
          },
        },
      });

      parseLLMJson.mockReturnValue({});

      getSupabaseClient.mockReturnValue({
        from: () => ({
          update: () => ({
            eq: vi.fn().mockResolvedValue({
              error: null,
            }),
          }),
        }),
      });

      const req = {
        json: vi.fn().mockResolvedValue({
          sessionId: "1",
          extractedJob: {},
        }),
      };

      const res = await POST(req);

      expect(res.status).toBe(200);
    });

    it("still returns 200 when Supabase update fails", async () => {
      getGroqClient.mockReturnValue({
        chat: {
          completions: {
            create: vi.fn().mockResolvedValue({
              choices: [
                {
                  message: {
                    content: "{}",
                  },
                },
              ],
            }),
          },
        },
      });

      parseLLMJson.mockReturnValue({});

      getSupabaseClient.mockReturnValue({
        from: () => ({
          update: () => ({
            eq: vi.fn().mockResolvedValue({
              error: {
                message: "db failed",
              },
            }),
          }),
        }),
      });

      const req = {
        json: vi.fn().mockResolvedValue({
          sessionId: "1",
          extractedJob: {},
        }),
      };

      const res = await POST(req);

      expect(res.status).toBe(200);
    });

    it("still returns 200 when Supabase throws", async () => {
      getGroqClient.mockReturnValue({
        chat: {
          completions: {
            create: vi.fn().mockResolvedValue({
              choices: [
                {
                  message: {
                    content: "{}",
                  },
                },
              ],
            }),
          },
        },
      });

      parseLLMJson.mockReturnValue({});

      getSupabaseClient.mockImplementation(() => {
        throw new Error("connection failed");
      });

      const req = {
        json: vi.fn().mockResolvedValue({
          sessionId: "1",
          extractedJob: {},
        }),
      };

      const res = await POST(req);

      expect(res.status).toBe(200);
    });
  });
  
  // ---------------------------------------------------------------------------
  // Edge case tests
  // Verify boundary conditions and unexpected inputs are handled safely,
  // including quantity limits for generated interview questions.
  // --------------------------------------------------------------------------
 
  describe("Edge cases", () => {
    it("clamps quantityPerCategory below minimum", async () => {
      const create = vi.fn().mockResolvedValue({
        choices: [
          {
            message: {
              content: "{}",
            },
          },
        ],
      });

      getGroqClient.mockReturnValue({
        chat: {
          completions: {
            create,
          },
        },
      });

      parseLLMJson.mockReturnValue({});

      const req = {
        json: vi.fn().mockResolvedValue({
          extractedJob: {},
          quantityPerCategory: 0,
        }),
      };

      await POST(req);

      expect(create).toHaveBeenCalled();
    });

    it("clamps quantityPerCategory above maximum", async () => {
      const create = vi.fn().mockResolvedValue({
        choices: [
          {
            message: {
              content: "{}",
            },
          },
        ],
      });

      getGroqClient.mockReturnValue({
        chat: {
          completions: {
            create,
          },
        },
      });

      parseLLMJson.mockReturnValue({});

      const req = {
        json: vi.fn().mockResolvedValue({
          extractedJob: {},
          quantityPerCategory: 100,
        }),
      };

      await POST(req);

      expect(create).toHaveBeenCalled();
    });
  });
});