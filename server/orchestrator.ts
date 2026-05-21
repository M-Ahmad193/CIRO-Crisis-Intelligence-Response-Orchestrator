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
import { withRetry } from "./aiUtils";
import { CredibilityPipeline } from "./credibilityPipeline";
import { getGroqClient, GROQ_MODEL } from "./groqClient";

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
    }, 2000); 
  }

  private updateSimulationState() {
    let stateChanged = false;

    this.resources.forEach(res => {
      if (res.status === "DEPLOYED") {
        const allocation = Array.from(this.crises.values()).map(c => c)[0];

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

  private async safeGenerateContent(prompt: string, fallback: any): Promise<any> {
    const groq = getGroqClient();
    try {
      const completion = await withRetry(() => groq.chat.completions.create({
        model: GROQ_MODEL,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      }), 2, 5000);
      
      const content = completion.choices[0]?.message?.content || "{}";
      return JSON.parse(content);
    } catch (error: any) {
      this.addTrace(null, "System Kernel", "FALLBACK_TRIGGERED: Groq model unavailable. Using heuristic estimator.", "FAILURE", { error: error?.message });
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

    // 2. Fused Analysis (Consolidated to save quota)
    this.addTrace(null, "Supervisor Agent", "DELEGATING: Signal fusion to Strategic AI Kernel", "DELEGATE");
    
    const fusedPrompt = `Analyze this verified emergency signal and perform a full strategic assessment.
    
    Signal: ${JSON.stringify(signal)}
    Credibility Context: ${JSON.stringify(credibility)}
    
    Tasks:
    1. Classification: Identify CrisisType and Severity.
    2. Escalation Forecasting: Probability of spread and secondary risks.
    3. Outcome Simulation: Predictive impact analysis (risk score, casualties, congestion).
    4. Strategic Comms: Dispatch multi-stakeholder alerts.
    
    Return JSON strictly in this format:
    {
      "classification": { 
        "type": "FIRE" | "FLOOD" | "ACCIDENT" | etc, 
        "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL", 
        "description": "string",
        "affectedPopulation": number,
        "radius": number,
        "inference": "string",
        "explanation": "string",
        "recommendations": ["string"]
      },
      "forecast": { "escalationProb": number, "secondaryRisks": ["string"] },
      "impact": { 
        "before": { "riskScore": number, "estimatedCasualties": number, "congestionLevel": number },
        "after": { "riskScore": number, "estimatedCasualties": number, "congestionLevel": number, "improvement": number }
      },
      "alerts": [{ "recipient": "string", "priority": "string", "message": "string", "isGeoFenced": boolean, "radius": number }]
    }`;

    const analysis = await this.safeGenerateContent(fusedPrompt, {
      classification: { 
        type: signal.content.toLowerCase().includes("flood") ? CrisisType.FLOOD : CrisisType.ACCIDENT,
        severity: SeverityLevel.HIGH,
        description: signal.content,
        affectedPopulation: 1000,
        radius: 300,
        inference: "Heuristic classification",
        explanation: "API Quota limited fallback",
        recommendations: ["Monitor situation"]
      },
      forecast: { escalationProb: 0.2, secondaryRisks: [] },
      impact: {
        before: { riskScore: 0.7, estimatedCasualties: 5, congestionLevel: 0.5 },
        after: { riskScore: 0.3, estimatedCasualties: 1, congestionLevel: 0.2, improvement: 0.4 }
      },
      alerts: [{ recipient: "Authorities", priority: "HIGH", message: "Signal detected", isGeoFenced: false, radius: 0 }]
    });

    const classification = analysis.classification;

    // 3. Crisis Identity Management
    let crisis = this.findMatchingCrisis(signal, classification);

    if (!crisis) {
      crisis = {
        id: uuidv4(),
        type: classification.type,
        title: `${classification.type} Incident`,
        description: classification.description,
        status: "DETECTED",
        severity: classification.severity,
        confidence: 0.9,
        affectedPopulation: classification.affectedPopulation,
        radius: classification.radius,
        startTime: new Date().toISOString(),
        location: signal.location,
        signals: [signal.id],
        agents: [],
        resources: [],
        impact: analysis.impact,
        reasoning: {
            inference: classification.inference,
            explanation: classification.explanation,
            confidence: 0.9
        },
        credibility: {
          score: credibility.score,
          reason: credibility.reason,
          reliabilityFlags: credibility.reliabilityFlags || [],
          misinformationLikelihood: credibility.misinformationLikelihood || "LOW",
          analysis: credibility.analysis
        },
        recommendations: classification.recommendations || [],
        actionsTaken: ["SIGNAL_FUSION_COMPLETED"],
        blockedRoutes: []
      };
      this.crises.set(crisis.id, crisis);
      this.addTrace(crisis.id, "Supervisor Agent", "SYSTEM_ACTION: New Incident Identity initialized.", "INFO");
    } else {
      crisis.signals.push(signal.id);
      crisis.impact = analysis.impact;
      crisis.recommendations = Array.from(new Set([...(crisis.recommendations || []), ...(classification.recommendations || [])]));
    }

    // 4. Resource Allocation (Heuristic - no quota cost)
    const allocations = await this.runResourceAgent(crisis);
    crisis.resources = allocations;
    this.addTrace(crisis.id, "Resource Agent", `OPTIMIZATION: Allocated ${allocations.length} responders.`, "SUCCESS", allocations);

    // 5. Apply Fused Outcomes
    crisis.messaging = analysis.alerts;
    this.addTrace(crisis.id, "Forecast Agent", `PREDICTION: Escalation risk is ${(analysis.forecast.escalationProb * 100).toFixed(0)}%.`, "SUCCESS", analysis.forecast);
    this.addTrace(crisis.id, "Messaging Agent", `COMMUNICATIONS: Dispatched ${analysis.alerts.length} alerts.`, "SUCCESS", analysis.alerts);

    crisis.status = "ACTIVE";
    this.broadcastUpdate();
  }

  private async runCredibilityAgent(signal: Signal) {
    return CredibilityPipeline.analyze(signal, this.signals);
  }

  private async runClassificationAgent(signal: Signal) {
    const isFlood = signal.content.toLowerCase().includes("flood") || signal.content.includes("pani");
    
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
      type: isFlood ? CrisisType.FLOOD : CrisisType.ACCIDENT,
      severity: SeverityLevel.HIGH,
      description: signal.content,
      confidence: 0.9,
      affectedPopulation: 2500,
      radius: 500,
      inference: isFlood ? "Urban flooding (G-10/ George Town)" : "Potential situation detected",
      explanation: isFlood ? "Impact: Traffic blocked, Vehicles stranded" : "Analyzing patterns",
      recommendations: isFlood 
        ? ["Redirect traffic via alternate routes", "Dispatch emergency services"] 
        : ["Monitor situation"]
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
    
    // Calculate traffic-aware travel time for each potential resource
    const candidates = usablePool.map(res => {
      const distance = this.getDistance(res.location, crisis.location);
      // Rough traffic weight: find traffic points near the path/resource
      const nearbyTraffic = this.trafficPoints.filter(tp => this.getDistance(tp, res.location) < 1000);
      const avgTrafficIntensity = nearbyTraffic.length > 0 
        ? nearbyTraffic.reduce((sum, tp) => sum + tp.intensity, 0) / nearbyTraffic.length 
        : 0.2; // Baseline traffic
      
      // Travel time estimation (simple)
      const baseSpeed = 15; // m/s
      const trafficImpedance = 1 + (avgTrafficIntensity * 2); // Up to 3x slower
      const estimatedTravelTimeSeconds = (distance / baseSpeed) * trafficImpedance;
      
      return { res, distance, estimatedTravelTimeSeconds, avgTrafficIntensity };
    });

    // Sort by estimated arrival time
    candidates.sort((a, b) => a.estimatedTravelTimeSeconds - b.estimatedTravelTimeSeconds);
    const selected = candidates.slice(0, needed);
    
    return selected.map(c => {
      const r = c.res;
      r.status = "DEPLOYED";
      return {
        resourceId: r.id,
        crisisId: crisis.id,
        assignedAt: new Date().toISOString(),
        estimatedArrival: new Date(Date.now() + (c.estimatedTravelTimeSeconds / this.settings.timeCompression) * 1000).toISOString()
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
    const prompt = `Generate stakeholder and public alerts for this crisis. 
      Enable geo-fenced alert propagation for users within the impact radius.
      
      Crisis Context:
      - Title: ${crisis.title}
      - Location: ${crisis.location.lat}, ${crisis.location.lng}
      - Radius: ${crisis.radius} meters
      - Severity: ${crisis.severity}
      
      Return JSON: { 
        alerts: Array<{ 
          recipient: string, 
          priority: string, 
          message: string, 
          isGeoFenced: boolean,
          radius: number 
        }> 
      }`;

    const baseline = { 
      alerts: [
        { 
          recipient: "Authorities", 
          priority: "HIGH", 
          message: `Active Incident: ${crisis.title}`,
          isGeoFenced: false,
          radius: 0
        },
        {
          recipient: "Public (Local)",
          priority: "CRITICAL",
          message: `URGENT: ${crisis.title} detected in your area. Please follow evacuation protocols.`,
          isGeoFenced: true,
          radius: crisis.radius
        }
      ] 
    };

    const result = await this.safeGenerateContent(prompt, baseline);
    return result.alerts || baseline.alerts;
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
