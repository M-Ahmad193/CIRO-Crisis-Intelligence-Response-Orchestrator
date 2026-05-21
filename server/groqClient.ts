
import Groq from "groq-sdk";

let groqClient: Groq | null = null;

export function getGroqClient(): Groq {
  if (!groqClient) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      // In development, if GROQ_API_KEY is missing, we might want to warn
      // but let's assume it will be provided as per user request.
      throw new Error("GROQ_API_KEY environment variable is required for open-source model support.");
    }
    groqClient = new Groq({ apiKey });
  }
  return groqClient;
}

export const GROQ_MODEL = "llama-3.3-70b-versatile";
