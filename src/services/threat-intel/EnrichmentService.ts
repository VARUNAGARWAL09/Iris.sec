import { checkIPReputation, checkVirusTotal, ThreatReputation } from './ThreatIntelClient';

export interface EnrichedData {
    ip_reputation_score?: number | null;
    domain_reputation?: string | null;
    hash_reputation?: string | null;
    threat_source?: string;
    intel_details?: Record<string, any>;
}

// Simple extractor regexes
const IPV4_REGEX = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
const DOMAIN_REGEX = /\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]\b/gi;
const MD5_SHA256_REGEX = /\b(?:[a-f0-9]{32}|[a-f0-9]{64})\b/gi;

/**
 * Extracts indicators from alert raw data and enriches them
 * Returns enriched payload to be merged into DB insert.
 */
export async function enrichAlertData(rawData: any, title: string, description: string): Promise<EnrichedData> {
    const enriched: EnrichedData = {
        intel_details: {}
    };

    // Serialize data to string to extract indicators
    const dataStr = JSON.stringify(rawData) + " " + title + " " + description;
    
    // Find indicators
    const ips = [...new Set(dataStr.match(IPV4_REGEX) || [])];
    const hashes = [...new Set(dataStr.match(MD5_SHA256_REGEX) || [])];
    
    // Filter out common false positive domains if we extract domains
    const rawDomains = dataStr.match(DOMAIN_REGEX) || [];
    const domains = [...new Set(rawDomains.filter(d => 
        !d.match(/^(www\.)?(github\.com|google\.com|microsoft\.com|apple\.com)$/i) &&
        !d.match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/) // Exclude IPs matching domain regex
    ))];

    const sources = new Set<string>();

    // Enrich IPs (Top 1)
    if (ips.length > 0) {
        const ip = ips[0]; // Take primary IP
        const rep = await checkIPReputation(ip);
        enriched.ip_reputation_score = rep.score;
        sources.add(rep.source);
        if (enriched.intel_details) enriched.intel_details[ip] = rep;
    }

    // Enrich Hashes (Top 1)
    if (hashes.length > 0) {
        const hash = hashes[0];
        const rep = await checkVirusTotal(hash, 'hash');
        enriched.hash_reputation = rep.classification;
        sources.add(rep.source);
        if (enriched.intel_details) enriched.intel_details[hash] = rep;
    }

    // Enrich Domains (Top 1)
    if (domains.length > 0) {
        const domain = domains[0];
        const rep = await checkVirusTotal(domain, 'domain');
        enriched.domain_reputation = rep.classification;
        sources.add(rep.source);
        if (enriched.intel_details) enriched.intel_details[domain] = rep;
    }

    enriched.threat_source = Array.from(sources).join(', ');

    return enriched;
}
