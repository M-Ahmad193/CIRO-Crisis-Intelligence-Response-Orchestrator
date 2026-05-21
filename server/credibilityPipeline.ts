import { Signal, SignalCategory } from "./types";
import { withRetry } from "./aiUtils";
import { getGroqClient, GROQ_MODEL } from "./groqClient";

export interface CredibilityResult {
  score: number;
  isSpam: boolean;
  reason: string;
  reliabilityFlags: string[];
  misinformationLikelihood: "LOW" | "MEDIUM" | "HIGH";
  analysis: {
    urgencyScore: number;
    velocityValue: number;
    isSpam: boolean;
    isDuplicate: boolean;
    hasContradictions: boolean;
    sourceTrust: number;
    geoConfidence: number;
    botLikelihood: number;
  };
}

export class CredibilityPipeline {
  private static signalHistory: Signal[] = [];

  static async analyze(signal: Signal, allSignals: Signal[]): Promise<CredibilityResult> {
    this.signalHistory = allSignals;
    const velocity = this.calculateVelocity(signal);
    const duplicates = this.checkDuplicates(signal);
    const groq = getGroqClient();
    
    const prompt = `Perform a high-precision credibility analysis on this emergency signal.
    
    Signal Content: "${signal.content}"
    Category: ${signal.category}
    Source Reliability: ${signal.sourceReliability}
    Recent Similar Signal Count (Velocity): ${velocity}
    Likely Duplicates Found: ${duplicates.length}
    Device Confidence: ${signal.confidence}

    Perform the following sub-analyses:
    1. NLP Urgency Extraction: Rate intensity 0-1.
    2. Spam Detection: Check for commercial keywords, bot-like patterns, or gibberish.
    3. Contradiction Analysis: Check if the content is self-contradictory or extremely improbable.
    4. Bot Likelihood: Evaluate syntax and context for automated generation signs.
    5. Geolocation Confidence: Based on category, how likely is the location accurate (e.g., GPS vs IP).

    Return JSON strictly in this format:
    {
      "urgencyScore": number,
      "botLikelihood": number,
      "isSpam": boolean,
      "hasContradictions": boolean,
      "geoConfidence": number,
      "summary": "string explaining the verdict",
      "reliabilityFlags": ["STRING"],
      "misinformationLikelihood": "LOW" | "MEDIUM" | "HIGH"
    }`;

    try {
      const completion = await withRetry(() => groq.chat.completions.create({
        model: GROQ_MODEL,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      }), 4, 10000);

      const content = completion.choices[0]?.message?.content || "{}";
      const aiResult = JSON.parse(content);
      
      // Calculate final credibility score
      const sourceTrust = signal.sourceReliability;
      const spamPenalty = aiResult.isSpam ? 0.8 : 1.0;
      const botPenalty = 1.0 - ((aiResult.botLikelihood || 0) * 0.5);
      const duplicatePenalty = duplicates.length > 3 ? 0.7 : 1.0; 
      
      const score = (
        (sourceTrust * 0.4) + 
        ((aiResult.geoConfidence || 0.5) * 0.3) + 
        (Math.min(velocity / 10, 1) * 0.3)
      ) * spamPenalty * botPenalty * duplicatePenalty;

      return {
        score: Math.min(Math.max(score, 0), 1),
        isSpam: !!aiResult.isSpam,
        reason: aiResult.summary || "Analysis completed.",
        reliabilityFlags: aiResult.reliabilityFlags || [],
        misinformationLikelihood: aiResult.misinformationLikelihood || "LOW",
        analysis: {
          urgencyScore: aiResult.urgencyScore || 0.5,
          velocityValue: velocity,
          isSpam: !!aiResult.isSpam,
          isDuplicate: duplicates.length > 0,
          hasContradictions: !!aiResult.hasContradictions,
          sourceTrust: sourceTrust,
          geoConfidence: aiResult.geoConfidence || 0.5,
          botLikelihood: aiResult.botLikelihood || 0
        }
      };
    } catch (error) {
      console.error("Credibility Pipeline Error (Groq):", error);
      return {
        score: signal.sourceReliability * signal.confidence,
        isSpam: false,
        reason: "Heuristic fallback used.",
        reliabilityFlags: ["HEURISTIC_ESTIMATE"],
        misinformationLikelihood: "MEDIUM",
        analysis: {
          urgencyScore: 0.5,
          velocityValue: velocity,
          isSpam: false,
          isDuplicate: duplicates.length > 0,
          hasContradictions: false,
          sourceTrust: signal.sourceReliability,
          geoConfidence: signal.confidence,
          botLikelihood: 0.2
        }
      };
    }
  }

  private static calculateVelocity(signal: Signal): number {
    const windowMs = 10 * 60 * 1000; // 10 minute window
    const now = Date.now();
    const spatialRadius = 3000; // 3km radius for city-scale events

    return this.signalHistory.filter(s => {
      const timeDiff = now - new Date(s.timestamp).getTime();
      const dist = this.getDistance(s.location, signal.location);
      return timeDiff < windowMs && dist < spatialRadius && s.category === signal.category;
    }).length;
  }

  private static getDistance(l1: {lat: number, lng: number}, l2: {lat: number, lng: number}): number {
    const R = 6371e3; // metres
    const phi1 = l1.lat * Math.PI/180;
    const phi2 = l2.lat * Math.PI/180;
    const dPhi = (l2.lat-l1.lat) * Math.PI/180;
    const dLambda = (l2.lng-l1.lng) * Math.PI/180;

    const a = Math.sin(dPhi/2) * Math.sin(dPhi/2) +
              Math.cos(phi1) * Math.cos(phi2) *
              Math.sin(dLambda/2) * Math.sin(dLambda/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }

  private static checkDuplicates(signal: Signal): string[] {
    return this.signalHistory
      .filter(s => {
        const isSelf = s.id === signal.id;
        const sameContent = s.content.trim().toLowerCase() === signal.content.trim().toLowerCase();
        const physicalProximity = this.getDistance(s.location, signal.location) < 100;
        return !isSelf && (sameContent || (physicalProximity && sameContent));
      })
      .map(s => s.id);
  }
}
