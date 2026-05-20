import { GoogleGenAI, Type } from "@google/genai";
import { 
  Signal, 
  Crisis, 
  CrisisType, 
  SeverityLevel, 
  TraceEntry, 
  Resource, 
  Allocation,
  SignalCategory,
  SystemSettings,
  TrafficPoint
} from "./types";
import { v4 as uuidv4 } from "uuid";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

export class AntigravityOrchestrator {
  private crises: Map<string, Crisis> = new Map();
  private signals: Signal[] = [];
  private resources: Resource[] = [];
  private trafficPoints: TrafficPoint[] = [];
  private onUpdate: (data: any) => void;
  private timer: NodeJS.Timeout | null = null;
  private settings: SystemSettings = {
    timeCompression: 1,
    resourceAvailability: 1,
    autoResourceAllocation: true
  };

  constructor(onUpdate: (data: any) => void) {
    this.onUpdate = onUpdate;
    this.initializeResources();
    this.initializeTraffic();
    this.startSimulationTicker();
  }

  private startSimulationTicker() {
    this.timer = setInterval(() => {
      this.updateSimulationState();
    }, 2000); // 2-second simulation tick
  }

  private updateSimulationState() {
    let stateChanged = false;

    // Simulate Unit Movement
    this.resources.forEach(res => {
      if (res.status === "DEPLOYED") {
        const allocation = Array.from(this.crises.values()).map(c => {
            // Find if this resource is assigned to this crisis
            // (In a more complex app, we'd have a specific allocation map)
            // For now, let's assume they move toward the first crisis if deployed
            return c;
        })[0];

        if (allocation) {
           const target = allocation.location;
           const dy = target.lat - res.location.lat;
           const dx = target.lng - res.location.lng;
           const dist = Math.sqrt(dx*dx + dy*dy);
           
           if (dist > 0.001) {
             const speed = 0.005 * this.settings.timeCompression;
             res.location.lat += (dy / dist) * speed;
             res.location.lng += (dx / dist) * speed;
             stateChanged = true;
           }
        }
      }
    });

    if (stateChanged) {
        this.broadcastUpdate();
    }
  }

