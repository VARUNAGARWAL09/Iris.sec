import { useState, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface IntegrityResult {
  isValid: boolean;
  algorithm: string;
  hash: string;
  timestamp: string;
}

interface UseEvidenceIntegrityOptimizedResult {
  verifyIntegrity: (evidenceId: string) => Promise<IntegrityResult | null>;
  verifying: string | null;
  cachedResults: Map<string, IntegrityResult>;
  clearCache: () => void;
}

export const useEvidenceIntegrityOptimized = (): UseEvidenceIntegrityOptimizedResult => {
  const { toast } = useToast();
  const [verifying, setVerifying] = useState<string | null>(null);
  const cachedResults = useRef(new Map<string, IntegrityResult>());

  // Simulate integrity verification with caching
  const verifyIntegrity = useCallback(async (evidenceId: string): Promise<IntegrityResult | null> => {
    // Check cache first
    if (cachedResults.current.has(evidenceId)) {
      return cachedResults.current.get(evidenceId)!;
    }

    setVerifying(evidenceId);

    try {
      // Simulate API call with delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

      const algorithms = ['SHA-256', 'MD5', 'SHA-1'];
      const algorithm = algorithms[Math.floor(Math.random() * algorithms.length)];
      
      // Generate realistic hash
      const hash = Array.from({ length: 64 }, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join('');

      const result: IntegrityResult = {
        isValid: Math.random() > 0.1, // 90% chance of being valid
        algorithm,
        hash,
        timestamp: new Date().toISOString()
      };

      // Cache the result
      cachedResults.current.set(evidenceId, result);

      toast({
        title: "Integrity Check Complete",
        description: `Evidence ${evidenceId} integrity has been verified using ${algorithm}`,
      });

      return result;
    } catch (error) {
      toast({
        title: "Integrity Check Failed",
        description: "Unable to verify evidence integrity. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setVerifying(null);
    }
  }, [toast]);

  const clearCache = useCallback(() => {
    cachedResults.current.clear();
  }, []);

  return {
    verifyIntegrity,
    verifying,
    cachedResults: cachedResults.current,
    clearCache
  };
};
