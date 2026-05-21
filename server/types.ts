export enum SignalCategory {
  SOCIAL_MEDIA = "SOCIAL_MEDIA",
  WEATHER = "WEATHER",
  TRAFFIC = "TRAFFIC",
  EMERGENCY_CALL = "EMERGENCY_CALL",
  IOT_SENSOR = "IOT_SENSOR",
  FIELD_REPORT = "FIELD_REPORT"
}

export interface Signal {
  id: string;
  timestamp: string;
  category: SignalCategory;
  content: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  confidence: number;
  sourceReliability: number;
  urgencyScore?: number;
  velocityScore?: number;
  isSpam?: boolean;
  isDuplicate?: boolean;
  sourceTrustScore?: number;
  metadata?: Record<string, any>;
}

export enum CrisisType {
  FLOOD = "FLOOD",
  HEATWAVE = "HEATWAVE",
  ACCIDENT = "ACCIDENT",
  INFRASTRUCTURE_FAILURE = "INFRASTRUCTURE_FAILURE",
  DISEASE_OUTBREAK = "DISEASE_OUTBREAK",
  POWER_OUTAGE = "POWER_OUTAGE",
  PUBLIC_DISORDER = "PUBLIC_DISORDER",
  FIRE = "FIRE",
  CHEMICAL_HAZARD = "CHEMICAL_HAZARD"
}

export enum SeverityLevel {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL"
}

export interface Crisis {
  id: string;
  type: CrisisType;
  title: string;
  description: string;
  status: "DETECTED" | "VERIFYING" | "ACTIVE" | "CONTAINED" | "RESOLVED" | "FALSE_ALARM";
  severity: SeverityLevel;
  confidence: number;
  affectedPopulation: number;
  radius: number; // in meters
  startTime: string;
  location: {
    lat: number;
    lng: number;
  };
  signals: string[]; // signal IDs
  agents: TraceEntry[];
  resources: Allocation[];
  impact: SimulationResult;
  reasoning?: {
    inference: string;
    explanation: string;
    confidence: number;
  };
  credibility?: {
    score: number;
    reason?: string;
    reliabilityFlags: string[];
    misinformationLikelihood: "LOW" | "MEDIUM" | "HIGH";
    analysis?: {
      urgencyScore: number;
      velocityValue: number;
      isSpam: boolean;
      isDuplicate: boolean;
      hasContradictions: boolean;
      sourceTrust: number;
      geoConfidence: number;
      botLikelihood: number;
    };
  };
  messaging?: Array<{
    recipient: string;
    priority: string;
    message: string;
    isGeoFenced: boolean;
    radius: number;
  }>;
  recommendations?: string[];
  actionsTaken?: string[];
  blockedRoutes?: Array<{
    points: [number, number][];
    color: string;
  }>;
}

export interface TraceEntry {
  id: string;
  crisisId?: string | null;
  agentName: string;
  timestamp: string;
  message: string;
  status: "START" | "INFO" | "SUCCESS" | "FAILURE" | "DELEGATE";
  data?: any;
}

export interface Resource {
  id: string;
  name: string;
  type: "AMBULANCE" | "RESCUE_TEAM" | "POLICE" | "FIRE_TRUCK" | "DRONE" | "GENERATOR";
  status: "AVAILABLE" | "DEPLOYED" | "MAINTENANCE";
  location: {
    lat: number;
    lng: number;
  };
}

export interface Allocation {
  resourceId: string;
  crisisId: string;
  assignedAt: string;
  estimatedArrival: string;
}

export interface SimulationResult {
  before: {
    riskScore: number;
    estimatedCasualties: number;
    congestionLevel: number;
  };
  after: {
    riskScore: number;
    estimatedCasualties: number;
    congestionLevel: number;
    improvement: number;
  };
}

export interface SystemSettings {
  timeCompression: number; // 1x, 2x, 5x, etc.
  resourceAvailability: number; // 0 to 1 scaling factor
  autoResourceAllocation: boolean;
}

export interface TrafficPoint {
  lat: number;
  lng: number;
  intensity: number;
}