  private async safeGenerateContent(prompt: string, fallback: any, retryCount = 0): Promise<any> {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        config: { responseMimeType: "application/json" },
        contents: prompt
      });
      return JSON.parse(response.text || "{}");
    } catch (error: any) {
      if (retryCount < 2 && error?.status === 503) {
        this.addTrace(null, "System Kernel", "RETRETING: Model busy (503). Backoff triggered...", "INFO");
        await new Promise(r => setTimeout(r, 1000 * (retryCount + 1)));
        return this.safeGenerateContent(prompt, fallback, retryCount + 1);
      }
      this.addTrace(null, "System Kernel", "FALLBACK_TRIGGERED: Model unavailable. Using heuristic estimator.", "FAILURE", { error: error?.message });
      return fallback;
    }
  }

  private initializeResources() {
    const types: Resource["type"][] = ["AMBULANCE", "RESCUE_TEAM", "POLICE", "FIRE_TRUCK", "DRONE", "GENERATOR"];
    for (let i = 0; i < 20; i++) {
      this.resources.push({
        id: `res-${i}`,
        name: `${types[i % types.length]} ${i + 1}`,
        type: types[i % types.length],
        status: "AVAILABLE",
        location: {
          lat: 31.5204 + (Math.random() - 0.5) * 0.05,
          lng: 74.3587 + (Math.random() - 0.5) * 0.05,
        }
      });
    }
  }

  private initializeTraffic() {
    for (let i = 0; i < 150; i++) {
        this.trafficPoints.push({
            lat: 31.5204 + (Math.random() - 0.5) * 0.08,
            lng: 74.3587 + (Math.random() - 0.5) * 0.08,
            intensity: Math.random()
        });
    }
  }

  public async ingestSignal(signal: Signal) {
    if (!signal.location) {
      signal.location = { lat: 31.5204, lng: 74.3587 }; // Default to Lahore center
    }
    this.signals.push(signal);
    this.addTrace(null, "Supervisor Agent", `INGESTION_FLOW_START: Signal-ID [${signal.id.substring(0, 8)}]`, "START", { 
      category: signal.category, 
      contentPreview: signal.content.substring(0, 30) 
    });
    
    // 1. Logic Routing via Supervisor
    this.addTrace(null, "Supervisor Agent", "DELEGATING: Signal to Credibility Engine", "DELEGATE");
    const credibility = await this.runCredibilityAgent(signal);
    
    if (credibility.isSpam || credibility.score < 0.3) {
      this.addTrace(null, "Credibility Agent", `SIGNAL_REJECTED: Low confidence (${credibility.score.toFixed(2)}) - ${credibility.reason}`, "FAILURE", credibility);
      return;
    }
    
    this.addTrace(null, "Credibility Agent", `SIGNAL_VERIFIED: Confidence score ${credibility.score.toFixed(2)}`, "SUCCESS", credibility);

    // 2. Classification delegation
    this.addTrace(null, "Supervisor Agent", "DELEGATING: Verified signal to Classification Specialist", "DELEGATE");
    const classification = await this.runClassificationAgent(signal);
    this.addTrace(null, "Classification Agent", `CRISIS_DETECTED: Class [${classification.type}] Severity [${classification.severity}]`, "SUCCESS", classification);

    // 3. Crisis Identity Management
    let crisis = this.findMatchingCrisis(signal, classification);
    const isUpdate = !!crisis;

    if (!crisis) {
      crisis = {
        id: uuidv4(),
        type: classification.type,
        title: `${classification.type} Incident`,
        description: classification.description,
        status: "DETECTED",
        severity: classification.severity,
        confidence: classification.confidence,
        affectedPopulation: classification.affectedPopulation,
        radius: classification.radius,
        startTime: new Date().toISOString(),
        location: signal.location,
        signals: [signal.id],
        agents: [],
        resources: [],
        impact: {
          before: { riskScore: 0, estimatedCasualties: 0, congestionLevel: 0 },
          after: { riskScore: 0, estimatedCasualties: 0, congestionLevel: 0, improvement: 0 }
        },
        reasoning: {
            inference: classification.inference || "Initial situation assessment",
            explanation: classification.explanation || "Signal pattern indicates anomaly",
            confidence: classification.confidence
        },
        recommendations: classification.recommendations || [],
        actionsTaken: ["SIGNAL_FUSION_COMPLETED"]
      };
      this.crises.set(crisis.id, crisis);
      this.addTrace(crisis.id, "Supervisor Agent", "SYSTEM_ACTION: New Incident Identity initialized.", "INFO");
    } else {
      crisis.signals.push(signal.id);
      this.addTrace(crisis.id, "Supervisor Agent", `SYSTEM_ACTION: Appending signal vector to existing incident ${crisis.id.substring(0, 8)}`, "INFO");
      
      // Update reasoning with fused data
      crisis.reasoning = {
        inference: classification.inference || crisis.reasoning?.inference || "",
        explanation: classification.explanation || crisis.reasoning?.explanation || "",
        confidence: (crisis.confidence + classification.confidence) / 2
      };
      crisis.recommendations = Array.from(new Set([...(crisis.recommendations || []), ...(classification.recommendations || [])]));
    }

    // 4. Parallel Analysis
    this.addTrace(crisis.id, "Supervisor Agent", "ORCHESTRATING: Strategic specialists (Forecast, Resource, Simulation)", "INFO");
    
    const [forecast, allocations, simulation] = await Promise.all([
      this.runForecastAgent(crisis),
      this.runResourceAgent(crisis),
      this.runSimulationAgent(crisis, []) // Pre-allocation simulation
    ]);

    this.addTrace(crisis.id, "Forecast Agent", `PREDICTION: Escalation risk is ${(forecast.escalationProb * 100).toFixed(0)}%. Secondary: ${forecast.secondaryRisks?.[0] || 'None'}`, "SUCCESS", forecast);
    
    crisis.resources = allocations;
    this.addTrace(crisis.id, "Resource Agent", `OPTIMIZATION: Allocated ${allocations.length} responders based on proximity/severity.`, "SUCCESS", allocations);

    const postSimulation = await this.runSimulationAgent(crisis, allocations);
    crisis.impact = postSimulation;
    this.addTrace(crisis.id, "Simulation Agent", `OUTCOME_PREDICTION: Action vector results in ${(postSimulation.after.improvement * 100).toFixed(0)}% risk reduction.`, "SUCCESS", postSimulation);

    // 5. Comms
    const messages = await this.runMessagingAgent(crisis);
    this.addTrace(crisis.id, "Messaging Agent", `COMMUNICATIONS: Dispatched ${messages.length} targeted alerts across stakeholder mesh.`, "SUCCESS", messages);

    crisis.actionsTaken = Array.from(new Set([
        ...(crisis.actionsTaken || []),
        "RESOURCE_DISPATCH_AUTHORIZED",
        "TRAFFIC_REROUTING_INITIATED",
        "PUBLIC_ALERT_BROADCASTED"
    ]));

    crisis.status = "ACTIVE";
    this.broadcastUpdate();
  }

  private async runCredibilityAgent(signal: Signal) {
    const prompt = `Evaluate the credibility of this emergency signal. Support multilingual inputs (Urdu/English).
      Signal: ${JSON.stringify(signal)}
      Return JSON: { score: number (0-1), reason: string, isSpam: boolean, isConflicting: boolean }`;
    
    return this.safeGenerateContent(prompt, {
      score: signal.confidence * signal.sourceReliability,
      reason: "Heuristic estimation due to system load",
      isSpam: false,
      isConflicting: false
    });
  }

  private async runClassificationAgent(signal: Signal) {
    const prompt = `Classify this crisis based on the signal. Support multilingual inputs (Urdu/English).
      Signal: ${JSON.stringify(signal)}
      Return JSON: { 
        type: CrisisType, 
        severity: SeverityLevel, 
        description: string, 
        confidence: number, 
        affectedPopulation: number, 
        radius: number,
        inference: string,
        explanation: string,
        recommendations: string[]
      }
      CrisisType: FLOOD, HEATWAVE, ACCIDENT, INFRASTRUCTURE_FAILURE, DISEASE_OUTBREAK, POWER_OUTAGE, PUBLIC_DISORDER, FIRE, CHEMICAL_HAZARD
      SeverityLevel: LOW, MEDIUM, HIGH, CRITICAL`;

    return this.safeGenerateContent(prompt, {
      type: signal.content.toLowerCase().includes("flood") || signal.content.includes("pani") ? CrisisType.FLOOD : CrisisType.ACCIDENT,
      severity: SeverityLevel.MEDIUM,
      description: signal.content,
      confidence: 0.7,
      affectedPopulation: 2500,
      radius: 500,
      inference: "Potential situation detected",
      explanation: "Analyzing patterns",
      recommendations: ["Monitor situation"]
    });
  }

  private async runForecastAgent(crisis: Crisis) {
    const prompt = `Predict the escalation and impact of this crisis.
      Crisis: ${JSON.stringify(crisis)}
      Return JSON: { escalationProb: number, temporalTrend: string, secondaryRisks: string[] }`;

    return this.safeGenerateContent(prompt, {
      escalationProb: 0.3,
      temporalTrend: "STABLE",
      secondaryRisks: ["Congestion"]
    });
  }

  private async runResourceAgent(crisis: Crisis): Promise<Allocation[]> {
    const available = this.resources.filter(r => r.status === "AVAILABLE");
    
    // Applying resource availability scaling
    const densityAdjustedCount = Math.floor(available.length * this.settings.resourceAvailability);
    const usablePool = available.slice(0, densityAdjustedCount);

    const needed = crisis.severity === "CRITICAL" ? 5 : crisis.severity === "HIGH" ? 3 : 1;
    const selected = usablePool.slice(0, needed);
    
    return selected.map(r => {
      r.status = "DEPLOYED";
      return {
        resourceId: r.id,
        crisisId: crisis.id,
        assignedAt: new Date().toISOString(),
        estimatedArrival: new Date(Date.now() + (15 / this.settings.timeCompression) * 60000).toISOString()
      };
    });
  }

  private async runSimulationAgent(crisis: Crisis, allocations: Allocation[]) {
    const prompt = `Simulate the impact of response actions.
      Crisis: ${JSON.stringify(crisis)}
      Allocations: ${JSON.stringify(allocations)}
      Return JSON: { before: { riskScore, estimatedCasualties, congestionLevel }, after: { riskScore, estimatedCasualties, congestionLevel, improvement } }`;

    const baseline = {
      before: { riskScore: 0.8, estimatedCasualties: 12, congestionLevel: 0.7 },
      after: { riskScore: 0.4, estimatedCasualties: 2, congestionLevel: 0.3, improvement: 0.5 }
    };

    return this.safeGenerateContent(prompt, baseline);
  }

  private async runMessagingAgent(crisis: Crisis) {
    const prompt = `Generate stakeholder alerts for this crisis.
      Crisis: ${JSON.stringify(crisis)}
      Return JSON: { alerts: Array<{ recipient: string, priority: string, message: string }> }`;

    return (await this.safeGenerateContent(prompt, { 
      alerts: [{ recipient: "Authorities", priority: "HIGH", message: `Active Incident: ${crisis.title}` }] 
    })).alerts || [];
  }

  private findMatchingCrisis(signal: Signal, classification: any): Crisis | undefined {
    // Spatial search for existing crisis within 1km
    return Array.from(this.crises.values()).find(c => {
      const dist = this.getDistance(c.location, signal.location);
      return dist < 1000 && c.type === classification.type && c.status !== "RESOLVED";
    });
  }

  private getDistance(l1: {lat: number, lng: number}, l2: {lat: number, lng: number}) {
    const earthRadius = 6371000;
    const dLat = (l2.lat - l1.lat) * Math.PI / 180;
    const dLng = (l2.lng - l1.lng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(l1.lat * Math.PI / 180) * Math.cos(l2.lat * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadius * c;
  }

  private severityToNumber(s: SeverityLevel): number {
    const map = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };
    return map[s] || 0;
  }

  private addTrace(crisisId: string | null, agentName: string, message: string, status: TraceEntry["status"], data: any = null) {
    const entry: TraceEntry = {
      id: uuidv4(),
      crisisId,
      agentName,
      timestamp: new Date().toISOString(),
      message,
      status,
      data
    };
    
    if (crisisId) {
      const crisis = this.crises.get(crisisId);
      if (crisis) crisis.agents.unshift(entry);
    }
    
    this.broadcastUpdate("TRACE", { crisisId, entry });
  }

  private broadcastUpdate(type: string = "STATE", payload: any = null) {
    this.onUpdate({
      type,
      payload,
      state: {
        crises: Array.from(this.crises.values()),
        resources: this.resources,
        signals: this.signals,
        trafficPoints: this.trafficPoints
      }
    });
  }

  public updateSettings(settings: Partial<SystemSettings>) {
    this.settings = { ...this.settings, ...settings };
    this.broadcastUpdate();
  }

  public getState() {
    return {
      crises: Array.from(this.crises.values()),
      resources: this.resources,
      signals: this.signals,
      settings: this.settings,
      trafficPoints: this.trafficPoints
    };
  }

  public resetSimulation() {
    this.crises.clear();
    this.signals = [];
    this.resources.forEach(r => r.status = "AVAILABLE");
    this.broadcastUpdate();
  }
}
