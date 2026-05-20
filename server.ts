import express from "express";
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import { AntigravityOrchestrator } from "./server/orchestrator";
import { SignalCategory } from "./server/types";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";

dotenv.config();

import { SCENARIOS } from "./server/mockData";

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: "*" }
  });
  const PORT = process.env.PORT || 3000;

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

  app.post("/api/demo", async (req, res) => {
    orchestrator.resetSimulation();
    // Scripted Demo: Large Accident near Mall of Lahore
    setTimeout(() => {
        orchestrator.ingestSignal({
            id: "demo-flood-1",
            timestamp: new Date().toISOString(),
            content: "Flash flood happening at George Town for past 30 mins. G-10 mein pani bhar gaya hai, gaariyan phans gayi hain",
            category: "SOCIAL_MEDIA" as any,
            location: { lat: 31.5204, lng: 74.3587 },
            confidence: 0.9,
            sourceReliability: 0.8,
            metadata: { confidence: 0.9 }
        } as any);
    }, 1000);

    setTimeout(() => {
        orchestrator.ingestSignal({
            id: "demo-flood-2",
            timestamp: new Date().toISOString(),
            content: "HEAVY RAINFALL ALERT: Massive precipitation recorded in G-10 sector corridor.",
            category: "WEATHER" as any,
            location: { lat: 31.5210, lng: 74.3590 },
            confidence: 0.95,
            sourceReliability: 1.0,
            metadata: { confidence: 0.95 }
        } as any);
    }, 3000);

    setTimeout(() => {
      orchestrator.ingestSignal({
          id: "demo-flood-3",
          timestamp: new Date().toISOString(),
          content: "TRAFFIC_ALERT: SPIKE in congestion detected on alternate routes due to water logging.",
          category: "TRAFFIC" as any,
          location: { lat: 31.5190, lng: 74.3570 },
          confidence: 0.85,
          sourceReliability: 0.9,
          metadata: { confidence: 0.85 }
      } as any);
    }, 5000);

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
    // Trigger Scenario 1 by default
    setTimeout(() => {
      SCENARIOS[0].signals.forEach(s => {
        setTimeout(() => orchestrator.ingestSignal(s.signal()), s.delay);
      });
    }, 5000);
  });
}

startServer();
