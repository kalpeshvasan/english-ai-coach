import { GoogleGenAI } from "@google/genai";

export function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is missing. Please add it to .env.local and restart the server."
    );
  }

  return new GoogleGenAI({ apiKey });
}