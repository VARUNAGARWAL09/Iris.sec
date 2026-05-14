import { useState, useCallback } from 'react';
import { mlClient } from '@/services/mlClient';

export function useMLInference() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performInference = useCallback(async (method: keyof typeof mlClient, ...args: any[]) => {
    setLoading(true);
    setError(null);
    try {
      console.log(`ML Inference started: ${method}`, args);
      const result = await (mlClient[method] as Function)(...args);
      console.log(`ML Inference success: ${method}`, result);
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown ML inference error';
      setError(msg);
      console.error(`ML Inference Error [${method}]:`, err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getAdaptiveRisk: (payload: any) => performInference('getAdaptiveRisk', payload),
    predictSLA: (payload: any) => performInference('predictSLA', payload),
    recognizeIntent: (query: string, context?: any) => performInference('recognizeIntent', query, context),
    correlateIncidents: (id: string, desc: string, hist: any[]) => performInference('correlateIncidents', id, desc, hist),
    detectAnomalies: (id: string, type: string, feat: any, base: any[]) => performInference('detectAnomalies', id, type, feat, base),
    predictMitre: (techs: string[]) => performInference('predictMitre', techs),
    classifyThreat: (title: string, desc: string) => performInference('classifyThreat', title, desc),
  };
}
