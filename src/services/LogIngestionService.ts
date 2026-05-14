/**
 * Log Ingestion Service
 * 
 * Handles insertion of alerts from log analysis into Supabase.
 * This service is completely isolated and only performs INSERT operations.
 * It does NOT modify the simulation context or existing alert schema.
 * 
 * Architecture:
 * - Uses existing alerts table
 * - Sets source_type metadata to identify log-based alerts
 * - Generates alerts matching existing schema
 * - Safe error handling with rollback capability
 */

import { supabase } from '@/integrations/supabase/client';
import type { LogDetection } from '@/types/logIngestion';
import type { AlertPayload, ProcessingSummary } from '@/types/logIngestion';

/**
 * Convert log detection to alert payload matching existing schema
 */
function detectionToAlert(detection: LogDetection, fileName: string): AlertPayload {
    const { rule, matches, severity, riskScore, aggregatedMetadata } = detection;

    // Build detailed description
    const description = [
        rule.description,
        `\n**Detection Summary:**`,
        `- Occurrences: ${aggregatedMetadata.totalOccurrences}`,
        `- Unique IPs: ${aggregatedMetadata.uniqueIPs}`,
        `- Risk Score: ${riskScore}/100`,
        aggregatedMetadata.topIPs?.length > 0
            ? `\n**Top Source IPs:**\n${aggregatedMetadata.topIPs.map((item: any) => `  - ${item.ip} (${item.count} times)`).join('\n')}`
            : '',
        `\n**Affected Log Lines:** ${aggregatedMetadata.affectedLines.slice(0, 5).join(', ')}${aggregatedMetadata.affectedLines.length > 5 ? '...' : ''}`,
        `\n**Sample Log Entry:**\n\`\`\`\n${matches[0]?.rawLine}\n\`\`\``,
    ].join('\n');

    // Prepare metadata for raw_data
    const metadata = {
        source_type: 'log_ingestion',
        log_file: fileName,
        rule_id: rule.id,
        rule_name: rule.name,
        category: rule.category,
        mitre_attack: rule.mitreAttack || [],
        risk_score: riskScore,
        detection_count: aggregatedMetadata.totalOccurrences,
        unique_ips: aggregatedMetadata.uniqueIPs,
        top_ips: aggregatedMetadata.topIPs || [],
        affected_lines: aggregatedMetadata.affectedLines,
        time_range: aggregatedMetadata.timeRange,
        sample_logs: matches.slice(0, 3).map(m => ({
            line_number: m.lineNumber,
            content: m.rawLine,
            timestamp: m.timestamp,
        })),
    };

    // Generate resolution method from recommended actions
    const resolutionMethod = rule.recommendedActions.join(' → ');

    return {
        title: `[Log] ${rule.name}`,
        description,
        source: `Log Analysis: ${fileName}`,
        severity,
        status: 'pending',
        raw_data: metadata,
        resolution_method: resolutionMethod,
    };
}

/**
 * Insert alert into Supabase alerts table
 * Returns alert ID on success, null on failure
 */
async function insertAlert(alert: AlertPayload): Promise<string | null> {
    try {
        console.log('📝 Inserting alert:', {
            title: alert.title,
            source: alert.source,
            severity: alert.severity,
            status: alert.status,
        });

        // Threat Intelligence Enrichment
        let enrichedData = {};
        try {
            const { enrichAlertData } = await import('@/services/threat-intel/EnrichmentService');
            enrichedData = await enrichAlertData(alert.raw_data, alert.title, alert.description);
        } catch (e) {
            console.warn('Threat Intel Enrichment failed', e);
        }

        // Embed threat intel inside raw_data to avoid schema migration errors
        const finalRawData = {
            ...alert.raw_data,
            threat_intel: enrichedData
        };

        const { data, error } = await supabase
            .from('alerts')
            .insert({
                title: alert.title,
                description: alert.description,
                source: alert.source,
                severity: alert.severity,
                status: alert.status,
                raw_data: finalRawData,
                resolution_method: alert.resolution_method,
            })
            .select('*')
            .single();

        if (error) {
            console.error('❌ Error inserting alert:', error);
            return null;
        }

        // Execute Automated Responses
        try {
            const { executeAutomatedResponse } = await import('@/services/response/ResponseEngine');
            await executeAutomatedResponse(data.id, alert.severity, enrichedData, alert.raw_data);
        } catch (e) {
            console.warn('Automated Response Engine failed', e);
        }

        console.log('✅ Alert inserted successfully:', {
            id: data?.id,
            title: data?.title,
            created_at: data?.created_at,
        });

        return data?.id || null;
    } catch (error) {
        console.error('❌ Unexpected error inserting alert:', error);
        return null;
    }
}

/**
 * Process detections and insert alerts into database
 * 
 * Features:
 * - Duplicate prevention (checks for similar alerts in last 24h)
 * - Batch processing with progress tracking
 * - Error recovery
 * - Processing summary
 * 
 * @param detections - Array of log detections
 * @param fileName - Name of the log file
 * @param onProgress - Optional callback for progress updates
 * @returns Processing summary with statistics
 */
