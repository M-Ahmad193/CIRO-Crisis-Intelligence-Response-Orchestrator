import { Signal, SignalCategory } from "./types";
import { v4 as uuidv4 } from "uuid";
import { withRetry } from "./aiUtils";
import { getGroqClient, GROQ_MODEL } from "./groqClient";

export class OSINTIngestor {
  static async generateRealisticSignals(center: { lat: number, lng: number }): Promise<Signal[]> {
    const groq = getGroqClient();
    const prompt = `Generate 3 realistic crisis signals for an urban emergency management system in JSON format.
    Location focus: Near lat ${center.lat}, lng ${center.lng} (Lahore region).
    
    The signals should include:
    - Mix of English and Urdu (Roman Urdu).
    - Varying categories: SOCIAL_MEDIA, FIELD_REPORT, EMERGENCY_CALL.
    - One signal should be slightly suspicious/spammy to test credibility.
    - Realistic timestamps around current time: ${new Date().toISOString()}.
    
    IMPORTANT: For SOCIAL_MEDIA signals, include a mock "source_url" in metadata pointing to x.com or facebook.com.
    
    Format as JSON array of objects:
    {
      "category": "SOCIAL_MEDIA" | "FIELD_REPORT" | "EMERGENCY_CALL",
      "content": "string",
      "location": { "lat": number, "lng": number },
      "confidence": number,
      "sourceReliability": number,
      "metadata": { "username": "string", "source_type": "string", "source_url": "string (optional)" }
    }`;

    try {
      const completion = await withRetry(() => groq.chat.completions.create({
        model: GROQ_MODEL,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      }), 2, 5000);

      const content = completion.choices[0]?.message?.content || "{}";
      const data = JSON.parse(content);
      const rawSignals = Array.isArray(data) ? data : (data.signals || []);

      return rawSignals.map((s: any) => ({
        ...s,
        id: uuidv4(),
        timestamp: s.timestamp || new Date().toISOString()
      }));
    } catch (error) {
      console.error("OSINT Ingestor Error (Groq):", error);
      return [];
    }
  }
}
