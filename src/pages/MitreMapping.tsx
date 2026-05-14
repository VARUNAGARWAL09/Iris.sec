import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, ResponsiveContainer } from 'recharts';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Target, 
  Search, 
  Shield, 
  Eye,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Grid3X3,
  Copy,
  BookOpen,
  Crosshair,
  X,
  Activity,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { mitreTactics, MitreTactic, MitreTechnique, getAllTechniques, getTacticById } from '@/data/mitreAttack';
import { useMLInference } from '@/hooks/useMLInference';
import { useEffect } from 'react';

const TacticColumn = ({ 
  tactic, 
  onSelectTechnique,
  highlightedTechniques,
  selectedTactic,
  onSelectTactic,
  heatmapMode
}: { 
  tactic: MitreTactic; 
  onSelectTechnique: (technique: MitreTechnique) => void;
  highlightedTechniques: string[];
  selectedTactic: string | null;
  onSelectTactic: (tacticId: string | null) => void;
  heatmapMode: boolean;
}) => {
  const isSelected = selectedTactic === tactic.id;
  
  return (
    <div className="min-w-[180px] max-w-[180px] flex flex-col shrink-0">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button 
              onClick={() => onSelectTactic(isSelected ? null : tactic.id)}
              className={`p-3 rounded-t-xl text-center transition-all duration-300 relative overflow-hidden group border-b-2 ${
                isSelected 
                  ? 'bg-primary/10 border-primary text-primary shadow-[0_-5px_20px_rgba(var(--primary),0.15)] backdrop-blur-md' 
                  : 'bg-card/40 border-transparent text-muted-foreground hover:bg-card/60 hover:text-foreground hover:border-primary/40 backdrop-blur-sm'
              }`}
            >
              {isSelected && <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent pointer-events-none" />}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />
              <div className="font-bold text-xs tracking-wider uppercase mb-0.5 relative z-10">{tactic.shortName}</div>
              <div className="text-[9px] font-mono opacity-60 relative z-10">{tactic.id}</div>
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs z-50 bg-card/95 backdrop-blur border-border/50 shadow-xl">
            <p className="font-medium text-primary mb-1">{tactic.name}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{tactic.description}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <div className={`flex-1 rounded-b-xl p-2 space-y-2 transition-all duration-500 ${
        isSelected ? 'bg-primary/5 ring-1 ring-primary/30 shadow-[inset_0_0_20px_rgba(var(--primary),0.05)]' : 'bg-muted/20'
      }`}>
        {tactic.techniques.map(technique => {
          const isHighlighted = highlightedTechniques.includes(technique.id);
          
          // Deterministic mock visual data
          const charCode = technique.id.charCodeAt(technique.id.length - 1);
          const isEscalated = isHighlighted && charCode % 3 === 0;
          const isInvestigating = isHighlighted && !isEscalated && charCode % 2 === 0;
          
          const state = isEscalated ? 'escalated' : isInvestigating ? 'investigating' : isHighlighted ? 'detected' : 'dormant';
          const alertsCount = isHighlighted ? (charCode % 5) + 1 : 0;
          const maturityLevel = (charCode % 3) + 1;
          const severityColor = charCode % 3 === 0 ? 'bg-red-500' : charCode % 2 === 0 ? 'bg-amber-500' : 'bg-yellow-500';

          const getStateStyles = () => {
            if (heatmapMode) {
              const heatScore = isHighlighted ? 10 : (charCode * tactic.id.length) % 11;
              if (heatScore > 8) return 'bg-orange-500/40 border-orange-500/60 text-orange-100 shadow-[inset_0_0_30px_rgba(249,115,22,0.3)] relative before:absolute before:inset-0 before:bg-orange-500/20 before:animate-pulse';
              if (heatScore > 5) return 'bg-orange-500/20 border-orange-500/30 text-orange-200/90';
              if (heatScore > 2) return 'bg-orange-500/5 border-orange-500/10 text-muted-foreground/80';
              return 'bg-card/5 border-transparent text-muted-foreground/30 opacity-50';
            }
            if (state === 'escalated') return 'border-red-500/50 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.15)] text-red-500';
            if (state === 'investigating') return 'border-amber-500/50 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.15)] text-amber-500';
            if (state === 'detected') return 'border-destructive bg-destructive/15 shadow-[0_0_15px_rgba(var(--destructive),0.2)] text-destructive';
            return 'bg-card/40 text-card-foreground hover:bg-card/80 hover:shadow-md border-border/40 hover:border-primary/40 backdrop-blur-sm';
          };

          return (
            <TooltipProvider key={technique.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.button
                    whileHover={{ y: -2, scale: 1.02 }}
                    onClick={() => onSelectTechnique(technique)}
                    className={`w-full text-left p-2.5 rounded-lg text-xs transition-all duration-300 border relative overflow-hidden group ${getStateStyles()}`}
                  >
                    {!isHighlighted && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />
                    )}
                    
                    <div className="flex items-start justify-between mb-1.5 relative z-10">
                      <div className="font-mono text-[9px] opacity-70 tracking-wider flex items-center gap-1.5">
                        {isHighlighted && <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse shadow-[0_0_8px_currentColor]"></div>}
                        {technique.id}
                      </div>
                      <div className="flex items-center gap-1">
                        {isHighlighted && <span className="text-[8px] font-bold uppercase tracking-widest opacity-90">{state}</span>}
                        {alertsCount > 0 && (
                          <Badge variant="outline" className="text-[8px] px-1 py-0 h-3 border-current/30 text-current bg-current/10">
                            {alertsCount}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="font-medium leading-tight mb-2.5 relative z-10 line-clamp-2">
                      {technique.name}
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-current/10 relative z-10">
                      <div className="flex items-center gap-0.5">
                        {[1,2,3].map(level => (
                          <div key={level} className={`w-3 h-1 rounded-sm ${level <= maturityLevel ? (isHighlighted ? 'bg-current' : 'bg-primary/70') : (isHighlighted ? 'bg-current/20' : 'bg-primary/20')}`}></div>
                        ))}
                      </div>
                      <div className={`w-1.5 h-1.5 rounded-full ${severityColor} shadow-[0_0_5px_currentColor]`}></div>
                    </div>
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-sm z-50 bg-card/95 backdrop-blur border-border/50 shadow-xl">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary">{technique.id}</Badge>
                      <span className="font-semibold text-sm">{technique.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{technique.description}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
    </div>
  );
};

const TechniqueDetail = ({ 
  technique, 
  open, 
  onOpenChange 
}: { 
  technique: MitreTechnique | null; 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
}) => {
  if (!technique) return null;
  
  const { predictMitre, loading } = useMLInference();
  const [mlPrediction, setMlPrediction] = useState<any>(null);

  useEffect(() => {
    if (open && technique) {
      const fetchPrediction = async () => {
        const result = await predictMitre([technique.id]);
        if (result) setMlPrediction(result);
      };
      fetchPrediction();
    }
  }, [open, technique?.id]);
  
  const tactic = getTacticById(technique.tacticId);
  
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  // Deterministic mock data for the intelligence cards
  const charCode = technique.id.charCodeAt(technique.id.length - 1);
  const severityScore = (charCode % 5) + 6; // 6 to 10
  const incidentCount = charCode % 4;
  const analystConfidence = 70 + (charCode % 25); // 70 to 94
  const automatedCoverage = 40 + (charCode % 50); // 40 to 89
  const aiInsight = charCode % 2 === 0 
    ? "High probability of lateral movement if left uncontained. Recommend immediate endpoint isolation."
    : "Behavior matches known APT29 campaign signatures. Review associated compromised credentials.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 border-primary/20 bg-card/95 backdrop-blur-xl shadow-[0_0_50px_rgba(var(--primary),0.1)] sm:rounded-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none"></div>
        
        {/* Header Section */}
        <div className="p-6 border-b border-border/40 relative z-10 bg-background/50">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Badge variant="outline" className="font-mono text-primary border-primary/30 bg-primary/10 tracking-widest px-2 py-0.5 text-xs">
                  {technique.id}
                </Badge>
                {tactic && (
                  <Badge variant="secondary" className="font-mono text-muted-foreground bg-secondary/50">
                    <Crosshair className="h-3 w-3 mr-1.5" />
                    {tactic.name}
                  </Badge>
                )}
                {incidentCount > 0 && (
                  <Badge variant="destructive" className="animate-pulse">
                    <AlertTriangle className="h-3 w-3 mr-1" /> Active Incidents ({incidentCount})
                  </Badge>
                )}
              </div>
              <DialogTitle className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                {technique.name}
              </DialogTitle>
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              className="gap-2 shrink-0 border-border/50 hover:bg-secondary transition-colors"
              onClick={() => {
                copyToClipboard(
                  `${technique.id}: ${technique.name}\n\nTactic: ${tactic?.name}\n\nDescription: ${technique.description}`,
                  'Technique details'
                );
              }}
            >
              <Copy className="h-4 w-4" />
              Copy Intel
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-mono text-muted-foreground tracking-widest">Threat Severity</span>
              <div className="flex items-center gap-2">
                <span className={`text-xl font-bold font-mono ${severityScore >= 8 ? 'text-red-400' : 'text-amber-400'}`}>
                  {severityScore}/10
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-mono text-muted-foreground tracking-widest">Detection Confidence</span>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold font-mono text-green-400">{analystConfidence}%</span>
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-mono text-muted-foreground tracking-widest">Auto Response Coverage</span>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold font-mono text-primary">{automatedCoverage}%</span>
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-mono text-muted-foreground tracking-widest">Linked Playbooks</span>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold font-mono text-muted-foreground">{charCode % 3 + 1}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Body Section */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          <div className="md:col-span-2 space-y-6">
            
            {/* AI Insights Card */}
            <Card className="border-primary/30 bg-primary/5 shadow-[0_0_15px_rgba(var(--primary),0.05)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
              <CardContent className="p-4 flex gap-4">
                <div className="mt-1">
                  <Activity className="h-5 w-5 text-primary animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary">AI Containment Insight</h4>
                  <p className="text-sm text-foreground/90 leading-relaxed">
                    {mlPrediction 
                      ? `ML predicts a ${(mlPrediction.progression_probability * 100).toFixed(0)}% likelihood of attack progression. Next likely technique: ${mlPrediction.predicted_techniques[0]?.name || 'Unknown'}.`
                      : aiInsight}
                  </p>
                </div>
              </CardContent>
            </Card>

            {mlPrediction && (
              <Card className="border-orange-500/30 bg-orange-500/5">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="h-4 w-4 text-orange-500" />
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-orange-500">Predictive Attack Path</h4>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-[10px] font-mono border">{technique.id}</div>
                      <div className="w-0.5 h-4 bg-muted"></div>
                      <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-[10px] font-mono border border-orange-500/50">{mlPrediction.predicted_techniques[0]?.technique_id}</div>
                    </div>
                    <div className="space-y-4">
                      <div className="text-xs">
                        <span className="font-semibold">Current:</span> {technique.name}
                      </div>
                      <div className="text-xs">
                        <span className="font-semibold text-orange-500">Predicted Next:</span> {mlPrediction.predicted_techniques[0]?.name}
                        <Badge variant="secondary" className="ml-2 text-[8px]">{(mlPrediction.predicted_techniques[0]?.confidence * 100).toFixed(0)}% Conf.</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2 text-sm uppercase tracking-widest text-muted-foreground border-b border-border/40 pb-2">
                <BookOpen className="h-4 w-4" />
                Operational Overview
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {technique.description}
              </p>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2 text-sm uppercase tracking-widest text-muted-foreground border-b border-border/40 pb-2 text-blue-400">
                <Eye className="h-4 w-4" />
                Detection Telemetry
              </h4>
              <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4 text-sm text-muted-foreground leading-relaxed">
                {technique.detection}
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2 text-sm uppercase tracking-widest text-muted-foreground border-b border-border/40 pb-2 text-emerald-400">
                <Shield className="h-4 w-4" />
                Mitigation & Response
              </h4>
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-4 text-sm text-muted-foreground leading-relaxed">
                {technique.mitigation}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Intelligence Side Panel */}
            <Card className="border-border/40 bg-card/60 backdrop-blur-sm">
              <CardContent className="p-4 space-y-4">
                <div className="space-y-2">
                  <h5 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Related Sub-Techniques</h5>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="outline" className="text-[10px] font-mono border-border/50 text-muted-foreground hover:bg-secondary transition-colors cursor-pointer">{technique.id}.001</Badge>
                    <Badge variant="outline" className="text-[10px] font-mono border-border/50 text-muted-foreground hover:bg-secondary transition-colors cursor-pointer">{technique.id}.002</Badge>
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t border-border/40">
                  <h5 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Data Sources</h5>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="w-1 h-1 rounded-full bg-primary/70"></div> Endpoint Logs
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="w-1 h-1 rounded-full bg-primary/70"></div> Network Traffic
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="w-1 h-1 rounded-full bg-primary/70"></div> Identity Activity
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border/40">
                  <Button variant="outline" className="w-full gap-2 text-xs shadow-sm hover:bg-secondary transition-colors" asChild>
                    <a 
                      href={`https://attack.mitre.org/techniques/${technique.id}/`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      View MITRE Portal
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const TechniqueListItem = ({
  technique,
  onClick,
  isHighlighted
}: {
  technique: MitreTechnique;
  onClick: () => void;
  isHighlighted: boolean;
}) => {
  const tactic = getTacticById(technique.tacticId);
  const charCode = technique.id.charCodeAt(technique.id.length - 1);
  const severityColor = charCode % 3 === 0 ? 'bg-red-500' : charCode % 2 === 0 ? 'bg-amber-500' : 'bg-yellow-500';
  
  return (
    <Card 
      className={`cursor-pointer transition-all duration-300 relative overflow-hidden group hover:-translate-y-1 ${
        isHighlighted 
          ? 'border-destructive/50 bg-destructive/10 shadow-[0_4px_20px_rgba(var(--destructive),0.15)] hover:border-destructive' 
          : 'border-border/40 bg-card/40 backdrop-blur-md hover:border-primary/40 hover:shadow-[0_4px_20px_rgba(var(--primary),0.1)]'
      }`}
      onClick={onClick}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />
      <CardContent className="p-4 relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground/90">{technique.name}</span>
              {isHighlighted && (
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse shadow-[0_0_8px_rgba(var(--destructive),0.6)]"></div>
                  <Badge variant="destructive" className="text-[9px] px-1.5 py-0 h-4 tracking-widest uppercase">
                    Detected
                  </Badge>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] font-mono border-primary/20 text-primary bg-primary/5">{technique.id}</Badge>
              {tactic && (
                <Badge variant="secondary" className="text-[10px] bg-secondary/50 text-muted-foreground">{tactic.shortName}</Badge>
              )}
            </div>
          </div>
          <div className="shrink-0">
             <Target className={`h-4 w-4 ${isHighlighted ? 'text-destructive' : 'text-muted-foreground/50'}`} />
          </div>
        </div>
        <p className="text-xs text-muted-foreground/80 mt-2 line-clamp-2 leading-relaxed">
          {technique.description}
        </p>
        <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between">
           <div className="flex items-center gap-1 text-[10px] uppercase font-mono text-muted-foreground tracking-widest">
             <Activity className="h-3 w-3" />
             Telemetry Match
           </div>
           <div className={`h-1.5 w-1.5 rounded-full ${severityColor} shadow-[0_0_5px_currentColor]`}></div>
        </div>
      </CardContent>
    </Card>
  );
};

const TacticInfo = ({ tactic, onClose }: { tactic: MitreTactic; onClose: () => void }) => {
  return (
    <Card className="border-primary/40 bg-card/60 backdrop-blur-md shadow-[0_4px_25px_rgba(var(--primary),0.1)] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none"></div>
      <CardHeader className="pb-3 relative z-10 border-b border-border/40">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2 font-bold tracking-tight">
            <Crosshair className="h-5 w-5 text-primary" />
            {tactic.name}
            <Badge variant="outline" className="ml-2 text-xs font-mono border-primary/30 text-primary bg-primary/10">
              {tactic.id}
            </Badge>
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive transition-colors">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription className="text-xs tracking-widest uppercase font-mono text-muted-foreground">Tactical Objective Overview</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-4 relative z-10">
        <p className="text-sm text-foreground/80 leading-relaxed">{tactic.description}</p>
        <div className="pt-2">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
            <Grid3X3 className="h-3 w-3" />
            Associated Techniques ({tactic.techniques.length})
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {tactic.techniques.map(tech => (
              <Badge key={tech.id} variant="outline" className="text-[10px] font-mono border-border/50 bg-secondary/20 hover:bg-primary/10 hover:border-primary/40 transition-colors cursor-default">
                {tech.id}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function MitreMapping() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTechnique, setSelectedTechnique] = useState<MitreTechnique | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [highlightedTechniques, setHighlightedTechniques] = useState<string[]>([]);
  const [selectedTactic, setSelectedTactic] = useState<string | null>(null);
  const [heatmapMode, setHeatmapMode] = useState(false);
  
  const allTechniques = getAllTechniques();
  
  const filteredTechniques = allTechniques.filter(tech => 
    tech.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tech.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tech.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleSelectTechnique = (technique: MitreTechnique) => {
    setSelectedTechnique(technique);
    setDialogOpen(true);
  };
  
  const toggleHighlight = (techId: string) => {
    setHighlightedTechniques(prev => 
      prev.includes(techId) 
        ? prev.filter(id => id !== techId)
        : [...prev, techId]
    );
  };
  
  const handleExecutePlaybook = () => {
    toast.success('Playbook PB-092 execution initiated.');
    setTimeout(() => {
      setHighlightedTechniques(prev => prev.filter(t => t !== 'T1059'));
      toast.success('T1059 campaign successfully contained.', { icon: '🛡️' });
    }, 1500);
  };
  
  // Example detected techniques
  const exampleDetectedTechniques = ['T1566', 'T1059', 'T1078', 'T1021'];
  
  const selectedTacticData = selectedTactic ? getTacticById(selectedTactic) : null;
  
  return (
    <MainLayout>
      {/* Tactical Ambient Backgrounds */}
      <div className="fixed inset-0 pointer-events-none z-[-1] bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      <div className="fixed top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-primary/5 to-transparent blur-[100px] pointer-events-none z-[-1]"></div>

      <div className="space-y-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3 tracking-tight">
              <Target className="h-8 w-8 text-primary" />
              MITRE ATT&CK Mapping
            </h1>
            <p className="text-muted-foreground mt-1">
              Interactive threat framework and tactical mapping matrix
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant={heatmapMode ? "default" : "outline"}
              size="sm"
              className={`gap-2 shadow-sm transition-all duration-500 ${heatmapMode ? 'bg-orange-500 hover:bg-orange-600 border-orange-500 text-white shadow-[0_0_20px_rgba(249,115,22,0.4)]' : ''}`}
              onClick={() => setHeatmapMode(!heatmapMode)}
            >
              <Activity className="h-4 w-4" /> Heatmap Mode
            </Button>
            <Button 
              variant={highlightedTechniques.length > 0 ? "default" : "outline"}
              size="sm"
              className="gap-2 shadow-sm transition-all"
              onClick={() => {
                if (highlightedTechniques.length > 0) {
                  setHighlightedTechniques([]);
                  toast.info('Highlights cleared');
                } else {
                  setHighlightedTechniques(exampleDetectedTechniques);
                  toast.success(`${exampleDetectedTechniques.length} techniques highlighted`);
                }
              }}
            >
              {highlightedTechniques.length > 0 ? (
                <>
                  <X className="h-4 w-4" /> Clear Detections
                </>
              ) : (
                <>
                  <Activity className="h-4 w-4" /> Simulate Threat Intel
                </>
              )}
            </Button>
          </div>
        </div>
        
        {/* Intelligence Header Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border/40 bg-card/40 backdrop-blur-md overflow-hidden group hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(var(--primary),0.1)] transition-all cursor-default">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                <Grid3X3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-mono text-muted-foreground tracking-widest">Active Tactics</p>
                <p className="text-2xl font-bold font-mono">{mitreTactics.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/40 bg-card/40 backdrop-blur-md overflow-hidden group hover:border-blue-400/40 hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(96,165,250,0.1)] transition-all cursor-default">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20">
                <Shield className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-mono text-muted-foreground tracking-widest">Threat Coverage</p>
                <p className="text-2xl font-bold font-mono">{allTechniques.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/40 bg-card/40 backdrop-blur-md overflow-hidden group hover:border-green-400/40 hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(74,222,128,0.1)] transition-all cursor-default">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center shrink-0 border border-green-500/20">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-mono text-muted-foreground tracking-widest">Detection Confidence</p>
                <p className="text-2xl font-bold font-mono">92%</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/40 bg-card/40 backdrop-blur-md overflow-hidden group hover:border-red-400/40 hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(248,113,113,0.1)] transition-all cursor-default">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0 border border-red-500/20">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-mono text-muted-foreground tracking-widest">Active Campaigns</p>
                <p className="text-2xl font-bold font-mono">{highlightedTechniques.length || 3}</p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6 items-start">
          {/* Main Content (Left) */}
          <div className="space-y-6 min-w-0">
            <Tabs defaultValue="matrix" className="space-y-6">
              <div className="flex items-center gap-4 border-b border-border/40 pb-2">
                <TabsList className="bg-transparent h-auto p-0 space-x-6 border-b-0">
                  <TabsTrigger 
                    value="matrix" 
                    className="gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-2"
                  >
                    <Grid3X3 className="h-4 w-4" />
                    Tactical Matrix
                  </TabsTrigger>
                  <TabsTrigger 
                    value="list" 
                    className="gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-2"
                  >
                    <Target className="h-4 w-4" />
                    Technique Database
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="matrix" className="space-y-4">
                {selectedTacticData && (
                  <TacticInfo 
                    tactic={selectedTacticData} 
                    onClose={() => setSelectedTactic(null)} 
                  />
                )}
                
                <Card className="border-border/60 bg-card/40 backdrop-blur shadow-sm">
                  <CardHeader className="pb-3 border-b border-border/40">
                    <CardTitle className="text-sm font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Grid3X3 className="h-4 w-4" />
                      ATT&CK Matrix Explorer
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Navigate the tactical matrix. Click tactics to filter, click techniques for intelligence mapping.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto overflow-y-visible">
                      <div className="flex gap-2 p-6 pt-4" style={{ minWidth: 'max-content' }}>
                        {mitreTactics.map(tactic => (
                          <TacticColumn 
                            key={tactic.id} 
                            tactic={tactic} 
                            onSelectTechnique={handleSelectTechnique}
                            highlightedTechniques={highlightedTechniques}
                            selectedTactic={selectedTactic}
                            onSelectTactic={setSelectedTactic}
                            heatmapMode={heatmapMode}
                          />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {highlightedTechniques.length > 0 && (
                  <Card className="border-destructive/30 bg-destructive/5 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-destructive/10 animate-pulse pointer-events-none opacity-20"></div>
                    <CardHeader className="pb-3 relative z-10">
                      <CardTitle className="text-sm uppercase tracking-widest font-bold flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-4 w-4" />
                        Active Detection Intelligence
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Techniques currently observed in live telemetry
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <div className="flex flex-wrap gap-2">
                        {highlightedTechniques.map(techId => {
                          const tech = allTechniques.find(t => t.id === techId);
                          return tech ? (
                            <Badge 
                              key={techId}
                              variant="destructive" 
                              className="cursor-pointer hover:bg-destructive/80 gap-1.5 px-3 py-1 text-xs transition-colors shadow-sm"
                              onClick={() => handleSelectTechnique(tech)}
                            >
                              <span className="font-mono">{tech.id}</span>
                              <div className="w-px h-3 bg-destructive-foreground/30"></div>
                              {tech.name}
                              <button 
                                className="ml-1.5 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleHighlight(techId);
                                }}
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="list" className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card/40 backdrop-blur-md border border-border/50 p-4 rounded-xl relative overflow-hidden group/search focus-within:border-primary/40 focus-within:shadow-[0_0_20px_rgba(var(--primary),0.1)] transition-all duration-500">
                  {/* Focus scanline effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent translate-x-[-100%] group-focus-within/search:translate-x-[100%] transition-transform duration-1000 pointer-events-none"></div>
                  
                  <div className="relative flex-1 max-w-xl">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                      <Search className="h-4 w-4 text-primary" />
                      <div className="h-2 w-2 rounded-full bg-primary/50 animate-pulse"></div>
                    </div>
                    <Input
                      placeholder="Search tactical database by technique name, ID, or threat behavior..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 bg-background/60 border-primary/20 focus-visible:ring-primary/40 focus-visible:ring-offset-0 h-10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] transition-all font-mono text-sm placeholder:font-sans"
                    />
                    {searchTerm && (
                      <button 
                        onClick={() => setSearchTerm('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 shrink-0 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary/50 rounded-md border border-border/50">
                      <span className="text-[10px] uppercase font-mono text-muted-foreground tracking-widest">Matches</span>
                      <span className="text-xs font-bold text-primary font-mono">{filteredTechniques.length}</span>
                    </div>
                    
                    <div className="w-px h-6 bg-border/50 hidden md:block"></div>
                    
                    <div className="flex gap-2">
                      <Badge variant="outline" className="cursor-pointer bg-primary/10 text-primary border-primary/30 hover:bg-primary/20 transition-colors font-mono text-[10px] py-1 px-2.5 shadow-[0_0_10px_rgba(var(--primary),0.1)]">
                        ALL INTEL
                      </Badge>
                      <Badge variant="outline" className="cursor-pointer bg-card/60 hover:bg-accent text-muted-foreground transition-colors font-mono text-[10px] py-1 px-2.5 border-border/50">
                        DETECTED
                      </Badge>
                      <Badge variant="outline" className="cursor-pointer bg-card/60 hover:bg-accent text-muted-foreground transition-colors font-mono text-[10px] py-1 px-2.5 border-border/50 hidden sm:inline-flex">
                        CRITICAL
                      </Badge>
                    </div>
                  </div>
                </div>
                
                {filteredTechniques.length === 0 ? (
                  <Card className="border-border/40 bg-card/20 backdrop-blur-sm">
                    <CardContent className="py-16 text-center">
                      <Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                      <h3 className="font-medium text-lg mb-1">No Intelligence Found</h3>
                      <p className="text-muted-foreground text-sm">Adjust search parameters to broaden the query</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTechniques.map(technique => (
                      <TechniqueListItem
                        key={technique.id}
                        technique={technique}
                        onClick={() => handleSelectTechnique(technique)}
                        isHighlighted={highlightedTechniques.includes(technique.id)}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Intelligence Sidebar (Right) */}
          <div className="space-y-4">
            
            {/* AI Recommendations */}
            <Card className="border-primary/40 bg-primary/5 shadow-[0_0_15px_rgba(var(--primary),0.05)] relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50"></div>
              <CardHeader className="pb-2 pt-3 px-3 relative z-10 border-b border-primary/10">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[10px] uppercase tracking-widest text-primary flex items-center gap-1.5 font-bold">
                    <Zap className="h-3 w-3" />
                    AI Orchestration
                  </CardTitle>
                  <Badge variant="outline" className="text-[8px] h-4 px-1.5 py-0 border-primary/30 text-primary bg-primary/10">ACTIVE</Badge>
                </div>
              </CardHeader>
              <CardContent className="px-3 py-3 relative z-10 space-y-2.5">
                <p className="text-xs text-foreground/80 leading-snug">
                  Automated containment playbook <span className="text-primary font-mono font-bold">PB-092</span> recommended for active T1059 campaign.
                </p>
                <Button 
                  size="sm" 
                  className="w-full h-7 text-[10px] font-bold tracking-widest uppercase gap-2 bg-primary/20 text-primary hover:bg-primary/30 border border-primary/30"
                  onClick={handleExecutePlaybook}
                >
                  <Activity className="h-3 w-3" />
                  Execute Playbook
                </Button>
              </CardContent>
            </Card>

            {/* Threat Telemetry & Top Targeted */}
            <Card className="border-border/50 bg-card/60 backdrop-blur-md shadow-sm hover:border-primary/30 transition-colors">
              <CardHeader className="pb-2 pt-3 px-3 border-b border-border/40">
                <CardTitle className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                  <Target className="h-3 w-3 text-blue-400" />
                  Telemetry Trends
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 py-3 space-y-4">
                <div className="h-16 w-full opacity-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[{name: 'Mon', val: 12}, {name: 'Tue', val: 18}, {name: 'Wed', val: 24}, {name: 'Thu', val: 15}, {name: 'Fri', val: 32}, {name: 'Sat', val: 10}]}>
                      <Bar dataKey="val" fill="currentColor" className="fill-blue-500/50" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-1.5 pt-2 border-t border-border/40">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-muted-foreground font-mono">1. Execution</span>
                    <span className="text-blue-400 font-bold font-mono">42%</span>
                  </div>
                  <div className="h-1 w-full bg-secondary/50 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full animate-[pulse_3s_ease-in-out_infinite]" style={{ width: '42%' }}></div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] mt-2">
                    <span className="text-muted-foreground font-mono">2. Credential Access</span>
                    <span className="text-amber-400 font-bold font-mono">28%</span>
                  </div>
                  <div className="h-1 w-full bg-secondary/50 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full animate-[pulse_4s_ease-in-out_infinite]" style={{ width: '28%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Live Threat Stream */}
            <Card className="border-border/50 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden group/stream hover:border-red-500/30 transition-colors">
              <div className="absolute inset-0 pointer-events-none opacity-[0.03] group-hover/stream:opacity-[0.05] transition-opacity bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-0"></div>
              <CardHeader className="pb-2 pt-3 px-3 border-b border-border/40 relative z-10">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                    <Activity className="h-3 w-3 text-red-400" />
                    Live Threat Feed
                  </CardTitle>
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-3 py-3 relative z-10">
                <div className="space-y-3">
                  {[
                    { tech: 'T1566', name: 'Phishing', desc: 'APT29 campaign', color: 'text-red-400', time: '2m' },
                    { tech: 'T1059', name: 'Scripting', desc: 'PowerShell execution', color: 'text-amber-400', time: '14m' },
                    { tech: 'T1078', name: 'Valid Accounts', desc: 'Impossible travel', color: 'text-amber-400', time: '1h' },
                    { tech: 'T1021', name: 'Remote Services', desc: 'RDP brute force', color: 'text-blue-400', time: '3h' }
                  ].map((alert, i) => (
                    <div key={i} className="flex gap-2.5 relative before:absolute before:left-[5px] before:top-4 before:bottom-[-12px] before:w-[1px] before:bg-border/50 last:before:hidden">
                      <div className="mt-0.5 shrink-0">
                        <div className={`h-3 w-3 rounded-full border border-border bg-background flex items-center justify-center relative z-10`}>
                          <div className={`h-1 w-1 rounded-full bg-current ${alert.color}`}></div>
                        </div>
                      </div>
                      <div className="space-y-0.5 pb-0.5 w-full">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-mono font-bold tracking-wider text-foreground">
                            {alert.tech}
                          </p>
                          <span className="text-[8px] font-mono text-muted-foreground">{alert.time}</span>
                        </div>
                        <p className="text-[9px] text-muted-foreground leading-tight truncate">{alert.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Analyst Insights & Protection Posture */}
            <Card className="border-border/50 bg-card/60 backdrop-blur-md shadow-sm hover:border-emerald-500/30 transition-colors">
              <CardHeader className="pb-2 pt-3 px-3 border-b border-border/40">
                <CardTitle className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                  <Shield className="h-3 w-3 text-emerald-400" />
                  Posture Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 py-3 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-secondary/30 rounded p-2 border border-border/40 text-center hover:bg-secondary/50 transition-colors">
                    <p className="text-[8px] uppercase font-mono text-muted-foreground mb-0.5">Confidence</p>
                    <p className="text-sm font-bold text-emerald-400 font-mono">92%</p>
                  </div>
                  <div className="bg-secondary/30 rounded p-2 border border-border/40 text-center hover:bg-secondary/50 transition-colors">
                    <p className="text-[8px] uppercase font-mono text-muted-foreground mb-0.5">Active Camps</p>
                    <p className="text-sm font-bold text-red-400 font-mono animate-pulse">3</p>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
        
        <TechniqueDetail 
          technique={selectedTechnique}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      </div>
    </MainLayout>
  );
}
