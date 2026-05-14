import { supabase } from '@/integrations/supabase/client';
import { EnrichedData } from '../threat-intel/EnrichmentService';

export interface ResponseAction {
    actionType: 'block_ip' | 'escalate_incident' | 'trigger_playbook' | 'quarantine_host';
    target: string;
    reason: string;
    status: 'success' | 'failed';
}

/**
 * Automates response actions based on threat intelligence and severity.
 */
export async function executeAutomatedResponse(
    alertId: string, 
    severity: string, 
    intel: EnrichedData,
    rawData: any
): Promise<ResponseAction[]> {
    const actions: ResponseAction[] = [];

    // Rule 1: Auto-block IPs with high AbuseIPDB score or malicious VT rating
    if (intel.ip_reputation_score && intel.ip_reputation_score > 80) {
        // Mocking real firewall integration
        console.log(`[Response Engine] 🛡️ Auto-blocking IP due to high risk score: ${intel.ip_reputation_score}`);
        actions.push({
            actionType: 'block_ip',
            target: 'Firewall',
            reason: `IP Reputation Score is ${intel.ip_reputation_score} > 80`,
            status: 'success'
        });
    }

    if (intel.domain_reputation === 'malicious' || intel.hash_reputation === 'malicious') {
        console.log(`[Response Engine] 🛡️ Auto-quarantine triggered due to malicious IoC`);
        actions.push({
            actionType: 'quarantine_host',
            target: 'EDR',
            reason: 'Malicious domain/hash detected via VirusTotal',
            status: 'success'
        });
    }

    // Rule 2: Auto-escalate critical severity
    if (severity === 'critical') {
        console.log(`[Response Engine] 📈 Auto-escalating incident. Severity: ${severity}`);
        actions.push({
            actionType: 'escalate_incident',
            target: 'Incident Response Team',
            reason: 'Critical severity',
            status: 'success'
        });
    }

    // Rule 3: Trigger identity playbook for authentication-related alerts
    const rawText = JSON.stringify(rawData || {}).toLowerCase();
    if (rawText.includes('brute') || rawText.includes('login')) {
         console.log(`[Response Engine] 📖 Triggering Automated Identity Playbook`);
         actions.push({
            actionType: 'trigger_playbook',
            target: 'Identity Protection Playbook',
            reason: 'Authentication-related threat pattern detected',
            status: 'success'
        });
    }

    // Log the automated actions taken
    if (actions.length > 0) {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            await supabase.from('audit_logs').insert(
                actions.map(action => ({
                    action: 'automated_response',
                    entity_type: 'alert',
                    entity_id: alertId,
                    entity_name: `Automated Action: ${action.actionType}`,
                    user_id: user?.id || null,
                    user_email: 'system@response-engine.local',
                    details: action as any
                }))
            );
        } catch (e) {
            console.error('Failed to log automated response actions', e);
        }
    }

    return actions;
}
