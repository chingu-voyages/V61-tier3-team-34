import { NextResponse } from "next/server";
import { extractTextFromFile, cleanText, UnsupportedFileError } from "@/lib/parseFile";
import { getSupabaseClient } from "@/lib/supabase";

export const runtime = "nodejs";

// Allow up to 10MB uploads (Vercel default is 4.5MB for serverless functions)
export const config = {
  api: {
    bodyParser: false,
    responseLimit: "10mb",
  },
};

/**
 * POST /api/ingest
 * Accepts either:
 *  - multipart/form-data with a "file" field (.txt/.pdf/.docx), or
 *  - application/json with a "text" field (pasted JD)
 *
 * Extracts and cleans the job description text, stores a new session
 * row in Supabase, and returns the session id + extracted text.
 */
export async function POST(request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let jdText = "";

    if (contentType.includes("multipart/form-data")) {
      let formData;
      try {
        formData = await request.formData();
      } catch (err) {
        console.error("formData parse error:", err);
        return NextResponse.json(
          { error: "Could not read the uploaded file. Please try again." },
          { status: 400 }
        );
      }

      const file = formData.get("file");

      if (!file || typeof file === "string") {
        return NextResponse.json(
          { error: "No file was provided." },
          { status: 400 }
        );
      }

      let buffer;
      try {
        const arrayBuffer = await file.arrayBuffer();
        buffer = Buffer.from(arrayBuffer);
      } catch (err) {
        console.error("Buffer read error:", err);
        return NextResponse.json(
          { error: "Could not read the file contents. Please try again." },
          { status: 400 }
        );
      }

      try {
        jdText = await extractTextFromFile(buffer, file.name);
      } catch (err) {
        if (err instanceof UnsupportedFileError) {
          return NextResponse.json({ error: err.message }, { status: 400 });
        }
        console.error("Text extraction error:", err);
        return NextResponse.json(
          { error: "Could not extract text from the file. Please try pasting the text directly instead." },
          { status: 422 }
        );
      }
    } else {
      const body = await request.json();
      jdText = cleanText(body.text || "");
    }

    if (!jdText || jdText.trim().length < 30) {
      return NextResponse.json(
        {
          error:
            "The job description looks too short or empty. Please provide more detail.",
        },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("jd_sessions")
      .insert({ jd_text: jdText })
      .select("id")
      .single();

    if (error) {
      console.error("Supabase insert error (jd_sessions):", error);
      return NextResponse.json(
        { error: "Could not save the job description. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ sessionId: data.id, jdText });
  } catch (err) {
    console.error("Ingest error:", err);
    return NextResponse.json(
      { error: "Something went wrong while processing your job description." },
      { status: 500 }
    );
  }
}
