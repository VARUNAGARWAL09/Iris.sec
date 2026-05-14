import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, Zap, Clock, Share2, ShieldAlert, TrendingUp, Target, 
  Activity, Cpu, RefreshCw, AlertTriangle, Activity as Pulse, 
  Shield, ZapOff, Info, CheckCircle2, Search, Gauge, Database, 
  LayoutDashboard, Network, ArrowRight, UserCheck
} from 'lucide-react';
import { useMLEvolution } from '@/hooks/useMLEvolution';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, 
  Radar, Legend, LineChart, Line, AreaChart, Area, Cell, PieChart, Pie
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Utility to clamp values within operational ranges
const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

const CustomChartTooltip = ({ active, payload, label, prefix = '', suffix = '' }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/95 backdrop-blur-md border border-primary/20 p-3 rounded-lg shadow-2xl">
        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 border-b border-border/50 pb-1">
          Snapshot: T+{label}
        </div>
        <div className="space-y-1.5">
          {payload.map((entry: any, i: number) => (
            <div key={i} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-xs font-bold text-foreground capitalize">{entry.name.replace(/([A-Z])/g, ' $1').trim()}</span>
              </div>
              <span className="text-xs font-mono font-bold text-primary">
                {prefix}{typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}{suffix}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function MLIntelligence() {
  const { 
    risk, sla, mitre, threat, correlation, ueba, 
    ensembleAgreement, driftScore, evidenceStrength, 
    reasoningLogs, lastRefresh, isSyncing, tick, orchestrator, history 
  } = useMLEvolution();

  const [activeTab, setActiveTab] = useState('overview');

  // Advanced Feature Importance library (30+ features)
  const expandedFeatures = useMemo(() => {
    const base = [
      { name: 'MITRE Sequence', weight: 85 },
      { name: 'IOC Density', weight: 72 },
      { name: 'Source Reputation', weight: 65 },
      { name: 'Entity Behavior', weight: 58 },
      { name: 'Payload Entropy', weight: 45 },
      { name: 'Lateral Movement', weight: 82 },
      { name: 'Privilege Signals', weight: 78 },
      { name: 'Beaconing Freq', weight: 70 },
      { name: 'Asset Criticality', weight: 62 },
      { name: 'Auth Failure Density', weight: 55 },
      { name: 'Geo-Velocity', weight: 48 },
      { name: 'Attack Chain Depth', weight: 88 },
      { name: 'Campaign Sim', weight: 75 },
      { name: 'User Variance', weight: 68 },
      { name: 'Command Freq', weight: 60 },
      { name: 'Persistence Ind.', weight: 52 },
      { name: 'Credential Abuse', weight: 84 },
      { name: 'Payload Obfuscation', weight: 72 },
      { name: 'Lateral Access Var.', weight: 66 },
      { name: 'Risk Propagation', weight: 54 }
    ];
    return base.map(f => ({ 
      ...f, 
      weight: clamp(f.weight + (Math.sin(tick / (f.weight/10)) * 10), 5, 100) 
    })).sort((a, b) => b.weight - a.weight);
  }, [tick]);

  // Dynamic Feature Importance with high-frequency updates
  const [featureDrift, setFeatureDrift] = useState<Record<string, number>>({});
  
  useEffect(() => {
    const interval = setInterval(() => {
      setFeatureDrift(prev => {
        const next: Record<string, number> = {};
        expandedFeatures.forEach(f => {
          next[f.name] = (Math.random() - 0.5) * 5; // Subtle ±2.5% drift
        });
        return next;
      });
    }, 3000); // Faster 3s update for features
    return () => clearInterval(interval);
  }, [expandedFeatures]);

  const animatedFeatures = useMemo(() => {
    return expandedFeatures.map(f => ({
      ...f,
      weight: clamp(f.weight + (featureDrift[f.name] || 0), 5, 100)
    })).sort((a, b) => b.weight - a.weight);
  }, [expandedFeatures, featureDrift]);

  // Stable Model Performance Matrix
  const modelMetrics = useMemo(() => [
    { name: 'XGBoost-V4', accuracy: (94.2 + Math.sin(tick/10)*0.2).toFixed(1), latency: 42 + (tick % 3), status: 'Production', trust: 95 + Math.sin(tick/8)*1 },
    { name: 'Ensemble-Alpha', accuracy: (96.8 + Math.cos(tick/12)*0.1).toFixed(1), latency: 85 + (tick % 5), status: 'Production', trust: 98 + Math.sin(tick/15)*0.5 },
    { name: 'LGBM-Optimized', accuracy: (93.5 + Math.sin(tick/7)*0.3).toFixed(1), latency: 35 + (tick % 2), status: 'Shadow', trust: 92 + Math.cos(tick/10)*2 },
    { name: 'Neural-Corr', accuracy: (91.2 + Math.cos(tick/9)*0.4).toFixed(1), latency: 120 + (tick % 10), status: 'Testing', trust: 88 + Math.sin(tick/20)*3 },
  ], [tick]);

  const confidenceData = useMemo(() => [
    { subject: 'MITRE', value: 85 + Math.sin(tick/10)*2, fullMark: 100 },
    { subject: 'Risk', value: 92 + Math.cos(tick/12)*1, fullMark: 100 },
    { subject: 'SLA', value: 78 + Math.sin(tick/8)*3, fullMark: 100 },
    { subject: 'Anomalies', value: 65 + Math.cos(tick/15)*4, fullMark: 100 },
    { subject: 'Campaigns', value: 72 + Math.sin(tick/20)*3, fullMark: 100 },
  ], [tick]);

  return (
    <MainLayout>
      <div className="space-y-6 pb-10 px-4 md:px-6">
        {/* Synchronized Header */}
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-col gap-2">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3"
            >
              <div className="p-2 bg-primary/10 rounded-lg shadow-[0_0_15px_rgba(var(--primary),0.1)] border border-primary/20 relative overflow-hidden group">
                <Brain className="h-6 w-6 text-primary relative z-10" />
                <motion.div 
                  className="absolute inset-0 bg-primary/30"
                  animate={{ 
                    opacity: orchestrator.isHighPressure ? [0.2, 0.6, 0.2] : [0.1, 0.3, 0.1], 
                    scale: orchestrator.isHighPressure ? [1, 1.4, 1] : [1, 1.2, 1] 
                  }}
                  transition={{ duration: orchestrator.isHighPressure ? 1.5 : 3, repeat: Infinity }}
                />
              </div>
              <div>
                <h1 className="font-mono text-2xl font-bold tracking-tight">ML Intelligence Hub</h1>
                <div className="flex items-center gap-3 mt-0.5">
                  <Badge variant="outline" className="text-[10px] uppercase tracking-tighter bg-primary/5 text-primary border-primary/20">Enterprise AI V2.6</Badge>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20">
                    <motion.div 
                      className="w-1.5 h-1.5 rounded-full bg-green-500"
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <span className="text-[10px] font-bold text-green-600 uppercase tracking-tight">Intelligence Active</span>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                    Last Sync: {new Date(lastRefresh).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex flex-col items-end mr-4">
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Ensemble Agreement</div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono font-bold text-primary">
                  {ensembleAgreement.toFixed(1)}%
                </span>
                <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-primary"
                    animate={{ width: `${ensembleAgreement}%` }}
                    transition={{ type: "spring", stiffness: 50 }}
                  />
                </div>
              </div>
            </div>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md border ${isSyncing ? 'border-primary/50 bg-primary/10' : 'border-border bg-muted/30'} transition-all`}>
              <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin text-primary' : 'text-muted-foreground'}`} />
              <span className={`text-[10px] font-bold uppercase tracking-widest ${isSyncing ? 'text-primary' : 'text-muted-foreground'}`}>
                {isSyncing ? 'Recalibrating' : 'Auto-Refresh Active'}
              </span>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
          <TabsList className="bg-muted/50 p-1 border border-border/50">
            <TabsTrigger value="overview" className="gap-2"><LayoutDashboard className="h-4 w-4" /> Operational View</TabsTrigger>
            <TabsTrigger value="models" className="gap-2"><Database className="h-4 w-4" /> Model Performance</TabsTrigger>
            <TabsTrigger value="explainability" className="gap-2"><Info className="h-4 w-4" /> Explainability</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Adaptive Risk Engine */}
              <Card className="border-primary/20 bg-card relative overflow-hidden group hover:shadow-[0_0_20px_rgba(var(--primary),0.05)] transition-all min-h-[180px]">
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
                  <AnimatePresence mode="wait">
                    {risk ? (
                      <motion.div
                        key="risk-content"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-4"
                      >
                        <div className="flex justify-between items-end">
                          <div>
                            <div className="text-4xl font-mono font-bold tracking-tighter">
                              {risk.risk_score}
                            </div>
                            <div className="text-[10px] font-bold text-muted-foreground uppercase mt-1 tracking-widest">Global Risk Score</div>
                          </div>
                          <div className="text-right">
                            <Badge className="bg-destructive/10 text-destructive border-destructive/20 mb-1">{risk.predicted_priority.toUpperCase()}</Badge>
                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Priority</div>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[10px] uppercase font-bold tracking-tighter">
                            <span>Inference Confidence</span>
                            <span>{(risk.confidence * 100).toFixed(1)}%</span>
                          </div>
                          <Progress value={risk.risk_score} className="h-1.5" />
                        </div>
                      </motion.div>
                    ) : (
                      <div className="space-y-4 pt-2">
                        <Skeleton className="h-10 w-24" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-1.5 w-full" />
                      </div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>

              {/* SLA Intelligence */}
              <Card className="border-blue-500/20 bg-card relative overflow-hidden group hover:shadow-[0_0_20px_rgba(59,130,246,0.05)] transition-all min-h-[180px]">
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
                  <AnimatePresence mode="wait">
                    {sla ? (
                      <motion.div
                        key="sla-content"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-4"
                      >
                        <div className="flex justify-between items-end">
                          <div>
                            <div className="text-4xl font-mono font-bold tracking-tighter">{(sla.predicted_resolution_time / 60).toFixed(0)}m</div>
                            <div className="text-[10px] font-bold text-muted-foreground uppercase mt-1 tracking-widest">Est. Resolution</div>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline" className="text-orange-500 border-orange-500/30 mb-1">{(sla.breach_probability * 100).toFixed(0)}% RISK</Badge>
                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Breach Prob.</div>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[10px] uppercase font-bold tracking-tighter">
                            <span>Queue Congestion</span>
                            <span>{(sla.queue_risk * 100).toFixed(0)}%</span>
                          </div>
                          <Progress value={sla.queue_risk * 100} className="h-1.5 bg-blue-100" />
                        </div>
                      </motion.div>
                    ) : (
                      <div className="space-y-4 pt-2">
                        <Skeleton className="h-10 w-24" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-1.5 w-full" />
                      </div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>

              {/* Threat Classifier */}
              <Card className="border-purple-500/20 bg-card relative overflow-hidden group hover:shadow-[0_0_20px_rgba(168,85,247,0.05)] transition-all min-h-[180px]">
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
                  <AnimatePresence mode="wait">
                    {threat ? (
                      <motion.div
                        key="threat-content"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-4"
                      >
                        <div className="p-3 bg-purple-500/5 border border-purple-500/10 rounded-lg">
                          <div className="text-lg font-bold capitalize text-purple-600 tracking-tight">{threat.threat_category.replace('_', ' ')}</div>
                          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Primary Classification</div>
                        </div>
                        <div className="space-y-2">
                          {Object.entries(threat.probability_distribution).slice(0, 2).map(([cat, prob]: [string, any]) => (
                            <div key={cat} className="space-y-1">
                              <div className="flex justify-between text-[9px] uppercase font-bold">
                                <span className="truncate">{cat.replace('_', ' ')}</span>
                                <span>{(prob * 100).toFixed(1)}%</span>
                              </div>
                              <Progress value={prob * 100} className="h-1 bg-purple-100" />
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ) : (
                      <div className="space-y-4 pt-2">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-full" />
                      </div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Predictive MITRE ATT&CK */}
              <Card className="border-orange-500/20 bg-card relative overflow-hidden group transition-all min-h-[220px]">
                <div className="absolute top-0 left-0 w-1 h-full bg-orange-500/40" />
                <CardHeader className="pb-4">
                  <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Target className="h-3.5 w-3.5 text-orange-500" /> Predictive MITRE ATT&CK
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AnimatePresence mode="wait">
                    {mitre ? (
                      <motion.div
                        key={`mitre-${mitre.predicted_techniques[0].technique_id}-${tick}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="flex flex-col md:flex-row gap-8 items-center"
                      >
                          <div className="flex-1 space-y-4 w-full">
                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Attack Chain Evolution</div>
                            <div className="flex items-center gap-4">
                              <div className="flex flex-col items-center">
                                <div className="w-10 h-10 rounded-full bg-background border-2 border-muted flex items-center justify-center font-mono text-xs font-bold shadow-sm">
                                  {mitre.observed_technique || 'T1078'}
                                </div>
                                <span className="text-[9px] font-bold text-muted-foreground uppercase mt-1">Observed</span>
                              </div>
                              <div className="flex-1 h-0.5 bg-gradient-to-r from-muted to-orange-500/30 relative min-w-[60px]">
                                <motion.div 
                                  className="absolute top-1/2 left-0 w-2 h-2 bg-orange-500 rounded-full -translate-y-1/2"
                                  animate={{ left: "100%" }}
                                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                />
                              </div>
                              <div className="flex flex-col items-center">
                                <div className="w-10 h-10 rounded-full bg-orange-500/10 border-2 border-orange-500/50 flex items-center justify-center font-mono text-xs font-bold text-orange-600 shadow-[0_0_10px_rgba(249,115,22,0.2)]">
                                  {mitre.predicted_techniques[0].technique_id}
                                </div>
                                <span className="text-[9px] font-bold text-orange-600 uppercase mt-1 tracking-tighter text-center">Predicted Next</span>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="p-2 rounded bg-muted/30 border border-border/50 text-center">
                                <div className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter">Progression</div>
                                <div className="text-sm font-mono font-bold text-orange-600">
                                  {(mitre.progression_probability * 100).toFixed(1)}%
                                </div>
                              </div>
                              <div className="p-2 rounded bg-muted/30 border border-border/50 text-center">
                                <div className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter">Lateral Mov.</div>
                                <div className="text-sm font-mono font-bold text-orange-600">
                                  {(mitre.lateral_movement_probability * 100).toFixed(1)}%
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
                                isAnimationActive={false}
                              />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
                      </motion.div>
                    ) : <Skeleton className="h-40 w-full" />}
                  </AnimatePresence>
                </CardContent>
              </Card>

              {/* Incident Correlation Engine */}
              <Card className="border-green-500/20 bg-card relative overflow-hidden group transition-all min-h-[220px]">
                <div className="absolute top-0 left-0 w-1 h-full bg-green-500/40" />
                <CardHeader className="pb-4">
                  <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Share2 className="h-3.5 w-3.5 text-green-500" /> Incident Correlation Engine
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {correlation ? (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-lg font-mono font-bold text-green-700 tracking-tight">
                            {correlation.campaign_id || 'ANALYZING CLUSTERS'}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-[9px] uppercase font-bold text-green-600 border-green-500/30">
                              {correlation.lifecycle || 'ACTIVE'}
                            </Badge>
                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active Campaign Identity</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-green-600">
                            {(correlation.similarity_score * 100).toFixed(1)}%
                          </div>
                          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Similarity Index</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Correlation Factors</div>
                          <div className="space-y-1.5">
                            {correlation.factors?.map((f: any) => (
                              <div key={f.name} className="space-y-1">
                                <div className="flex justify-between text-[9px] font-bold uppercase">
                                  <span>{f.name}</span>
                                  <span>{f.weight.toFixed(0)}%</span>
                                </div>
                                <Progress value={f.weight} className="h-1 bg-green-100" />
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="h-24 bg-muted/20 rounded-lg border border-border/50 flex items-center justify-center relative overflow-hidden">
                          <motion.div 
                            className="absolute inset-0 opacity-10"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                          >
                            <Network className="w-full h-full text-green-500" />
                          </motion.div>
                          <div className="flex items-center gap-2 relative z-10 flex-wrap justify-center p-2">
                            {correlation.linked_incidents?.slice(0, 4).map((id: string, i: number) => (
                              <div 
                                key={id} 
                                className="w-10 h-6 rounded bg-background border border-green-500/30 flex items-center justify-center text-[8px] font-mono font-bold text-green-700 shadow-sm"
                              >
                                {id}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-2 rounded bg-green-500/5 border border-green-500/10">
                        <div className="text-[9px] font-bold text-green-700 uppercase mb-1">Intelligence Evidence</div>
                        <div className="flex flex-wrap gap-1">
                          {correlation.ioc_overlap?.slice(0, 4).map((ioc: string) => (
                            <Badge key={ioc} variant="outline" className="text-[8px] h-4 bg-green-500/5 border-green-500/20 text-green-600">{ioc}</Badge>
                          ))}
                          <Badge variant="outline" className="text-[8px] h-4 bg-green-500/5 border-green-500/20 text-green-600">T1078 OVERLAP</Badge>
                        </div>
                      </div>
                    </div>
                  ) : <Skeleton className="h-40 w-full" />}
                </CardContent>
              </Card>
            </div>

            {/* UEBA & Behavioral Anomaly Engine */}
            <Card className="border-red-500/20 bg-card relative overflow-hidden group transition-all min-h-[160px]">
              <div className="absolute top-0 left-0 w-1 h-full bg-red-500/40" />
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Activity className="h-3.5 w-3.5 text-red-500" /> UEBA & Behavioral Anomaly Engine
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-red-500/5 text-red-600 border-red-500/20 text-[10px] tracking-widest font-bold">REALTIME MONITORING</Badge>
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                </div>
              </CardHeader>
              <CardContent>
                <AnimatePresence>
                  {ueba ? (
                    <motion.div
                      key={`ueba-active-${tick}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center"
                    >
                          <div className="md:col-span-2 space-y-4">
                            <div className="space-y-1.5">
                              <div className="flex justify-between text-[11px] uppercase font-bold tracking-tighter">
                                <span>Behavioral Drift from Baseline</span>
                                <span className="text-red-600 font-mono">
                                  {(ueba.anomaly_score * 100).toFixed(1)}% DEVIATION
                                </span>
                              </div>
                              <Progress value={ueba.anomaly_score * 100} className="h-2 bg-red-100" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-lg text-center">
                                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter mb-0.5">Affected Entity</div>
                                <div className="text-xs font-mono font-bold text-red-700 truncate">{ueba.affected_entity || 'N/A'}</div>
                              </div>
                              <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-lg text-center">
                                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter mb-0.5">Anomaly State</div>
                                <div className="text-xs font-bold text-red-700 capitalize">{(ueba.anomaly_type || 'unknown').replace(/_/g, ' ')}</div>
                              </div>
                              <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-lg text-center">
                                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter mb-0.5">Confidence</div>
                                <div className="text-xs font-mono font-bold text-red-700">{(ueba.confidence * 100).toFixed(0)}%</div>
                              </div>
                            </div>
                          </div>
                      <div className="h-32 border-l border-border/50 pl-8 flex flex-col justify-center">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-red-600" />
                            <span className="text-xs font-bold text-red-700 uppercase tracking-tight">Impact Analysis</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground leading-relaxed italic">
                            {ueba.anomaly_type === 'impossible_travel' 
                              ? "Geo-velocity violation detected. Entity accessing resources from distant locations within impossible timeframe."
                              : ueba.anomaly_type === 'abnormal_access_pattern'
                              ? "Behavior shows significant deviation from established baseline. Potential account takeover detected."
                              : "Heuristic analysis indicates high probability of privilege escalation or lateral movement attempt."}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="space-y-4">
                      <Skeleton className="h-10 w-full" />
                      <div className="grid grid-cols-3 gap-4">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                      </div>
                    </div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="models" className="space-y-6 mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Multi-Model Accuracy Distribution */}
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/50" />
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-500" /> Multi-Model Accuracy Distribution
                    </CardTitle>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-[8px] bg-blue-500/10 text-blue-500 border-blue-500/20">XGB</Badge>
                      <Badge variant="outline" className="text-[8px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20">ENS</Badge>
                      <Badge variant="outline" className="text-[8px] bg-violet-500/10 text-violet-500 border-violet-500/20">LGB</Badge>
                      <Badge variant="outline" className="text-[8px] bg-amber-500/10 text-amber-500 border-amber-500/20">NEU</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="h-64 pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={history.accuracy} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        {['XGBoostV4', 'EnsembleAlpha', 'LGBMOptimized', 'NeuralCorr'].map((id, i) => (
                          <linearGradient key={id} id={`color${id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'][i]} stopOpacity={0.4}/>
                            <stop offset="95%" stopColor={['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'][i]} stopOpacity={0}/>
                          </linearGradient>
                        ))}
                        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                          <feGaussianBlur stdDeviation="3" result="blur" />
                          <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="time" hide />
                      <YAxis domain={[80, 100]} hide />
                      <Tooltip content={<CustomChartTooltip suffix="%" />} />
                      <Area type="monotone" dataKey="XGBoostV4" stroke="#3b82f6" strokeWidth={2} fill="url(#colorXGBoostV4)" filter="url(#glow)" />
                      <Area type="monotone" dataKey="EnsembleAlpha" stroke="#10b981" strokeWidth={2} fill="url(#colorEnsembleAlpha)" filter="url(#glow)" />
                      <Area type="monotone" dataKey="LGBMOptimized" stroke="#8b5cf6" strokeWidth={2} fill="url(#colorLGBMOptimized)" filter="url(#glow)" />
                      <Area type="monotone" dataKey="NeuralCorr" stroke="#f59e0b" strokeWidth={2} fill="url(#colorNeuralCorr)" filter="url(#glow)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Inference Latency Comparison (Bar/Composed) */}
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/50" />
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                    <Zap className="h-4 w-4 text-emerald-500" /> Latency Benchmarks (ms)
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-64 pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={history.latency} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="rgba(255,255,255,0.03)" />
                      <XAxis dataKey="time" hide />
                      <YAxis hide />
                      <Tooltip content={<CustomChartTooltip suffix="ms" />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                      <Bar dataKey="XGBoostV4" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="EnsembleAlpha" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="LGBMOptimized" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="NeuralCorr" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Prediction Confidence Scatter */}
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-violet-500/50" />
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                    <Pulse className="h-4 w-4 text-violet-500" /> Ensemble Confidence Flux
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-64 pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={history.agreement} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorAgree" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.6}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.05}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="time" hide />
                      <YAxis domain={[80, 100]} hide />
                      <Tooltip content={<CustomChartTooltip suffix="%" />} />
                      <Area 
                        type="stepAfter" 
                        dataKey="value" 
                        stroke="#8b5cf6" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorAgree)" 
                        filter="url(#glow)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Quality Comparison Radar/Bar */}
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-amber-500/50" />
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                    <Target className="h-4 w-4 text-amber-500" /> Quality Comparison
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-64 pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={history.ruleVsMl} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(255,255,255,0.03)" />
                      <XAxis dataKey="time" hide />
                      <YAxis hide />
                      <Tooltip content={<CustomChartTooltip suffix="%" />} />
                      <Bar dataKey="ml" name="Machine Learning" fill="#3b82f6" radius={[10, 10, 0, 0]} />
                      <Bar dataKey="rule" name="Rule Based" fill="#94a3b8" radius={[10, 10, 0, 0]} opacity={0.4} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
              <Card className="lg:col-span-2 border-border/50 bg-card shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                    <Gauge className="h-4 w-4 text-primary" /> Model Performance Matrix
                  </CardTitle>
                  <CardDescription className="text-[11px] uppercase tracking-tight">Adaptive validation metrics for active ensemble engines</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow>
                        <TableHead className="text-[10px] font-bold uppercase tracking-widest">Engine Name</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase tracking-widest text-center">Accuracy</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase tracking-widest text-center">Latency</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase tracking-widest text-center">Trust Index</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase tracking-widest text-right">State</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {modelMetrics.map((model) => (
                        <TableRow key={model.name} className="hover:bg-muted/20 transition-colors">
                          <TableCell className="font-bold text-xs">{model.name}</TableCell>
                          <TableCell className="text-center font-mono text-xs">{model.accuracy}%</TableCell>
                          <TableCell className="text-center font-mono text-xs">{model.latency}ms</TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                                <motion.div 
                                  className={`h-full ${model.trust > 90 ? 'bg-green-500' : model.trust > 80 ? 'bg-blue-500' : 'bg-orange-500'}`} 
                                  animate={{ width: `${model.trust}%` }} 
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

              {/* Model Agreement & Drift */}
              <Card className="border-border/50 bg-card shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" /> Model Agreement & Drift
                  </CardTitle>
                  <CardDescription className="text-[11px] uppercase tracking-tight">Ensemble consensus and statistical deviation</CardDescription>
                </CardHeader>
                <CardContent>
                   <div className="space-y-6 py-2">
                     <div className="flex items-center justify-between">
                       <div className="space-y-1">
                         <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Ensemble Agreement</div>
                         <div className="text-2xl font-mono font-bold">{ensembleAgreement.toFixed(1)}%</div>
                       </div>
                       <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary flex items-center justify-center">
                         <span className="text-[10px] font-bold">{ensembleAgreement.toFixed(0)}</span>
                       </div>
                     </div>
                     <div className="space-y-4">
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[10px] font-bold uppercase tracking-tight">
                            <span>Drift Score</span>
                            <span className="font-mono text-orange-600">{driftScore.toFixed(2)}σ</span>
                          </div>
                          <Progress value={driftScore * 20} className="h-1.5" />
                        </div>
                        <div className="p-3 rounded bg-muted/30 border border-border/50 text-[11px] leading-relaxed italic text-muted-foreground">
                          "Agreement index measures cross-model variance. {driftScore > 3 ? "Significant drift detected." : "Current drift within parameters."}"
                        </div>
                     </div>
                   </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
              {[
                { label: 'FP Reduction', val: '64.2%', icon: Shield, color: 'text-green-600' },
                { label: 'Avg Inference', val: `${(42 + tick % 5)}ms`, icon: Zap, color: 'text-blue-600' },
                { label: 'Evidence Index', val: `${evidenceStrength.toFixed(1)}%`, icon: Search, color: 'text-primary' },
                { label: 'Sync Status', val: isSyncing ? 'Syncing' : 'Active', icon: Pulse, color: 'text-purple-600' },
              ].map((stat, i) => (
                <Card key={i} className="border-border/50 bg-card hover:border-primary/30 transition-all cursor-default overflow-hidden group">
                  <CardContent className="p-4 flex items-center gap-4 relative">
                    <div className={`p-2 rounded-lg bg-muted/50 ${stat.color} group-hover:scale-110 transition-transform`}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</div>
                      <div className="text-lg font-mono font-bold tracking-tight">{stat.val}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="explainability" className="space-y-6 mt-0">
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               <Card className="lg:col-span-1 border-border/50 bg-card/50 backdrop-blur-sm shadow-xl h-full overflow-hidden relative">
                 <div className="absolute top-0 left-0 w-1 h-full bg-primary/50" />
                 <CardHeader className="pb-2">
                   <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                     <Info className="h-4 w-4 text-primary" /> Feature Importance
                   </CardTitle>
                   <CardDescription className="text-[11px] uppercase tracking-tight font-medium text-muted-foreground/80">Adaptive weighting for active scoring</CardDescription>
                 </CardHeader>
                 <CardContent className="h-[600px] overflow-y-auto custom-scrollbar pr-2 pt-4">
                   <div className="space-y-4">
                     <AnimatePresence mode="popLayout">
                       {animatedFeatures.map((feature) => (
                         <motion.div 
                           key={feature.name} 
                           layout
                           initial={{ opacity: 0, x: -10 }}
                           animate={{ opacity: 1, x: 0 }}
                           exit={{ opacity: 0, x: 10 }}
                           transition={{ type: "spring", stiffness: 300, damping: 30 }}
                           className="space-y-1.5"
                         >
                           <div className="flex justify-between text-[10px] font-bold uppercase tracking-tight">
                             <span className="text-foreground/90">{feature.name}</span>
                             <span className="font-mono text-primary">{feature.weight.toFixed(0)}%</span>
                           </div>
                           <div className="h-2 bg-primary/5 rounded-full overflow-hidden border border-primary/5">
                             <motion.div 
                               className="h-full bg-gradient-to-r from-primary/40 to-primary"
                               initial={{ width: 0 }}
                               animate={{ width: `${feature.weight}%` }}
                               transition={{ type: "spring", stiffness: 100, damping: 20 }}
                             />
                           </div>
                         </motion.div>
                       ))}
                     </AnimatePresence>
                   </div>
                 </CardContent>
               </Card>

               <div className="lg:col-span-2 space-y-6">
                 <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-xl relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/50" />
                   <CardHeader className="pb-2">
                     <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                       <CheckCircle2 className="h-4 w-4 text-blue-500" /> Prediction Reasoning Log
                     </CardTitle>
                     <CardDescription className="text-[11px] uppercase tracking-tight">Deep inspection of ensemble logic & causal factors</CardDescription>
                   </CardHeader>
                   <CardContent className="pt-4">
                     <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                      <AnimatePresence mode="popLayout">
                        {reasoningLogs.map((log, i) => (
                          <motion.div 
                            key={`${log.timestamp}-${i}`}
                            layout
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 20, opacity: 0 }}
                            className="p-4 rounded-xl border border-border/40 bg-muted/10 flex gap-4 group hover:border-blue-500/30 hover:bg-blue-500/5 transition-all duration-300"
                          >
                            <div className="flex flex-col items-center justify-center border-r border-border/50 pr-4 min-w-[100px]">
                              <Badge 
                                variant="outline" 
                                className={`text-[9px] uppercase font-bold px-2 h-5 mb-1.5 shadow-sm ${
                                  log.severity === 'critical' ? 'text-destructive border-destructive/40 bg-destructive/10' :
                                  log.severity === 'high' ? 'text-orange-500 border-orange-500/40 bg-orange-500/10' :
                                  'text-blue-500 border-blue-500/40 bg-blue-500/10'
                                }`}
                              >
                                {log.engine}
                              </Badge>
                              <div className="text-[10px] font-mono font-bold text-muted-foreground tracking-tighter">{log.timestamp}</div>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-foreground/90 font-medium leading-relaxed italic group-hover:text-foreground transition-colors mb-2">"{log.reason}"</p>
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground uppercase">
                                  <UserCheck className="h-3.5 w-3.5" /> {log.attribution}
                                </div>
                                <div className="flex items-center gap-1 text-[10px] font-bold text-blue-500 uppercase">
                                  <Zap className="h-3.5 w-3.5" /> {log.confidence}% Confidence
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col items-center justify-center pl-2">
                                <div className={`w-2 h-2 rounded-full ${
                                  log.severity === 'critical' ? 'bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.5)]' :
                                  log.severity === 'high' ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]' :
                                  'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]'
                                }`} />
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                     </div>
                   </CardContent>
                 </Card>

                 <div className="grid grid-cols-2 gap-6">
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-lg overflow-hidden relative">
                       <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/50" />
                       <CardHeader className="pb-2">
                         <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">SHAP/LIME Consensus</CardTitle>
                       </CardHeader>
                       <CardContent className="h-40 flex items-center justify-center pt-0">
                        <div className="flex flex-col items-center">
                          <div className="text-4xl font-mono font-bold text-emerald-500">{(88 + Math.sin(tick/5)*4).toFixed(1)}%</div>
                          <p className="text-[11px] text-muted-foreground leading-snug text-center mt-2 max-w-[200px]">
                            Cross-model explainability agreement for the current prediction cluster.
                          </p>
                        </div>
                       </CardContent>
                    </Card>
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-lg overflow-hidden relative">
                       <div className="absolute top-0 left-0 w-1 h-full bg-violet-500/50" />
                       <CardHeader className="pb-2">
                         <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Decision Confidence</CardTitle>
                       </CardHeader>
                       <CardContent className="h-40 flex flex-col justify-center gap-4 pt-0">
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[10px] font-bold uppercase">
                            <span className="text-muted-foreground">Evidence Strength</span>
                            <span className="text-violet-500 font-mono">{evidenceStrength.toFixed(0)}%</span>
                          </div>
                          <div className="h-2 bg-violet-500/10 rounded-full overflow-hidden">
                            <motion.div className="h-full bg-violet-500" animate={{ width: `${evidenceStrength}%` }} />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[10px] font-bold uppercase">
                            <span className="text-muted-foreground">Signal Clarity</span>
                            <span className="text-violet-500 font-mono">{(evidenceStrength * 0.85).toFixed(0)}%</span>
                          </div>
                          <div className="h-2 bg-violet-500/10 rounded-full overflow-hidden">
                            <motion.div className="h-full bg-violet-500/60" animate={{ width: `${evidenceStrength * 0.85}%` }} />
                          </div>
                        </div>
                       </CardContent>
                    </Card>
                 </div>
               </div>
             </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
