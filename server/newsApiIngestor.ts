
import axios from "axios";
import { Signal, SignalCategory } from "./types";
import { v4 as uuidv4 } from "uuid";

export class NewsApiIngestor {
  static async fetchRealtimeSignals(query: string = "Lahore emergency OR Lahore crisis OR Lahore accident"): Promise<Signal[]> {
    console.log(`[OSINT] Initiating NewsAPI fetch. Query: "${query}"`);
    const apiKey = process.env.NEWS_API_KEY;

    if (!apiKey) {
      console.warn("[OSINT] CRITICAL: NEWS_API_KEY environment variable is missing.");
      return [];
    }

    try {
      const trimmedKey = apiKey.trim();
      console.log(`[OSINT] Using API Key: ${trimmedKey.substring(0, 4)}...${trimmedKey.substring(trimmedKey.length - 4)}`);
      
      const response = await axios.get(`https://newsapi.org/v2/everything`, {
        params: {
          q: query,
          sortBy: "publishedAt",
          language: "en",
          pageSize: 20,
          apiKey: trimmedKey
        },
        headers: {
          "User-Agent": "CIRO-Osint-Ingestor/1.0"
        },
        timeout: 10000 // 10 second timeout
      });

      console.log(`[OSINT] NewsAPI Response Status: ${response.status}`);
      let articles = response.data.articles || [];
      
      // Fallback if no results for specific emergency query
      if (articles.length === 0 && !query.includes("Lahore news")) {
        console.log("[OSINT] No emergency results found. Falling back to general Lahore news.");
        const fallbackRes = await axios.get(`https://newsapi.org/v2/everything`, {
          params: {
            q: "Lahore news",
            sortBy: "publishedAt",
            language: "en",
            pageSize: 10,
            apiKey: trimmedKey
          },
          headers: {
            "User-Agent": "CIRO-Osint-Ingestor/1.0"
          },
          timeout: 10000
        });
        articles = fallbackRes.data.articles || [];
      }

      console.log(`[OSINT] Total articles retrieved: ${articles.length}`);
      
      return articles.map((article: any) => {
        const title = (article.title || "").substring(0, 150);
        const description = (article.description || "No further details available.").substring(0, 300);
        const cleanContent = `${title}: ${description}`.replace(/[\n\r]+/g, " ").trim();

        return {
          id: uuidv4(),
          timestamp: article.publishedAt || new Date().toISOString(),
          content: cleanContent,
          category: SignalCategory.SOCIAL_MEDIA,
          location: {
            lat: 31.5204 + (Math.random() - 0.5) * 0.1,
            lng: 74.3587 + (Math.random() - 0.5) * 0.1
          },
          confidence: 0.85,
          sourceReliability: 0.9,
          metadata: {
            username: article.source?.name || "News Outlet",
            source_type: "LIVE_NEWS",
            source_url: article.url,
            is_valid_url: !!article.url
          }
        };
      });
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message;
      console.error("NewsAPI Fetch Error:", errorMsg);
      return [];
    }
  }
}
