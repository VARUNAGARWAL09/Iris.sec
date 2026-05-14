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
      throw error;
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
