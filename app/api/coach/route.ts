import { getGeminiClient } from "@/lib/gemini";
import { coachPrompt } from "@/lib/coachPrompt";

export const runtime = "nodejs";

export async function POST(request: Request) {
  console.log("========== /api/coach START ==========");

  try {
    const body = await request.json();
    const message = body?.message;

    if (!message || typeof message !== "string") {
      return Response.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    console.log("Message:", message);
    console.log("Creating Gemini client...");

    const gemini = getGeminiClient();

    console.log("Calling Gemini...");

    const response = await gemini.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `${coachPrompt}

User message:
${message}`,
      config: {
        maxOutputTokens: 300,
        temperature: 0.3,
      },
    });

    console.log("Gemini response received");

    const reply = response.text;

    if (!reply) {
      throw new Error("Gemini returned an empty response");
    }

    console.log("Gemini reply:", reply);
    console.log("========== /api/coach SUCCESS ==========");

    return Response.json({ reply });
  } catch (error) {
    console.error("========== GEMINI API ERROR ==========");
    console.error(error);
    console.error("======================================");

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong",
      },
      { status: 500 }
    );
  }
}