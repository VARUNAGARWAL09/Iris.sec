import { memo } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Globe, FileKey, ServerCrash, Radio, AlertOctagon } from 'lucide-react';
import { useSimulation } from '@/context/SimulationContext';
import { cn } from '@/lib/utils';

function ScoreBar({ score, max = 100 }: { score: number; max?: number }) {
  const pct = Math.min(100, Math.round((score / max) * 100));
  const color = pct > 70 ? '#ef4444' : pct > 30 ? '#f97316' : '#22c55e';
  return (
    <div className="flex items-center gap-2 flex-1">
      <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
      <span className="font-mono text-[10px] font-semibold w-10 text-right" style={{ color }}>
        {score}/100
      </span>
    </div>
  );
}

export const ThreatIntelFeed = memo(function ThreatIntelFeed() {
  const { alerts } = useSimulation();

  const intelAlerts = alerts.filter(a => {
    const intel = (a as any).raw_data?.threat_intel;
    return intel && (intel.ip_reputation_score !== undefined || intel.domain_reputation || intel.hash_reputation);
  }).slice(0, 5);

  const reputationLabel = (val: string) => {
    if (val === 'malicious')  return { label: 'MALICIOUS',  color: 'text-severity-critical bg-severity-critical/10 border-severity-critical/30' };
    if (val === 'suspicious') return { label: 'SUSPICIOUS', color: 'text-severity-high bg-severity-high/10 border-severity-high/30' };
    return { label: val.toUpperCase(), color: 'text-green-400 bg-green-500/10 border-green-500/30' };
  };

  if (intelAlerts.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center gap-2 border-b border-border px-5 py-4">
          <Radio className="h-4 w-4 text-primary animate-pulse" />
          <h3 className="font-mono text-sm font-semibold uppercase tracking-wider">Threat Intel Feed</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-10 text-center px-4">
          <AlertOctagon className="h-7 w-7 text-muted-foreground/25 mb-2" />
          <p className="text-xs text-muted-foreground font-mono">Awaiting intelligence enrichment…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <Radio className="h-4 w-4 text-primary animate-pulse" />
          <h3 className="font-mono text-sm font-semibold uppercase tracking-wider">Threat Intel Feed</h3>
          <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-mono font-semibold text-primary">
            LIVE
          </span>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground">{intelAlerts.length} enriched</span>
      </div>

      {/* Items */}
      <div className="divide-y divide-border/50">
        {intelAlerts.map((alert: any, index: number) => {
          const intel = alert.raw_data?.threat_intel || {};
          const isMalicious = intel.domain_reputation === 'malicious' || intel.hash_reputation === 'malicious' || (intel.ip_reputation_score ?? 0) > 70;

          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: index * 0.06 }}
              className={cn(
                'p-4 transition-colors hover:bg-accent/30',
                isMalicious && 'border-l-2 border-l-severity-critical'
              )}
            >
              {/* Alert title row */}
              <div className="flex items-center gap-2 mb-2.5">
                <ShieldAlert className={cn('h-3.5 w-3.5 flex-shrink-0', isMalicious ? 'text-severity-critical' : 'text-severity-high')} />
                <p className="text-xs font-semibold line-clamp-1 flex-1">{alert.title}</p>
                {isMalicious && (
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border bg-severity-critical/10 text-severity-critical border-severity-critical/30 flex-shrink-0">
                    IOC
                  </span>
                )}
              </div>

              {/* Intel metrics */}
              <div className="space-y-1.5">
                {intel.ip_reputation_score !== undefined && intel.ip_reputation_score !== null && (
                  <div className="flex items-center gap-2">
                    <ServerCrash className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    <span className="text-[10px] text-muted-foreground w-20 flex-shrink-0 font-mono">AbuseIPDB</span>
                    <ScoreBar score={intel.ip_reputation_score} />
                  </div>
                )}

                {intel.domain_reputation && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    <span className="text-[10px] text-muted-foreground w-20 flex-shrink-0 font-mono">VT Domain</span>
                    <span className={cn('intel-badge text-[9px]', reputationLabel(intel.domain_reputation).color)}>
                      {reputationLabel(intel.domain_reputation).label}
                    </span>
                  </div>
                )}

                {intel.hash_reputation && (
                  <div className="flex items-center gap-2">
                    <FileKey className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    <span className="text-[10px] text-muted-foreground w-20 flex-shrink-0 font-mono">VT Hash</span>
                    <span className={cn('intel-badge text-[9px]', reputationLabel(intel.hash_reputation).color)}>
                      {reputationLabel(intel.hash_reputation).label}
                    </span>
                  </div>
                )}
              </div>

              {intel.threat_source && (
                <p className="mt-2 text-[9px] text-muted-foreground/50 font-mono text-right">
                  src: {intel.threat_source}
                </p>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
});
