import express from "express";
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import { AntigravityOrchestrator } from "./server/orchestrator";
import { SignalCategory } from "./server/types";
import { OSINTIngestor } from "./server/osintIngestor";
import { NewsApiIngestor } from "./server/newsApiIngestor";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";

dotenv.config();

import { SCENARIOS } from "./server/mockData";

async function startServer() {
  const app = express();

  // Validate critical API keys at startup
  const requiredKeys = ['NEWS_API_KEY', 'GEMINI_API_KEY', 'GROQ_API_KEY'];
  let missingKeys: string[] = [];
  requiredKeys.forEach(key => {
    const val = process.env[key];
    if (!val || val.trim().length < 8 || val.includes('MY_')) {
      console.error(`\x1b[31m[STARTUP ERROR] ${key} is missing or invalid.\x1b[0m`);
      missingKeys.push(key);
    } else {
      console.log(`\x1b[32m[STARTUP] ${key} validated.\x1b[0m`);
    }
  });

  if (missingKeys.length > 0) {
    console.warn(`\x1b[41m\x1b[37m ATTENTION: The following API keys are required but missing: ${missingKeys.join(', ')} \x1b[0m`);
    // We log loudly instead of throwing to avoid boot-loops in AI Studio environment
  }

  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: "*" }
  });
  const PORT = Number(process.env.PORT) || 3000;

  const orchestrator = new AntigravityOrchestrator((update) => {
    io.emit("update", update);
  });

  app.use(express.json());

  // API Routes
  app.get("/api/state", (req, res) => {
    res.json(orchestrator.getState());
  });

  app.post("/api/signal", async (req, res) => {
    const signal = req.body;
    await orchestrator.ingestSignal({
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      ...signal
    });
    res.json({ status: "ingested" });
  });

  // Scenario trigger route
  app.post("/api/scenarios/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const scenario = SCENARIOS[id];
    if (!scenario) return res.status(404).send("Not found");
    
    scenario.signals.forEach(s => {
      setTimeout(() => orchestrator.ingestSignal(s.signal()), s.delay);
    });
    res.json({ status: "triggered", name: scenario.name });
  });
  
  app.post("/api/settings", (req, res) => {
    orchestrator.updateSettings(req.body);
    res.json({ status: "updated" });
  });

  app.post("/api/reset", (req, res) => {
    orchestrator.resetSimulation();
    res.json({ status: "reset" });
  });

  app.post("/api/osint", async (req, res) => {
    const query = req.body.query || "Lahore emergency OR Lahore crisis OR Lahore accident";
    console.log(`[ROUTE] /api/osint hit with query: ${query}`);
    
    if (!process.env.NEWS_API_KEY) {
      console.error("[ROUTE] /api/osint failed: NEWS_API_KEY is missing in process.env");
      return res.status(500).json({ status: "error", message: "NEWS_API_KEY missing" });
    }

    try {
      const signals = await NewsApiIngestor.fetchRealtimeSignals(query);
      console.log(`[ROUTE] /api/osint fetched ${signals.length} signals`);
      
      // Ingest signals
      signals.forEach((s) => {
        orchestrator.ingestSignal(s);
      });
      
      res.json({ status: "realtime_osint_ingested", count: signals.length, query });
    } catch (error: any) {
      console.error(`[ROUTE] /api/osint internal error: ${error.message}`);
      res.status(500).json({ status: "error", message: error.message });
    }
  });

  app.post("/api/demo", async (req, res) => {
    orchestrator.resetSimulation();
    // Scripted Demo: Large Accident near Mall of Lahore
    setTimeout(() => {
        orchestrator.ingestSignal({
            id: uuidv4(),
            timestamp: new Date().toISOString(),
            content: "Flash flood happening at George Town for past 30 mins. G-10 mein pani bhar gaya hai, gaariyan phans gayi hain",
            category: "SOCIAL_MEDIA" as any,
            location: { lat: 31.5204, lng: 74.3587 },
            confidence: 0.9,
            sourceReliability: 0.8,
            metadata: { confidence: 0.9, source_url: "https://x.com/lahore_updates/status/12345" }
        } as any);
    }, 1000);

    setTimeout(() => {
        orchestrator.ingestSignal({
            id: uuidv4(),
            timestamp: new Date().toISOString(),
            content: "HEAVY RAINFALL ALERT: Massive precipitation recorded in G-10 sector corridor.",
            category: "WEATHER" as any,
            location: { lat: 31.5210, lng: 74.3590 },
            confidence: 0.95,
            sourceReliability: 1.0,
            metadata: { confidence: 0.95 }
        } as any);
    }, 15000);

    setTimeout(() => {
      orchestrator.ingestSignal({
          id: uuidv4(),
          timestamp: new Date().toISOString(),
          content: "TRAFFIC_ALERT: SPIKE in congestion detected on alternate routes due to water logging.",
          category: "TRAFFIC" as any,
          location: { lat: 31.5190, lng: 74.3570 },
          confidence: 0.85,
          sourceReliability: 0.9,
          metadata: { confidence: 0.85 }
      } as any);
    }, 30000);

    res.json({ status: "demo_started" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  io.on("connection", (socket) => {
    socket.emit("update", { type: "STATE", state: orchestrator.getState() });

    socket.on("ingest", async (signal) => {
      await orchestrator.ingestSignal({
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        ...signal
      });
    });
  });

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`CIRO Server running on http://localhost:${PORT}`);
    
    // Initial fetch for real-time awareness
    const fetchSignals = async () => {
      try {
        const signals = await NewsApiIngestor.fetchRealtimeSignals();
        if (signals.length > 0) {
          console.log(`[OSINT] Ingested ${signals.length} real-time signals.`);
          signals.forEach(s => orchestrator.ingestSignal(s));
        }
      } catch (err) {
        console.error("[OSINT] Periodic fetch failed:", err);
      }
    };

    fetchSignals();

    // Polling mechanism: Every 5 minutes
    setInterval(fetchSignals, 5 * 60 * 1000);
  });
}

startServer();
