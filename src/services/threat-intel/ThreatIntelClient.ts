// Threat Intelligence Client
// Integrates with VirusTotal and AbuseIPDB APIs

const VIRUSTOTAL_API_KEY = import.meta.env.VITE_VIRUSTOTAL_API_KEY || '';
const ABUSEIPDB_API_KEY = import.meta.env.VITE_ABUSEIPDB_API_KEY || '';

// In-memory cache to prevent redundant API calls
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours

export interface ThreatReputation {
    score: number | null; // 0-100 (AbuseIPDB) or malicious hits (VT)
    classification: 'benign' | 'suspicious' | 'malicious' | 'unknown';
    source: string;
    details: any;
}

/**
 * Helper to get data from cache
 */
function getFromCache(key: string) {
    const item = cache.get(key);
    if (item && Date.now() - item.timestamp < CACHE_TTL) {
        return item.data;
    }
    return null;
}

/**
 * Helper to set data in cache
 */
function setToCache(key: string, data: any) {
    cache.set(key, { data, timestamp: Date.now() });
}

/**
 * Check IP reputation via AbuseIPDB
 */
export async function checkIPReputation(ip: string): Promise<ThreatReputation> {
    const cacheKey = `abuseipdb_${ip}`;
    const cached = getFromCache(cacheKey);
    if (cached) return cached;

    if (!ABUSEIPDB_API_KEY) {
        // Mock fallback if no API key
        return {
            score: Math.floor(Math.random() * 100),
            classification: 'unknown',
            source: 'AbuseIPDB (Mock)',
            details: {}
        };
    }

    try {
        const response = await fetch(`https://api.abuseipdb.com/api/v2/check?ipAddress=${ip}&maxAgeInDays=90`, {
            headers: {
                'Key': ABUSEIPDB_API_KEY,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) throw new Error(`AbuseIPDB error: ${response.status}`);
        
        const data = await response.json();
        const score = data.data.abuseConfidenceScore;
        
        const result: ThreatReputation = {
            score,
            classification: score > 70 ? 'malicious' : score > 30 ? 'suspicious' : 'benign',
            source: 'AbuseIPDB',
            details: data.data
        };
        
        setToCache(cacheKey, result);
        return result;
    } catch (error) {
        console.warn('Threat Intel (AbuseIPDB) failed:', error);
        return { score: null, classification: 'unknown', source: 'AbuseIPDB (Error)', details: null };
    }
}

/**
 * Check Hash/Domain reputation via VirusTotal
 */
export async function checkVirusTotal(indicator: string, type: 'ip' | 'domain' | 'hash'): Promise<ThreatReputation> {
    const cacheKey = `vt_${type}_${indicator}`;
    const cached = getFromCache(cacheKey);
    if (cached) return cached;

    if (!VIRUSTOTAL_API_KEY) {
        // Mock fallback if no API key
        return {
            score: null,
            classification: 'unknown',
            source: 'VirusTotal (Mock)',
            details: {}
        };
    }

    let endpoint = '';
    if (type === 'ip') endpoint = `https://www.virustotal.com/api/v3/ip_addresses/${indicator}`;
    else if (type === 'domain') endpoint = `https://www.virustotal.com/api/v3/domains/${indicator}`;
    else endpoint = `https://www.virustotal.com/api/v3/files/${indicator}`;

    try {
        const response = await fetch(endpoint, {
            headers: {
                'x-apikey': VIRUSTOTAL_API_KEY,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) throw new Error(`VirusTotal error: ${response.status}`);
        
        const data = await response.json();
        const stats = data.data.attributes.last_analysis_stats;
        
        const score = stats.malicious; // Number of vendors flagging as malicious
        const result: ThreatReputation = {
            score,
            classification: score >= 5 ? 'malicious' : score >= 1 ? 'suspicious' : 'benign',
            source: 'VirusTotal',
            details: stats
        };

        setToCache(cacheKey, result);
        return result;
    } catch (error) {
        console.warn('Threat Intel (VirusTotal) failed:', error);
        return { score: null, classification: 'unknown', source: 'VirusTotal (Error)', details: null };
    }
}
