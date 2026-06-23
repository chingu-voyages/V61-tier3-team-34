import Groq from "groq-sdk";

let groqClient = null;

export function getGroqClient() {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("Missing GROQ_API_KEY environment variable.");
  }
  if (!groqClient) {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groqClient;
}

// llama-3.1-8b-instant: higher TPM limit on Groq free tier (good for MVP).
// Switch to llama-3.3-70b-versatile for better quality if on a paid tier.
export const GROQ_MODEL = "llama-3.1-8b-instant";

// Groq free tier TPM limit is ~14,000 tokens for the 8b model.
// We cap the JD text at ~6,000 words (~8,000 tokens) before sending —
// job descriptions rarely need more than this to extract all fields.
const MAX_JD_CHARS = 24000;

export function truncateJDText(text) {
  if (!text || text.length <= MAX_JD_CHARS) return text;
  return text.slice(0, MAX_JD_CHARS) + "\n\n[Text truncated for processing]";
}
