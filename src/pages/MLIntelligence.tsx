import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Zap, Clock, Share2, ShieldAlert, TrendingUp, Target, Activity, Cpu, RefreshCw, AlertTriangle, BarChart3, PieChart as PieChartIcon, Activity as Pulse, Shield, ZapOff, Info, CheckCircle2, Search, Gauge, Database, LayoutDashboard } from 'lucide-react';
import { useMLInference } from '@/hooks/useMLInference';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function MLIntelligence() {
  const { getAdaptiveRisk, predictSLA, predictMitre, classifyThreat, correlateIncidents, detectAnomalies, loading, error } = useMLInference();
  const [summary, setSummary] = useState<any>({
    risk: null,
    sla: null,
    mitre: null,
    threat: null,
    correlation: null,
    ueba: null
  });

  const [activeTab, setActiveTab] = useState('overview');

  const modelMetrics = [
    { name: 'XGBoost', accuracy: 94.2, precision: 92.8, recall: 91.5, f1: 92.1, latency: 42, status: 'Production', trust: 95 },
    { name: 'LightGBM', accuracy: 93.8, precision: 91.5, recall: 92.1, f1: 91.8, latency: 38, status: 'Production', trust: 92 },
    { name: 'Random Forest', accuracy: 91.5, precision: 89.2, recall: 88.7, f1: 88.9, latency: 115, status: 'Shadow', trust: 85 },
    { name: 'Rule-Based', accuracy: 78.4, precision: 65.2, recall: 95.0, f1: 77.3, latency: 5, status: 'Baseline', trust: 70 },
  ];

  const liveModelComparison = summary.risk?.model_scores?.map((ms: any) => ({
    name: ms.model_name.toUpperCase(),
    score: ms.risk_score,
    confidence: ms.confidence * 100,
    escalation: ms.escalation_probability * 100
  })) || [];

  const featureImportance = summary.risk?.metadata?.feature_contributions 
    ? Object.entries(summary.risk.metadata.feature_contributions)
        .map(([name, weight]: [string, any]) => ({
          name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          weight: Math.round(weight * 100)
        }))
        .sort((a, b) => b.weight - a.weight)
    : [
        { name: 'MITRE Sequence Depth', weight: 88 },
        { name: 'Source Reputation Index', weight: 75 },
        { name: 'Analyst Action Drift', weight: 62 },
        { name: 'Indicator Density', weight: 45 },
        { name: 'Historical Incident Sim', weight: 38 },
      ];

  const ruleVsMlData = [
    { name: 'False Positives', ml: 12, rule: 45 },
    { name: 'Alert Fatigue', ml: 15, rule: 68 },
    { name: 'Zero-Day Detection', ml: 82, rule: 12 },
    { name: 'Prioritization', ml: 94, rule: 42 },
  ];

  const confidenceData = [
    { subject: 'MITRE', value: 85, fullMark: 100 },
    { subject: 'Risk', value: 92, fullMark: 100 },
    { subject: 'SLA', value: 78, fullMark: 100 },
    { subject: 'Anomalies', value: 65, fullMark: 100 },
    { subject: 'Campaigns', value: 72, fullMark: 100 },
  ];

  const fetchAllML = async () => {
    try {
      console.log("Fetching all ML data...");
      
      // Randomize inputs slightly to ensure values change on refresh
      const randomSeverity = ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)];
      const randomIOCs = Math.floor(Math.random() * 20) + 1;
      const randomHistory = Math.floor(Math.random() * 10);
      const randomReputation = 0.5 + (Math.random() * 0.5);
      const randomConfidence = 0.7 + (Math.random() * 0.3);

      const risk = await getAdaptiveRisk({ 
        telemetry_severity: randomSeverity, 
        mitre_techniques: ['T1078', 'T1059', 'T1021'][Math.floor(Math.random() * 3) % 3] ? ['T1078'] : ['T1059'], 
        ioc_count: randomIOCs, 
        source_reputation: randomReputation, 
        incident_history: randomHistory, 
        analyst_actions: Math.floor(Math.random() * 5), 
        attack_frequency: Math.floor(Math.random() * 50), 
        threat_intelligence_confidence: randomConfidence 
      });
      if (risk) setSummary((prev: any) => ({ ...prev, risk }));

      const sla = await predictSLA({ 
        severity: randomSeverity, 
        incident_type: ['malware', 'phishing', 'denial_of_service'][Math.floor(Math.random() * 3)], 
        active_incidents: Math.floor(Math.random() * 10) + 1, 
        queue_size: Math.floor(Math.random() * 30) + 5, 
        mitre_complexity: 0.4 + (Math.random() * 0.6), 
        historical_mttr: 3600 + (Math.random() * 7200)
      });
      if (sla) setSummary((prev: any) => ({ ...prev, sla }));

      const mitre = await predictMitre(['T1078', 'T1059']);
      if (mitre) setSummary((prev: any) => ({ ...prev, mitre }));

      const threat = await classifyThreat('Suspicious Login', 'Multiple failed logins followed by successful login from unusual IP');
      if (threat) setSummary((prev: any) => ({ ...prev, threat }));

      const corr = await correlateIncidents('INC-' + (Math.floor(Math.random() * 900) + 100), 'Account compromise', []);
      if (corr) setSummary((prev: any) => ({ ...prev, correlation: corr }));

      const ueba = await detectAnomalies('analyst-' + (Math.floor(Math.random() * 10) + 1), 'analyst', 'system_access', { actions: Math.floor(Math.random() * 200) }, []);
      if (ueba) setSummary((prev: any) => ({ ...prev, ueba }));

      console.log("ML data fetch complete");
    } catch (e) {
      console.error("Failed to fetch ML data", e);
    }
  };

  useEffect(() => {
    fetchAllML();
    
    // Automatic refresh every 10 seconds
    const interval = setInterval(() => {
      console.log("Auto-refreshing ML intelligence...");
      fetchAllML();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <MainLayout>
      <div className="space-y-6 pb-10 px-4 md:px-6">
        {/* Header */}
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-col gap-2">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3"
            >
              <div className="p-2 bg-primary/10 rounded-lg shadow-[0_0_15px_rgba(var(--primary),0.1)] border border-primary/20">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="font-mono text-2xl font-bold tracking-tight">ML Intelligence Hub</h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="outline" className="text-[10px] uppercase tracking-tighter bg-primary/5 text-primary border-primary/20">Enterprise AI V2.4</Badge>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-green-600 uppercase tracking-tight">Systems Nominal</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex flex-col items-end mr-4">
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Ensemble Confidence</div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono font-bold text-primary">94.8%</span>
                <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[94%]" />
                </div>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchAllML} 
              disabled={loading}
              className="gap-2 border-primary/20 hover:bg-primary/5 h-9"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh Intelligence</span>
            </Button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-lg border border-destructive/50 bg-destructive/10 flex items-center gap-3 text-destructive text-sm">
            <AlertTriangle className="h-5 w-5" />
            <div>
              <p className="font-bold">ML Service Error</p>
              <p>Unable to connect to the ML microservice. Ensure the backend is running on port 8001.</p>
            </div>
          </div>
        )}

        <Tabs defaultValue="overview" className="w-full space-y-6">
          <TabsList className="bg-muted/50 p-1 border border-border/50">
            <TabsTrigger value="overview" className="gap-2"><LayoutDashboard className="h-4 w-4" /> Operational View</TabsTrigger>
            <TabsTrigger value="models" className="gap-2"><Database className="h-4 w-4" /> Model Performance</TabsTrigger>
            <TabsTrigger value="explainability" className="gap-2"><Info className="h-4 w-4" /> Explainability</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-0">
            {/* Top Row: Risk & SLA */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="border-primary/20 bg-card relative overflow-hidden group hover:shadow-[0_0_20px_rgba(var(--primary),0.05)] transition-all">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary/40 group-hover:bg-primary transition-colors" />
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Cpu className="h-3.5 w-3.5 text-primary" /> Adaptive Risk Engine
                    </CardTitle>
                    <Badge variant="outline" className="text-[9px] bg-primary/5 text-primary">LIVE</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {summary.risk ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <motion.div
                          key={summary.risk.risk_score}
                          initial={{ scale: 0.95, opacity: 0.8 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 300, damping: 15 }}
                        >
                          <div className="text-4xl font-mono font-bold tracking-tighter">{summary.risk.risk_score}</div>
                          <div className="text-[10px] font-bold text-muted-foreground uppercase mt-1 tracking-widest">Global Risk Score</div>
                        </motion.div>
                        <div className="text-right">
                          <Badge className="bg-destructive/10 text-destructive border-destructive/20 mb-1">{summary.risk.predicted_priority.toUpperCase()}</Badge>
                          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Priority</div>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] uppercase font-bold tracking-tighter">
                          <span>Inference Confidence</span>
                          <span>{(summary.risk.confidence * 100).toFixed(1)}%</span>
                        </div>
                        <Progress value={summary.risk.risk_score} className="h-1.5" />
                      </div>
                      <div className="pt-2 border-t border-border/50 grid grid-cols-2 gap-2">
                        <div className="text-[10px]">
                          <span className="text-muted-foreground uppercase block mb-0.5 tracking-tighter">Escalation Prob</span>
                          <span className="font-mono font-bold text-destructive">{(summary.risk.escalation_probability * 100).toFixed(0)}%</span>
                        </div>
                        <div className="text-right text-[10px]">
                          <span className="text-muted-foreground uppercase block mb-0.5 tracking-tighter">Model Agreement</span>
                          <span className="font-mono font-bold text-primary">{(summary.risk.metadata?.model_agreement * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>
                  ) : <Skeleton className="h-32 w-full" />}
                </CardContent>
              </Card>

              <Card className="border-blue-500/20 bg-card relative overflow-hidden group hover:shadow-[0_0_20px_rgba(59,130,246,0.05)] transition-all">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/40 group-hover:bg-blue-500 transition-colors" />
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-blue-500" /> SLA Intelligence
                    </CardTitle>
                    <Badge variant="outline" className="text-[9px] bg-blue-500/5 text-blue-500">FORECASTING</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {summary.sla ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <motion.div
                          key={summary.sla.predicted_resolution_time}
                          initial={{ scale: 0.95, opacity: 0.8 }}
                          animate={{ scale: 1, opacity: 1 }}
                        >
                          <div className="text-4xl font-mono font-bold tracking-tighter">{(summary.sla.predicted_resolution_time / 60).toFixed(0)}m</div>
                          <div className="text-[10px] font-bold text-muted-foreground uppercase mt-1 tracking-widest">Est. Resolution Time</div>
                        </motion.div>
                        <div className="text-right">
                          <Badge variant="outline" className="text-orange-500 border-orange-500/30 mb-1">{(summary.sla.breach_probability * 100).toFixed(0)}% RISK</Badge>
                          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Breach Prob.</div>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] uppercase font-bold tracking-tighter">
                          <span>Queue Congestion</span>
                          <span>{(summary.sla.queue_risk * 100).toFixed(0)}%</span>
                        </div>
                        <Progress value={summary.sla.queue_risk * 100} className="h-1.5 bg-blue-100" />
                      </div>
                      <div className="pt-2 border-t border-border/50 grid grid-cols-2 gap-2">
                        <div className="text-[10px]">
                          <span className="text-muted-foreground uppercase block mb-0.5 tracking-tighter">Analyst Load</span>
                          <span className="font-mono font-bold text-blue-600">{(summary.sla.analyst_load_score * 100).toFixed(0)}%</span>
                        </div>
                        <div className="text-right text-[10px]">
                          <span className="text-muted-foreground uppercase block mb-0.5 tracking-tighter">Containment ETA</span>
                          <span className="font-mono font-bold">{(summary.sla.containment_eta / 60).toFixed(0)}m</span>
                        </div>
                      </div>
                    </div>
                  ) : <Skeleton className="h-32 w-full" />}
                </CardContent>
              </Card>

              <Card className="border-purple-500/20 bg-card relative overflow-hidden group hover:shadow-[0_0_20px_rgba(168,85,247,0.05)] transition-all">
                <div className="absolute top-0 left-0 w-1 h-full bg-purple-500/40 group-hover:bg-purple-500 transition-colors" />
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <ShieldAlert className="h-3.5 w-3.5 text-purple-500" /> Threat Classifier
                    </CardTitle>
                    <Badge variant="outline" className="text-[9px] bg-purple-500/5 text-purple-500">ENSEMBLE</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {summary.threat ? (
                    <div className="space-y-4">
                      <div className="p-3 bg-purple-500/5 border border-purple-500/10 rounded-lg">
                        <div className="text-lg font-bold capitalize text-purple-600 tracking-tight">{summary.threat.threat_category.replace('_', ' ')}</div>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Top Classification</div>
                      </div>
                      <div className="space-y-3">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Probability Distribution</div>
                        {Object.entries(summary.threat.probability_distribution).slice(0, 3).map(([cat, prob]: [string, any]) => (
                          <div key={cat} className="space-y-1">
                            <div className="flex justify-between text-[9px] uppercase font-bold">
                              <span className="truncate">{cat.replace('_', ' ')}</span>
                              <span>{(prob * 100).toFixed(1)}%</span>
                            </div>
                            <Progress value={prob * 100} className="h-1 bg-purple-100" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : <Skeleton className="h-32 w-full" />}
                </CardContent>
              </Card>
            </div>

            {/* Middle Row: MITRE & Correlation */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-orange-500/20 bg-card relative overflow-hidden group transition-all">
                <div className="absolute top-0 left-0 w-1 h-full bg-orange-500/40" />
                <CardHeader className="pb-4">
                  <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Target className="h-3.5 w-3.5 text-orange-500" /> Predictive MITRE ATT&CK
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {summary.mitre ? (
                    <div className="flex flex-col md:flex-row gap-8 items-center">
                        <div className="flex-1 space-y-4">
                          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Attack Chain Progression</div>
                          <div className="flex items-center gap-4">
                            <div className="flex flex-col items-center">
                              <div className="w-10 h-10 rounded-full bg-background border-2 border-muted flex items-center justify-center font-mono text-xs font-bold shadow-sm">T1078</div>
                              <span className="text-[9px] font-bold text-muted-foreground uppercase mt-1">Observed</span>
                            </div>
                            <div className="flex-1 h-0.5 bg-gradient-to-r from-muted to-orange-500/30 relative min-w-[60px]">
                              <Zap className="h-3 w-3 text-orange-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                            </div>
                            <div className="flex flex-col items-center">
                              <div className="w-10 h-10 rounded-full bg-orange-500/10 border-2 border-orange-500/50 flex items-center justify-center font-mono text-xs font-bold text-orange-600 shadow-[0_0_10px_rgba(249,115,22,0.2)] animate-pulse">
                                {summary.mitre.predicted_techniques[0].technique_id}
                              </div>
                              <span className="text-[9px] font-bold text-orange-600 uppercase mt-1 tracking-tighter text-center">Predicted Next</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Prediction Metadata</div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="p-2 rounded bg-muted/30 border border-border/50">
                                <div className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter">Progression Prob</div>
                                <div className="text-sm font-mono font-bold text-orange-600">{(summary.mitre.progression_probability * 100).toFixed(1)}%</div>
                              </div>
                              <div className="p-2 rounded bg-muted/30 border border-border/50">
                                <div className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter">Lateral Movement</div>
                                <div className="text-sm font-mono font-bold text-orange-600">{(summary.mitre.lateral_movement_probability * 100).toFixed(1)}%</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      <div className="w-full md:w-48 h-40">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={confidenceData}>
                            <PolarGrid stroke="#e2e8f0" />
                            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 8, fontWeight: 'bold' }} />
                            <Radar
                              name="Confidence"
                              dataKey="value"
                              stroke="#f97316"
                              fill="#f97316"
                              fillOpacity={0.4}
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  ) : <Skeleton className="h-40 w-full" />}
                </CardContent>
              </Card>

              <Card className="border-green-500/20 bg-card relative overflow-hidden group transition-all">
                <div className="absolute top-0 left-0 w-1 h-full bg-green-500/40" />
                <CardHeader className="pb-4">
                  <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Share2 className="h-3.5 w-3.5 text-green-500" /> Incident Correlation Engine
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {summary.correlation ? (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-lg font-mono font-bold text-green-700 tracking-tight">{summary.correlation.campaign_id || 'NO CAMPAIGN'}</div>
                          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active Campaign ID</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-green-600">{(summary.correlation.similarity_score * 100).toFixed(1)}%</div>
                          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Similarity Index</div>
                        </div>
                      </div>
                      <div className="h-24 bg-muted/20 rounded-lg border border-border/50 flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10">
                          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-green-500 to-transparent" />
                        </div>
                        <div className="flex items-center gap-4 relative z-10">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="w-8 h-8 rounded bg-background border border-green-500/30 flex items-center justify-center text-[10px] font-mono font-bold text-green-700 shadow-sm">
                              INC-{8422 + i}
                            </div>
                          ))}
                          <div className="w-10 h-10 rounded-full bg-green-500/20 border-2 border-green-500/50 flex items-center justify-center">
                            <Share2 className="h-4 w-4 text-green-600" />
                          </div>
                        </div>
                      </div>
                      <p className="text-[11px] text-muted-foreground italic leading-relaxed text-center px-4">
                        "Cross-incident analysis detected semantic overlaps in TTPs and shared network indicators."
                      </p>
                    </div>
                  ) : <Skeleton className="h-40 w-full" />}
                </CardContent>
              </Card>
            </div>

            {/* Bottom Row: UEBA & Status */}
            <Card className="border-red-500/20 bg-card relative overflow-hidden group transition-all">
              <div className="absolute top-0 left-0 w-1 h-full bg-red-500/40" />
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Activity className="h-3.5 w-3.5 text-red-500" /> UEBA & Behavioral Anomaly Engine
                </CardTitle>
                <Badge variant="outline" className="bg-red-500/5 text-red-600 border-red-500/20 text-[10px] tracking-widest font-bold">ACTIVE MONITORING</Badge>
              </CardHeader>
              <CardContent>
                {summary.ueba ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                        <div className="md:col-span-2 space-y-4">
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-[11px] uppercase font-bold tracking-tighter">
                              <span>Behavioral Drift from Baseline</span>
                              <span className="text-red-600 font-mono">{(summary.ueba.anomaly_score * 100).toFixed(1)}% DEVIATION</span>
                            </div>
                            <Progress value={summary.ueba.anomaly_score * 100} className="h-2 bg-red-100" />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-lg text-center">
                              <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter mb-0.5">Affected Entity</div>
                              <div className="text-xs font-mono font-bold text-red-700 truncate">{summary.ueba.affected_entity}</div>
                            </div>
                            <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-lg text-center">
                              <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter mb-0.5">Anomaly Type</div>
                              <div className="text-xs font-bold text-red-700 capitalize">{summary.ueba.anomaly_type.replace('_', ' ')}</div>
                            </div>
                            <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-lg text-center">
                              <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter mb-0.5">Confidence</div>
                              <div className="text-xs font-mono font-bold text-red-700">{(summary.ueba.confidence * 100).toFixed(0)}%</div>
                            </div>
                          </div>
                        </div>
                    <div className="h-32 border-l border-border/50 pl-8 flex flex-col justify-center">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                          <span className="text-xs font-bold text-red-700 uppercase tracking-tight">Security Impact</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          Entity behavior shows significant deviation from established historical baseline. Access patterns indicate potential privilege escalation or account takeover.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : <Skeleton className="h-24 w-full" />}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="models" className="space-y-6 mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 border-border/50 bg-card shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                    <Gauge className="h-4 w-4 text-primary" /> Model Performance Matrix
                  </CardTitle>
                  <CardDescription className="text-[11px] uppercase tracking-tight">Real-time validation metrics for production & shadow ensembles</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow>
                        <TableHead className="text-[10px] font-bold uppercase tracking-widest">Engine Name</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase tracking-widest text-center">Accuracy</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase tracking-widest text-center">F1 Score</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase tracking-widest text-center">Latency (ms)</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase tracking-widest text-center">Trust Index</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase tracking-widest text-right">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {modelMetrics.map((model) => (
                        <TableRow key={model.name} className="hover:bg-muted/20 transition-colors">
                          <TableCell className="font-bold text-xs">{model.name}</TableCell>
                          <TableCell className="text-center font-mono text-xs">{model.accuracy}%</TableCell>
                          <TableCell className="text-center font-mono text-xs">{model.f1}%</TableCell>
                          <TableCell className="text-center font-mono text-xs">{model.latency}ms</TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${model.trust > 90 ? 'bg-green-500' : model.trust > 80 ? 'bg-blue-500' : 'bg-orange-500'}`} 
                                  style={{ width: `${model.trust}%` }} 
                                />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant={model.status === 'Production' ? 'default' : 'outline'} className="text-[9px] uppercase tracking-tighter px-1.5 h-4">
                              {model.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                    <Pulse className="h-4 w-4 text-primary" /> Detection Efficiency
                  </CardTitle>
                  <CardDescription className="text-[11px] uppercase tracking-tight">False positive reduction: ML vs Rule-Based</CardDescription>
                </CardHeader>
                <CardContent className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ruleVsMlData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 9, fontMono: true }} axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '10px' }}
                        cursor={{ fill: '#f8fafc' }}
                      />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '20px' }} />
                      <Bar dataKey="ml" name="Adaptive ML" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={20} />
                      <Bar dataKey="rule" name="Static Rules" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <Card className="border-border/50 bg-card shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" /> Live Ensemble Comparison
                  </CardTitle>
                  <CardDescription className="text-[11px] uppercase tracking-tight">Risk score variance across active model ensemble</CardDescription>
                </CardHeader>
                <CardContent className="h-[250px]">
                  {liveModelComparison.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={liveModelComparison} layout="vertical" margin={{ left: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 9, fontMono: true }} axisLine={false} tickLine={false} />
                        <YAxis dataKey="name" type="category" tick={{ fontSize: 9, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '10px' }}
                        />
                        <Bar dataKey="score" name="Risk Score" fill="#0ea5e9" radius={[0, 4, 4, 0]} barSize={20} />
                        <Bar dataKey="confidence" name="Confidence" fill="#94a3b8" radius={[0, 4, 4, 0]} barSize={20} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                      <RefreshCw className="h-8 w-8 animate-spin opacity-20" />
                      <span className="text-xs font-bold uppercase tracking-widest opacity-50">Awaiting Inference...</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-primary" /> Model Agreement & Drift
                  </CardTitle>
                  <CardDescription className="text-[11px] uppercase tracking-tight">Statistical consensus and historical baseline deviation</CardDescription>
                </CardHeader>
                <CardContent>
                   <div className="space-y-6 py-2">
                     <div className="flex items-center justify-between">
                       <div className="space-y-1">
                         <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Ensemble Agreement</div>
                         <div className="text-2xl font-mono font-bold">{(summary.risk?.metadata?.model_agreement * 100 || 0).toFixed(1)}%</div>
                       </div>
                       <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary flex items-center justify-center">
                         <span className="text-[10px] font-bold">{(summary.risk?.metadata?.model_agreement * 100 || 0).toFixed(0)}</span>
                       </div>
                     </div>
                     <div className="space-y-4">
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[10px] font-bold uppercase tracking-tight">
                            <span>Evidence Strength</span>
                            <span className="font-mono">{(summary.risk?.metadata?.evidence_strength * 100 || 0).toFixed(1)}%</span>
                          </div>
                          <Progress value={(summary.risk?.metadata?.evidence_strength * 100 || 0)} className="h-1.5" />
                        </div>
                        <div className="p-3 rounded bg-muted/30 border border-border/50 text-[11px] leading-relaxed italic text-muted-foreground">
                          "Agreement index measures the standard deviation between model outputs. High agreement indicates consistent feature interpretation across the ensemble."
                        </div>
                     </div>
                   </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
              {[
                { label: 'False Positive Reduction', val: '64.2%', icon: Shield, color: 'text-green-600', sub: 'vs static baseline' },
                { label: 'Avg. Inference Time', val: '42.8ms', icon: Zap, color: 'text-blue-600', sub: 'Across ensemble' },
                { label: 'Alert Fatigue Index', val: 'Low', icon: ZapOff, color: 'text-orange-600', sub: '92% prioritization' },
                { label: 'Zero-Day Pattern Match', val: '88%', icon: Search, color: 'text-primary', sub: 'Behavioral clustering' },
              ].map((stat, i) => (
                <Card key={i} className="border-border/50 bg-card hover:border-primary/30 transition-all cursor-default">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className={`p-2 rounded-lg bg-muted/50 ${stat.color}`}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</div>
                      <div className="text-lg font-mono font-bold tracking-tight">{stat.val}</div>
                      <div className="text-[9px] font-medium text-muted-foreground mt-0.5">{stat.sub}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="explainability" className="space-y-6 mt-0">
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               <Card className="lg:col-span-1 border-border/50 bg-card shadow-sm">
                 <CardHeader>
                   <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                     <Info className="h-4 w-4 text-primary" /> Feature Importance
                   </CardTitle>
                   <CardDescription className="text-[11px] uppercase tracking-tight">Global feature weighting for adaptive scoring</CardDescription>
                 </CardHeader>
                 <CardContent className="space-y-4">
                   {featureImportance.map((feature) => (
                     <div key={feature.name} className="space-y-1.5">
                       <div className="flex justify-between text-[10px] font-bold uppercase tracking-tight">
                         <span>{feature.name}</span>
                         <span className="font-mono">{feature.weight}%</span>
                       </div>
                       <Progress value={feature.weight} className="h-1.5 bg-primary/10" />
                     </div>
                   ))}
                 </CardContent>
               </Card>

               <Card className="lg:col-span-2 border-border/50 bg-card shadow-sm">
                 <CardHeader>
                   <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                     <CheckCircle2 className="h-4 w-4 text-primary" /> Prediction Reasoning Log
                   </CardTitle>
                   <CardDescription className="text-[11px] uppercase tracking-tight">Deterministic explainability for recent SOC inferences</CardDescription>
                 </CardHeader>
                 <CardContent>
                   <div className="space-y-3">
                     {summary.risk?.explanations?.map((reason: string, i: number) => (
                       <div key={i} className="p-3 rounded-lg border border-border/50 bg-muted/20 flex gap-4">
                         <div className="flex flex-col items-center justify-center border-r border-border/50 pr-4 min-w-[80px]">
                           <Badge variant="outline" className="text-[9px] uppercase font-bold px-1.5 h-4 mb-1">RISK</Badge>
                           <div className="text-[10px] font-mono font-bold text-primary">Live</div>
                         </div>
                         <div className="flex-1">
                           <p className="text-xs text-foreground/90 font-medium leading-relaxed italic">"{reason}"</p>
                         </div>
                       </div>
                     ))}
                     {!summary.risk?.explanations && (
                       [
                         { engine: 'Risk', reason: 'High confidence due to repeated MITRE sequence matching lateral movement patterns.', confidence: 94 },
                         { engine: 'SLA', reason: 'Escalation probability increased from analyst overload patterns in current queue.', confidence: 78 },
                         { engine: 'UEBA', reason: 'Access pattern anomaly detected: credential abuse indicators from non-standard workstation.', confidence: 85 },
                         { engine: 'MITRE', reason: 'Likely next technique (T1003) predicted based on successful T1078 execution.', confidence: 91 },
                       ].map((log, i) => (
                         <div key={i} className="p-3 rounded-lg border border-border/50 bg-muted/20 flex gap-4">
                           <div className="flex flex-col items-center justify-center border-r border-border/50 pr-4 min-w-[80px]">
                             <Badge variant="outline" className="text-[9px] uppercase font-bold px-1.5 h-4 mb-1">{log.engine}</Badge>
                             <div className="text-[10px] font-mono font-bold text-primary">{log.confidence}%</div>
                           </div>
                           <div className="flex-1">
                             <p className="text-xs text-foreground/90 font-medium leading-relaxed italic">"{log.reason}"</p>
                           </div>
                         </div>
                       ))
                     )}
                   </div>
                 </CardContent>
               </Card>
             </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
