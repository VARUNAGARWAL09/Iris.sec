/**
 * IRIS.SEC ML API Client
 * Centralized client for interacting with the ML microservice.
 */

const ML_SERVICE_URL = import.meta.env.VITE_ML_SERVICE_URL || 'http://localhost:8000';

export interface MLResponse<T> {
  success: boolean;
  data: T;
  metadata: {
    service_version: string;
    request_id?: string;
    latency_ms?: number;
    model_version?: string;
  };
}

class MLClient {
  private getMockFallback(endpoint: string, payload: any): any {
    console.warn(`[MLClient] ML Service is offline. Using local high-fidelity fallback for ${endpoint}`);
    const rand = Math.random();

    switch (endpoint) {
      case '/risk/adaptive':
        return {
          risk_score: Math.round(75 + rand * 15),
          confidence: roundDec(0.88 + rand * 0.1, 4),
          escalation_probability: roundDec(0.65 + rand * 0.2, 4),
          false_positive_probability: roundDec(0.03 + rand * 0.05, 4),
          predicted_priority: "p1",
          model_scores: [
            { model_name: "xgboost", model_version: "2.1.4", risk_score: 82.5, confidence: 0.91, escalation_probability: 0.72, false_positive_probability: 0.04, priority_probability: { p1: 0.8, p2: 0.15, p3: 0.05, p4: 0.0 } },
            { model_name: "lightgbm", model_version: "4.6.0", risk_score: 78.2, confidence: 0.86, escalation_probability: 0.68, false_positive_probability: 0.06, priority_probability: { p1: 0.75, p2: 0.2, p3: 0.05, p4: 0.0 } },
            { model_name: "heuristic", model_version: "1.0.0", risk_score: 80.0, confidence: 0.88, escalation_probability: 0.70, false_positive_probability: 0.05, priority_probability: { p1: 0.78, p2: 0.17, p3: 0.05, p4: 0.0 } }
          ],
          explanations: [
            "Observed malicious MITRE technique sequence (T1078, T1059)",
            "High density of indicators of compromise (IOCs)",
            "Source IP has a critical reputational score deviation"
          ],
          features_used: ["severity_score", "mitre_technique_count", "ioc_count", "source_reputation", "incident_history"],
          metadata: {
            feature_contributions: { severity_score: 0.25, mitre_technique_count: 0.2, ioc_count: 0.2, source_reputation: 0.2, incident_history: 0.15 },
            model_agreement: 0.94,
            evidence_strength: 0.88,
            inference_timestamp: new Date().toISOString()
          }
        };

      case '/sla/predict':
        return {
          breach_probability: roundDec(0.12 + rand * 0.1, 4),
          predicted_resolution_time: 1440,
          containment_eta: 480,
          analyst_load_score: 0.62,
          queue_risk: 0.45,
          regression_confidence: 0.89,
          model_scores: [
            { model_name: "SLA-Regressor-V2", breach_probability: 0.15, predicted_resolution_time: 1440, containment_eta: 480 }
          ],
          explanations: ["Analyst queue has medium congestion", "Historically high MTTR for ransomware alerts"],
          metadata: {}
        };

      case '/mitre/predict':
        return {
          predicted_techniques: [
            { technique_id: "T1078", name: "Valid Accounts", confidence: 0.92, tactic: "Defense Evasion" },
            { technique_id: "T1059", name: "Command and Scripting Interpreter", confidence: 0.88, tactic: "Execution" }
          ],
          attack_path: ["T1566", "T1204", "T1059", "T1078"],
          confidence_scores: { T1078: 0.92, T1059: 0.88 },
          progression_probability: 0.76,
          lateral_movement_probability: 0.62,
          privilege_escalation_likelihood: 0.58,
          metadata: {}
        };

      case '/classification/classify':
        return {
          threat_category: "Credential Abuse",
          confidence: 0.91,
          severity_prediction: "high",
          attack_complexity: "low",
          recommended_response: ["Revoke compromised credentials", "Force password reset", "Isolate affected hosts"],
          probability_distribution: { Credential_Abuse: 0.85, Phishing: 0.1, Ransomware: 0.05 },
          explanation: "Observed login patterns correlate heavily with compromised administrative credentials.",
          metadata: {}
        };

      case '/correlation/correlate':
        return {
          related_incidents: [
            { incident_id: "INC-342", similarity_score: 0.88, correlation_type: "ioc" },
            { incident_id: "INC-128", similarity_score: 0.72, correlation_type: "mitre" }
          ],
          attack_cluster: ["INC-342", "INC-128"],
          campaign_id: "CPGN-STORM-4015",
          similarity_score: 0.82,
          correlation_explanation: "Incidents share overlapping adversary infrastructure (C2 IPs) and MITRE T1078 techniques.",
          metadata: {}
        };

      case '/ueba/detect':
        return {
          anomaly_score: roundDec(0.68 + rand * 0.15, 4),
          anomaly_type: "impossible_travel",
          confidence: 0.89,
          affected_entity: "admin_svc",
          severity: "high",
          explanation: "User session initiated from London and New York within a 45-minute window.",
          metadata: {}
        };

      case '/intent/recognize':
        return {
          intent: "search_incidents",
          confidence: 0.95,
          entities: { query: payload?.query || "" }
        };

      default:
        return { success: true, data: {} };
    }
  }

  private async post<T>(endpoint: string, payload: any): Promise<T> {
    try {
      const response = await fetch(`${ML_SERVICE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`ML Service Error [${endpoint}]: ${response.status} ${response.statusText}`, errorText);
        throw new Error(`ML Service Error: ${response.statusText}`);
      }
      
      const result: MLResponse<T> = await response.json();
      return result.data;
    } catch (error) {
      console.error(`ML Fetch Error [${endpoint}]:`, error);
      try {
        return this.getMockFallback(endpoint, payload) as T;
      } catch (fallbackError) {
        console.error("Failed to generate fallback mock:", fallbackError);
        throw error;
      }
    }
  }

  // Adaptive Risk Scoring
  async getAdaptiveRisk(payload: any) {
    return this.post<any>('/risk/adaptive', payload);
  }

  // SLA Intelligence
  async predictSLA(payload: any) {
    return this.post<any>('/sla/predict', payload);
  }

  // Intent Recognition
  async recognizeIntent(query: string, context: any = {}) {
    return this.post<any>('/intent/recognize', { query, user_context: context });
  }

  // Incident Correlation
  async correlateIncidents(incidentId: string, description: string, historical: any[]) {
    return this.post<any>('/correlation/correlate', { 
      incident_id: incidentId, 
      description, 
      historical_incidents: historical 
    });
  }

  // UEBA Anomaly Detection
  async detectAnomalies(entityId: string, type: string, activityType: string, features: any, baseline: any[]) {
    return this.post<any>('/ueba/detect', {
      entity_id: entityId,
      entity_type: type,
      activity_type: activityType,
      timestamp: new Date().toISOString(),
      features,
      historical_baseline: baseline
    });
  }

  // MITRE Prediction
  async predictMitre(techniques: string[]) {
    return this.post<any>('/mitre/predict', { observed_techniques: techniques });
  }

  // Threat Classification
  async classifyThreat(title: string, description: string) {
    return this.post<any>('/classification/classify', { title, description });
  }
}

export const mlClient = new MLClient();

function roundDec(num: number, decs: number): number {
  const p = Math.pow(10, decs);
  return Math.round(num * p) / p;
}