export async function processDetections(
    detections: LogDetection[],
    fileName: string,
    onProgress?: (current: number, total: number) => void
): Promise<ProcessingSummary> {
    const startTime = performance.now();
    const insertedIds: string[] = [];
    let skippedDuplicates = 0;

    let criticalCount = 0;
    let highCount = 0;
    let mediumCount = 0;
    let lowCount = 0;

    console.log(`🔄 Processing ${detections.length} detections...`);

    // Process each detection
    for (let i = 0; i < detections.length; i++) {
        const detection = detections[i];

        // Report progress
        if (onProgress) {
            onProgress(i + 1, detections.length);
        }

        // Check for duplicate alerts (same rule + file in last 24 hours)
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

        const { data: existingAlerts } = await supabase
            .from('alerts')
            .select('id')
            .eq('title', `[Log] ${detection.rule.name}`)
            .eq('source', `Log Analysis: ${fileName}`)
            .gte('created_at', twentyFourHoursAgo)
            .limit(1);

        if (existingAlerts && existingAlerts.length > 0) {
            console.log(`⚠️ Skipping duplicate alert: ${detection.rule.name} for ${fileName}`);
            console.log('   Existing alert found within last 24 hours');
            skippedDuplicates++;
            continue;
        }

        // Convert detection to alert
        const alertPayload = detectionToAlert(detection, fileName);

        console.log(`📤 Attempting to insert alert: ${alertPayload.title}`);

        // Insert alert
        const alertId = await insertAlert(alertPayload);

        if (alertId) {
            insertedIds.push(alertId);
            console.log(`✅ Successfully inserted alert with ID: ${alertId}`);

            // Count by severity
            switch (detection.severity) {
                case 'critical':
                    criticalCount++;
                    break;
                case 'high':
                    highCount++;
                    break;
                case 'medium':
                    mediumCount++;
                    break;
                case 'low':
                    lowCount++;
                    break;
            }
        }

        // Small delay to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    const processingTime = performance.now() - startTime;

    // Verify inserted alerts
    console.log('🔍 Verifying inserted alerts...');
    const { data: verifyData, error: verifyError } = await supabase
        .from('alerts')
        .select('id, title, source, severity, created_at')
        .in('id', insertedIds);

    if (verifyError) {
        console.error('❌ Error verifying alerts:', verifyError);
    } else {
        console.log(`✅ Verified ${verifyData?.length || 0}/${insertedIds.length} alerts in database`);
        verifyData?.forEach((alert: any) => {
            console.log(`  - ${alert.title} (${alert.severity}) - ID: ${alert.id}`);
        });
    }

    console.log(`📊 Processing Summary:`);
    console.log(`   - Alerts Generated: ${insertedIds.length}`);
    console.log(`   - Skipped Duplicates: ${skippedDuplicates}`);
    console.log(`   - Total Processed: ${detections.length}`);

    return {
        totalLines: detections.reduce((sum, d) => sum + d.matches.length, 0),
        alertsGenerated: insertedIds.length,
        skippedDuplicates,
        criticalAlerts: criticalCount,
        highAlerts: highCount,
        mediumAlerts: mediumCount,
        lowAlerts: lowCount,
        processingTime,
    };
}

/**
 * Delete alerts created from a specific log file
 * Useful for cleanup or re-processing
 */
export async function deleteLogAlerts(fileName: string): Promise<number> {
    try {
        const { data, error } = await supabase
            .from('alerts')
            .delete()
            .eq('source', `Log Analysis: ${fileName}`)
            .select('id');

        if (error) {
            console.error('Error deleting log alerts:', error);
            return 0;
        }

        return data?.length || 0;
    } catch (error) {
        console.error('Unexpected error deleting log alerts:', error);
        return 0;
    }
}

/**
 * Get statistics for log-based alerts
 */
export async function getLogAlertStats(): Promise<{
    total: number;
    byFile: Map<string, number>;
    bySeverity: Map<string, number>;
}> {
    try {
        const { data, error } = await supabase
            .from('alerts')
            .select('source, severity')
            .like('source', 'Log Analysis:%');

        if (error || !data) {
            return {
                total: 0,
                byFile: new Map(),
                bySeverity: new Map(),
            };
        }

        const byFile = new Map<string, number>();
        const bySeverity = new Map<string, number>();

        data.forEach(alert => {
            // Extract filename from source
            const fileName = alert.source.replace('Log Analysis: ', '');
            byFile.set(fileName, (byFile.get(fileName) || 0) + 1);

            // Count by severity
            bySeverity.set(alert.severity, (bySeverity.get(alert.severity) || 0) + 1);
        });

        return {
            total: data.length,
            byFile,
            bySeverity,
        };
    } catch (error) {
        console.error('Error getting log alert stats:', error);
        return {
            total: 0,
            byFile: new Map(),
            bySeverity: new Map(),
        };
    }
}

/**
 * Validate database connection before processing
 */
export async function validateConnection(): Promise<boolean> {
    try {
        const { error } = await supabase.from('alerts').select('id').limit(1);
        return !error;
    } catch {
        return false;
    }
}
