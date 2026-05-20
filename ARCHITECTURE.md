# CIRO — Crisis Intelligence & Response Orchestrator Architecture

## Agent Architecture: Google Antigravity

CIRO uses a hierarchical multi-agent orchestration framework powered by Google Gemini models, referred to as **Antigravity**.

### Supervisor Agent
- **Role**: Central Orchestrator.
- **Responsibilities**: 
  - Routes incoming signals to specialists.
  - Manages incident lifecycle (Detection -> Active -> Resolution).
  - Prioritizes simultaneous crises.
  - Handles conflicts between agent outputs.

### Specialist Agents
1. **Signal Fusion Agent**: Merges fragmented signals from Social Media, IoT, Weather, and Field reports into a unified incident vector.
2. **Credibility Agent**: Analyzes urgency, sentiment, and source reliability. Flags misinformation or conflicting narratives.
3. **Classification Agent**: Categorizes the crisis (Flood, Fire, etc.) and determines the baseline severity (LOW to CRITICAL).
4. **Severity Forecast Agent**: Predicts the escalation path using temporal data and secondary risk analysis.
5. **Resource Allocator Agent**: Optimizes the deployment of the Responder Fleet (Ambulances, Rescue Teams, etc.) based on proximity and incident priority.
6. **Simulation Agent**: Executes "What-If" scenarios to predict the outcome of response actions before they are finalized.
7. **Stakeholder Messaging Agent**: Generates targeted, multilingual alerts for Citizens, Hospitals, and Authorities.
8. **Verification & Recovery Agent**: Monitors for data corrections. If a "Flood" signal is later verified as a "Burst Pipe", this agent triggers the recovery workflow to retract alerts and reassign resources.

## Resilience & Fallback
- **Confidence Decay**: Agent confidence scores lower over time unless refreshed by new signals.
- **Degraded Mode**: If AI signals are throttled, the Supervisor falls back to a heuristic baseline for resource allocation.
- **Verification Chain**: Critical actions (like public alerts) require high confidence (>0.85) or confirmation from multiple high-reliability sources (IoT + Field Report).

## Monitoring: Traces
Every agent decision is recorded as a **Trace Entry**. These are streamed in real-time to the "Antigravity Traces" terminal in the dashboard, providing full transparency into the AI's "Chain of Reasoning".
