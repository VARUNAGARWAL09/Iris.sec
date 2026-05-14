import React, { useEffect, useState } from 'react';
import { useMLInference } from '@/hooks/useMLInference';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Brain, Zap, Clock, TrendingUp, ShieldAlert, Share2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface MLInsightsSectionProps {
  incidentId: string;
  title: string;
  description: string;
  severity: any;
  alerts: any[];
  evidence: any[];
}

export function MLInsightsSection({ incidentId, title, description, severity, alerts, evidence }: MLInsightsSectionProps) {
  const { loading, getAdaptiveRisk, predictSLA, predictMitre, classifyThreat, correlateIncidents } = useMLInference();
  const [riskData, setRiskData] = useState<any>(null);
  const [slaData, setSlaData] = useState<any>(null);
  const [mitreData, setMitreData] = useState<any>(null);
  const [classification, setClassification] = useState<any>(null);
  const [correlation, setCorrelation] = useState<any>(null);

  useEffect(() => {
    const fetchMLData = async () => {
      // Normalize severity to lowercase for ML service
      const normalizedSeverity = severity?.toLowerCase() || 'medium';

      // Fetch Adaptive Risk
      const risk = await getAdaptiveRisk({
        telemetry_severity: normalizedSeverity,
        mitre_techniques: [],
        ioc_count: evidence.length,
        source_reputation: 0.7,
        incident_history: 5,
        analyst_actions: 2,
        attack_frequency: alerts.length,
        threat_intelligence_confidence: 0.85,
        raw_data: { title, description }
      });
      if (risk) setRiskData(risk);

      // Fetch SLA Prediction
      const sla = await predictSLA({
        severity: normalizedSeverity,
        incident_type: 'malware_outbreak',
        active_incidents: 3,
        queue_size: 12,
        mitre_complexity: 0.65,
        historical_mttr: 7200,
      });
      if (sla) setSlaData(sla);

      // Fetch MITRE Prediction
      const mitre = await predictMitre(['T1078', 'T1059']);
      if (mitre) setMitreData(mitre);

      // Fetch Threat Classification
      const threat = await classifyThreat(title, description);
      if (threat) setClassification(threat);

      // Fetch Correlation
      const corr = await correlateIncidents(incidentId, description, [
        { incident_id: 'INC-001', description: 'Previous phishing attack', mitre_techniques: ['T1566'], iocs: ['bad-url.com'] },
        { incident_id: 'INC-002', description: 'Suspicious login activity', mitre_techniques: ['T1078'], iocs: ['1.2.3.4'] }
      ]);
      if (corr) setCorrelation(corr);
    };

    fetchMLData();
  }, [incidentId]);

  if (loading && !riskData) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-40 w-full" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Adaptive Risk Card */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" /> Adaptive Risk Scoring
            </CardTitle>
            {riskData && (
              <Badge variant={riskData.risk_score > 70 ? "destructive" : "secondary"}>
                {riskData.predicted_priority.toUpperCase()}
              </Badge>
            )}
          </CardHeader>
          <CardContent>
            {riskData ? (
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-3xl font-bold">{riskData.risk_score}</div>
                    <div className="text-xs text-muted-foreground">Confidence: {(riskData.confidence * 100).toFixed(1)}%</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold text-destructive">Escalation Prob: {(riskData.escalation_probability * 100).toFixed(1)}%</div>
                  </div>
                </div>
                <Progress value={riskData.risk_score} className="h-2" />
                <div className="text-xs space-y-1">
                  {riskData.explanations.slice(0, 2).map((exp: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 italic">
                      <Zap className="h-3 w-3 mt-0.5 text-yellow-500 shrink-0" />
                      <span>{exp}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : <Skeleton className="h-24 w-full" />}
          </CardContent>
        </Card>

        {/* SLA Intelligence Card */}
        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" /> SLA Intelligence
            </CardTitle>
          </CardHeader>
          <CardContent>
            {slaData ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-bold">{(slaData.predicted_resolution_time / 3600).toFixed(1)}h</div>
                    <div className="text-xs text-muted-foreground">Est. Resolution</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-500">{(slaData.breach_probability * 100).toFixed(0)}%</div>
                    <div className="text-xs text-muted-foreground">Breach Prob.</div>
                  </div>
                </div>
                <div className="text-xs p-2 bg-blue-500/10 rounded border border-blue-500/20">
                  <span className="font-semibold">Recommendation:</span> High probability of SLA breach. Consider immediate escalation or resource reallocation.
                </div>
              </div>
            ) : <Skeleton className="h-24 w-full" />}
          </CardContent>
        </Card>

        {/* MITRE Predictions */}
        <Card className="border-orange-500/20 bg-orange-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-orange-500" /> Predictive MITRE ATT&CK
            </CardTitle>
          </CardHeader>
          <CardContent>
            {mitreData ? (
              <div className="space-y-3">
                <div className="text-xs font-semibold text-muted-foreground uppercase">Predicted Next Techniques</div>
                <div className="space-y-2">
                  {mitreData.predicted_techniques.map((tech: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-background/50 rounded border text-sm">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono text-[10px]">{tech.technique_id}</Badge>
                        <span className="font-medium truncate max-w-[150px]">{tech.name}</span>
                      </div>
                      <Badge variant="secondary" className="text-[10px]">{(tech.confidence * 100).toFixed(0)}% Conf.</Badge>
                    </div>
                  ))}
                </div>
              </div>
            ) : <Skeleton className="h-24 w-full" />}
          </CardContent>
        </Card>

        {/* Threat Classification */}
        <Card className="border-purple-500/20 bg-purple-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-purple-500" /> ML Threat Classification
            </CardTitle>
          </CardHeader>
          <CardContent>
            {classification ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-full">
                    <AlertCircle className="h-6 w-6 text-purple-500" />
                  </div>
                  <div>
                    <div className="text-lg font-bold capitalize">{classification.threat_category.replace('_', ' ')}</div>
                    <div className="text-xs text-muted-foreground">Complexity: {classification.attack_complexity.toUpperCase()}</div>
                  </div>
                </div>
                <div className="text-xs space-y-2">
                   <div className="font-semibold">Recommended Actions:</div>
                   <ul className="list-disc pl-4 space-y-1">
                     {classification.recommended_response.slice(0, 3).map((resp: string, i: number) => (
                       <li key={i}>{resp}</li>
                     ))}
                   </ul>
                </div>
              </div>
            ) : <Skeleton className="h-24 w-full" />}
          </CardContent>
        </Card>
      </div>

      {/* Incident Correlation Row */}
      {correlation && correlation.related_incidents.length > 0 && (
        <Card className="border-green-500/20 bg-green-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Share2 className="h-4 w-4 text-green-500" /> Incident Correlation & Campaign Detection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-xs text-muted-foreground mb-3">
                {correlation.correlation_explanation}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Related Incidents</div>
                  {correlation.related_incidents.map((rel: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-background/50 rounded border text-sm">
                      <span className="font-mono font-medium">{rel.incident_id}</span>
                      <Badge variant="outline" className="text-[10px]">{(rel.similarity_score * 100).toFixed(0)}% Similarity</Badge>
                    </div>
                  ))}
                </div>
                {correlation.campaign_id && (
                  <div className="p-3 rounded bg-green-500/10 border border-green-500/20 flex flex-col justify-center items-center text-center">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-green-600 mb-1">Campaign Detected</div>
                    <div className="text-xl font-bold text-green-700 font-mono">{correlation.campaign_id}</div>
                    <div className="text-[10px] text-green-600/70 mt-1">Part of a multi-stage attack cluster</div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
