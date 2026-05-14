import { supabase } from '@/integrations/supabase/client';

export interface CorrelationMatch {
    type: 'same_ip' | 'same_user' | 'same_tactic' | 'temporal';
    relatedAlertIds: string[];
    riskScoreAdjustment: number;
    confidenceScore: number;
    description?: string;
}

export interface AlertCorrelation {
    alertId: string;
    correlations: CorrelationMatch[];
    isMultiStageAttack: boolean;
    aggregatedRiskScore: number;
}

/**
 * Detects correlations for a given alert using rule-based SQL queries.
 */
export async function detectCorrelations(alertId: string): Promise<AlertCorrelation | null> {
    try {
        // Fetch target alert
        const { data: targetAlert, error: targetError } = await supabase
            .from('alerts')
            .select('*')
            .eq('id', alertId)
            .single();

        if (targetError || !targetAlert) return null;

        // Base risk score (with rules/ML already applied)
        let aggregatedRiskScore = (targetAlert.raw_data as any)?.risk_score || 
            (targetAlert.raw_data as any)?.risk_adjustment?.adjusted_score || 
            50;

        const correlations: CorrelationMatch[] = [];

        // --- 1. Rule-Based Temporal Correlation (Same IP within 1 hour) ---
        const targetIP = (targetAlert.raw_data as any)?.source_ip || (targetAlert.raw_data as any)?.ip;
        let relatedByIp: any[] = [];
        
        if (targetIP) {
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
            const { data: temporalAlerts } = await supabase
                .from('alerts')
                .select('id, title, severity, raw_data')
                .neq('id', alertId)
                .gte('created_at', oneHourAgo)
                .limit(20);

            if (temporalAlerts) {
                relatedByIp = temporalAlerts.filter(a => {
                    const aIP = (a.raw_data as any)?.source_ip || (a.raw_data as any)?.ip;
                    return aIP === targetIP;
                });

                if (relatedByIp.length > 0) {
                    correlations.push({
                        type: 'temporal',
                        relatedAlertIds: relatedByIp.map(a => a.id),
                        riskScoreAdjustment: Math.min(20, relatedByIp.length * 5),
                        confidenceScore: 0.9,
                        description: `Found ${relatedByIp.length} recent alerts from same IP`
                    });
                }
            }
        }

        // --- Aggregation ---
        const isMultiStageAttack = correlations.length > 1;
        const totalAdjustment = correlations.reduce((sum, c) => sum + c.riskScoreAdjustment, 0);
        aggregatedRiskScore = Math.min(100, aggregatedRiskScore + totalAdjustment);

        // Update alert metadata non-blockingly
        if (correlations.length > 0) {
             const currentRawData = targetAlert.raw_data || {};
             supabase.from('alerts').update({
                 raw_data: {
                     ...currentRawData,
                     correlation_data: { correlations, aggregatedRiskScore, isMultiStageAttack }
                 }
             }).eq('id', alertId).then(); // fire and forget
        }

        return {
            alertId,
            correlations,
            isMultiStageAttack,
            aggregatedRiskScore
        };

    } catch (err) {
        console.error('Error in detectCorrelations:', err);
        return null;
    }
}
