import { useState } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid } from 'recharts';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import {
  PlayCircle,
  CheckCircle2,
  Clock,
  FileText,
  ChevronRight,
  Zap,
  User,
  AlertTriangle,
  Shield,
  Target,
  Pause,
  RotateCcw,
  Check,
  SkipForward,
  MessageSquare,
  XCircle,
  Plus,
  Filter,
  Search,
  Eye,
  BarChart2,
  BrainCircuit,
  Activity,
  TrendingUp
} from 'lucide-react';
import { defaultPlaybooks, Playbook, PlaybookStep, PlaybookStepStatus } from '@/data/playbooks';
import { getTechniqueById } from '@/data/mitreAttack';
import { SeverityBadge } from '@/components/ui/SeverityBadge';

interface StepState {
  status: PlaybookStepStatus;
  completedAt?: Date;
  notes: string;
}

interface ExecutionState {
  isRunning: boolean;
  startedAt?: Date;
  stepStates: Record<string, StepState>;
}

const PlaybookCard = ({
  playbook,
  onSelect
}: {
  playbook: Playbook;
  onSelect: (playbook: Playbook) => void;
}) => {
  const automatedSteps = playbook.steps.filter(s => s.actionType === 'automated').length;
  const automationPct = playbook.steps.length > 0 ? Math.round((automatedSteps / playbook.steps.length) * 100) : 0;
  // Deterministic mock for active incidents to maintain stable visual without altering logic
  const activeIncidents = (playbook.id.charCodeAt(0) + playbook.id.charCodeAt(playbook.id.length - 1)) % 4;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group relative h-full flex flex-col"
    >
      {/* Tactical Glow & Animated Border */}
      <div className="absolute -inset-[1px] bg-gradient-to-br from-primary/30 via-transparent to-primary/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
      <div className="absolute -inset-[1px] bg-gradient-to-br from-primary/50 via-border to-border/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <Card
        className="relative h-full flex flex-col cursor-pointer border-border/40 bg-card/60 backdrop-blur-md shadow-sm transition-all duration-300 z-10 overflow-hidden"
        onClick={() => onSelect(playbook)}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 transition-transform duration-500 group-hover:scale-150"></div>
        
        <CardHeader className="pb-3 pt-4 px-4 flex-none">
          <div className="flex flex-col gap-2">
            <div className="flex items-start justify-between gap-3">
              <CardTitle className="text-base font-bold text-foreground/90 group-hover:text-primary transition-colors leading-tight line-clamp-2">
                {playbook.name}
              </CardTitle>
              <div className="flex items-center gap-1.5 text-[10px] uppercase font-mono text-muted-foreground bg-secondary/50 px-1.5 py-0.5 rounded border border-border/50 shrink-0">
                <div className={`w-1.5 h-1.5 rounded-full ${activeIncidents > 0 ? 'bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'bg-primary/50'}`}></div>
                {activeIncidents} Active
              </div>
            </div>
            <div className="flex flex-wrap gap-1">
              {playbook.severity.map(sev => (
                <SeverityBadge key={sev} severity={sev as any} />
              ))}
            </div>
            <CardDescription className="text-xs leading-relaxed text-muted-foreground mt-1 line-clamp-2">
              {playbook.description}
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="px-4 pb-4 flex-1 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            {/* Telemetry & Stats */}
            <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-black/20 border border-white/5">
              <div className="flex flex-col items-center justify-center gap-1 text-center">
                <span className="text-[9px] uppercase text-muted-foreground font-semibold tracking-wider">Contain</span>
                <div className="flex items-center gap-1 text-xs font-mono text-foreground/80">
                  <Clock className="h-3 w-3 text-primary/70" />
                  {playbook.estimatedDuration}m
                </div>
              </div>
              <div className="flex flex-col items-center justify-center gap-1 text-center border-x border-white/5">
                <span className="text-[9px] uppercase text-muted-foreground font-semibold tracking-wider">Steps</span>
                <div className="flex items-center gap-1 text-xs font-mono text-foreground/80">
                  <FileText className="h-3 w-3 text-primary/70" />
                  {playbook.steps.length}
                </div>
              </div>
              <div className="flex flex-col items-center justify-center gap-1 text-center">
                <span className="text-[9px] uppercase text-muted-foreground font-semibold tracking-wider">Auto</span>
                <div className="flex items-center gap-1 text-xs font-mono text-foreground/80">
                  <Zap className="h-3 w-3 text-primary/70" />
                  {automationPct}%
                </div>
              </div>
            </div>

            {/* MITRE Tags */}
            <div className="flex gap-1.5 flex-wrap">
              {playbook.mitreTechniques.slice(0, 4).map(techId => {
                const tech = getTechniqueById(techId);
                return tech ? (
                  <Badge key={techId} variant="outline" className="text-[9px] font-mono bg-background/50 text-muted-foreground border-border/50 group-hover:border-primary/30 transition-colors">
                    {tech.id}
                  </Badge>
                ) : null;
              })}
              {playbook.mitreTechniques.length > 4 && (
                <Badge variant="outline" className="text-[9px] font-mono bg-background/50 text-muted-foreground border-border/50">
                  +{playbook.mitreTechniques.length - 4}
                </Badge>
              )}
            </div>
          </div>
          
          {/* Hover Actions (Visible only on hover) */}
          <div className="pt-3 border-t border-border/40 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
             <div className="flex items-center gap-3">
               <span className="text-[10px] font-semibold tracking-wider uppercase text-primary flex items-center gap-1.5 hover:text-primary/80 transition-colors">
                 <PlayCircle className="h-3.5 w-3.5" /> Execute
               </span>
               <span className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
                 <Eye className="h-3.5 w-3.5" /> Preview
               </span>
               <span className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 hidden sm:flex">
                 <BarChart2 className="h-3.5 w-3.5" /> Analytics
               </span>
             </div>
             <ChevronRight className="h-4 w-4 text-primary" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const StepItem = ({
  step,
  index,
  isLast,
  stepState,
  isExecuting,
  onComplete,
  onSkip,
  onNoteChange,
  onReset
}: {
  step: PlaybookStep;
  index: number;
  isLast?: boolean;
  stepState: StepState;
  isExecuting: boolean;
  onComplete: () => void;
  onSkip: () => void;
  onNoteChange: (note: string) => void;
  onReset: () => void;
}) => {
  const [showNotes, setShowNotes] = useState(false);

  const isCompleted = stepState.status === 'completed';
  const isSkipped = stepState.status === 'skipped';
  const inProgress = isExecuting && stepState.status === 'pending';
  const isQueued = !isExecuting || (!inProgress && !isCompleted && !isSkipped);

  const getStatusConfig = () => {
    if (isCompleted) return { color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/30', label: 'COMPLETED', icon: <CheckCircle2 className="h-4 w-4" /> };
    if (isSkipped) return { color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30', label: 'ESCALATED', icon: <AlertTriangle className="h-4 w-4" /> };
    if (inProgress) return { color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/50', label: 'ACTIVE', icon: <Zap className="h-4 w-4" /> };
    return { color: 'text-muted-foreground', bg: 'bg-secondary/50', border: 'border-border/50', label: 'QUEUED', icon: <Clock className="h-4 w-4" /> };
  };

  const statusConfig = getStatusConfig();

  const getActionIcon = () => {
    switch (step.actionType) {
      case 'automated': return <Zap className="h-3.5 w-3.5 text-blue-400" />;
      case 'decision': return <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />;
      default: return <User className="h-3.5 w-3.5 text-emerald-400" />;
    }
  };

  const getActionLabel = () => {
    switch (step.actionType) {
      case 'automated': return 'Auto Orchestration';
      case 'decision': return 'Manual Gate';
      default: return 'Manual Task';
    }
  };

  return (
    <div className="relative pl-12 pb-8 group">
      {/* Animated Connector Line */}
      {!isLast && (
        <div className="absolute left-[15px] top-8 bottom-0 w-[2px] bg-border/30 overflow-hidden">
          <motion.div 
            initial={{ height: 0 }}
            animate={{ height: isCompleted || isSkipped ? '100%' : '0%' }}
            transition={{ duration: 0.5 }}
            className="absolute top-0 w-full bg-primary"
          />
        </div>
      )}
      
      {/* Node Marker */}
      <div className={`absolute left-0 top-1.5 w-8 h-8 rounded-full flex items-center justify-center z-10 transition-all duration-500 ${statusConfig.bg} ${statusConfig.border} border shadow-sm backdrop-blur-sm`}>
        {inProgress && (
          <div className="absolute -inset-1.5 rounded-full border border-primary/40 animate-ping" />
        )}
        <div className={`${statusConfig.color}`}>
          {statusConfig.icon}
        </div>
      </div>

      <motion.div 
        className={`space-y-4 transition-all duration-300 ${isSkipped ? 'opacity-60 grayscale-[50%]' : ''} ${inProgress ? 'scale-[1.01]' : ''}`}
        whileHover={!isCompleted && !isSkipped ? { x: 4 } : {}}
      >
        <Card className={`overflow-hidden transition-all duration-300 border ${inProgress ? 'border-primary/40 bg-primary/[0.03] shadow-[0_0_20px_rgba(var(--primary),0.15)]' : 'border-border/40 bg-card/20 hover:bg-card/40'}`}>
          <div className="p-4 space-y-4 relative">
            {/* Subtle glow for active item */}
            {inProgress && <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>}

            <div className="flex items-start justify-between gap-4 relative z-10">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`text-[9px] uppercase font-mono px-1.5 py-0 tracking-wider ${statusConfig.color} ${statusConfig.border} ${statusConfig.bg}`}>
                    {statusConfig.label}
                  </Badge>
                  <h4 className={`text-sm font-semibold tracking-wide ${isCompleted ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                    {step.title}
                  </h4>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap justify-end shrink-0">
                {inProgress && (
                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={onComplete} className="h-7 text-xs gap-1.5 bg-green-500/10 text-green-500 hover:bg-green-500/20 hover:text-green-400 border border-green-500/30 transition-all">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Execute
                    </Button>
                    {!step.required && (
                      <Button size="sm" variant="outline" onClick={onSkip} className="h-7 text-xs gap-1.5 border-amber-500/30 text-amber-500 hover:bg-amber-500/10 transition-all">
                        <AlertTriangle className="h-3.5 w-3.5" /> Escalate
                      </Button>
                    )}
                  </div>
                )}
                {(isCompleted || isSkipped) && isExecuting && (
                  <Button size="sm" variant="ghost" onClick={onReset} className="h-7 text-xs gap-1.5 text-muted-foreground hover:text-foreground">
                    <RotateCcw className="h-3.5 w-3.5" /> Revert
                  </Button>
                )}
              </div>
            </div>

            {/* Operational Metrics Footer */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border/20 relative z-10">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                  {getActionIcon()}
                  <span>{getActionLabel()}</span>
                </div>
                <div className="w-px h-3 bg-border/50"></div>
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                  <Clock className="h-3 w-3 text-primary/70" />
                  <span>SLA IMPACT: {step.estimatedMinutes}M</span>
                </div>
                {step.required && (
                  <>
                    <div className="w-px h-3 bg-border/50"></div>
                    <div className="flex items-center gap-1 text-[10px] font-mono text-red-400 uppercase tracking-wider">
                      <Shield className="h-3 w-3" /> CRITICAL
                    </div>
                  </>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                {stepState.completedAt && (
                  <span className="text-[10px] font-mono text-primary/80 uppercase tracking-wider">
                    T-ZERO: {stepState.completedAt.toLocaleTimeString()}
                  </span>
                )}
                {isExecuting && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className={`h-6 px-2 text-[10px] gap-1.5 font-mono uppercase tracking-wider transition-colors ${showNotes || stepState.notes ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'}`}
                    onClick={() => setShowNotes(!showNotes)}
                  >
                    <Activity className="h-3 w-3" />
                    {stepState.notes ? 'Telemetry' : 'Log Intel'}
                  </Button>
                )}
              </div>
            </div>

            {/* Operational Logs / Notes Workspace */}
            <motion.div 
              initial={false}
              animate={{ height: showNotes && isExecuting ? 'auto' : 0, opacity: showNotes && isExecuting ? 1 : 0 }}
              className="overflow-hidden relative z-10"
            >
              <div className="pt-3">
                <div className="relative group/textarea">
                  <div className="absolute left-3 top-3 z-20">
                    <div className="h-2 w-2 rounded-full bg-primary/50 animate-pulse"></div>
                  </div>
                  <Textarea
                    placeholder="Input raw operational intelligence, IOCs, or execution telemetry..."
                    value={stepState.notes}
                    onChange={(e) => onNoteChange(e.target.value)}
                    className="text-xs font-mono bg-black/40 border-primary/20 focus-visible:ring-primary/40 min-h-[80px] pl-8 resize-none placeholder:text-muted-foreground/40 hover:bg-black/60 transition-colors"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

const PlaybookDetail = ({
  playbook,
  onBack
}: {
  playbook: Playbook;
  onBack: () => void;
}) => {
  const [execution, setExecution] = useState<ExecutionState>({
    isRunning: false,
    stepStates: playbook.steps.reduce((acc, step) => ({
      ...acc,
      [step.id]: { status: 'pending' as PlaybookStepStatus, notes: '' }
    }), {})
  });

  const startExecution = () => {
    setExecution({
      isRunning: true,
      startedAt: new Date(),
      stepStates: playbook.steps.reduce((acc, step) => ({
        ...acc,
        [step.id]: { status: 'pending' as PlaybookStepStatus, notes: '' }
      }), {})
    });
    toast.success('Playbook execution started');
  };

  const stopExecution = () => {
    setExecution(prev => ({ ...prev, isRunning: false }));
    toast.info('Playbook execution paused');
  };

  const resetExecution = () => {
    setExecution({
      isRunning: false,
      stepStates: playbook.steps.reduce((acc, step) => ({
        ...acc,
        [step.id]: { status: 'pending' as PlaybookStepStatus, notes: '' }
      }), {})
    });
    toast.info('Playbook execution reset');
  };

  const completeStep = (stepId: string) => {
    setExecution(prev => ({
      ...prev,
      stepStates: {
        ...prev.stepStates,
        [stepId]: {
          ...prev.stepStates[stepId],
          status: 'completed',
          completedAt: new Date()
        }
      }
    }));
    toast.success('Step completed');
  };

  const skipStep = (stepId: string) => {
    setExecution(prev => ({
      ...prev,
      stepStates: {
        ...prev.stepStates,
        [stepId]: { ...prev.stepStates[stepId], status: 'skipped' }
      }
    }));
  };

  const resetStep = (stepId: string) => {
    setExecution(prev => ({
      ...prev,
      stepStates: {
        ...prev.stepStates,
        [stepId]: { status: 'pending', notes: prev.stepStates[stepId]?.notes || '' }
      }
    }));
  };

  const updateNotes = (stepId: string, notes: string) => {
    setExecution(prev => ({
      ...prev,
      stepStates: {
        ...prev.stepStates,
        [stepId]: { ...prev.stepStates[stepId], notes }
      }
    }));
  };

  const completedCount = Object.values(execution.stepStates).filter(
    s => s.status === 'completed' || s.status === 'skipped'
  ).length;
  const progress = Math.round((completedCount / playbook.steps.length) * 100);

  const isComplete = completedCount === playbook.steps.length;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Playbook Header & Intelligence Panel */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={onBack} className="gap-2 text-xs border-border/50 bg-card/50 hover:bg-secondary transition-colors">
            <ChevronRight className="h-4 w-4 rotate-180" /> Back to Operations
          </Button>
          
          <div className="flex items-center gap-2">
            {!execution.isRunning ? (
              <Button className="gap-2 shadow-[0_0_15px_rgba(var(--primary),0.2)] hover:shadow-[0_0_20px_rgba(var(--primary),0.4)] transition-all bg-primary/90 hover:bg-primary" onClick={startExecution}>
                <PlayCircle className="h-4 w-4" />
                Initialize Runbook
              </Button>
            ) : (
              <>
                <Button variant="outline" className="gap-2 border-border/50 bg-background/50 hover:bg-secondary transition-colors" onClick={stopExecution}>
                  <Pause className="h-4 w-4" />
                  Halt Execution
                </Button>
                <Button variant="destructive" className="gap-2 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 transition-colors" onClick={resetExecution}>
                  <RotateCcw className="h-4 w-4" />
                  Abort Operation
                </Button>
              </>
            )}
          </div>
        </div>

        <Card className="border-border/40 bg-card/40 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
          <CardContent className="p-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column: Identity & AI Intel */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold tracking-tight text-foreground/90">{playbook.name}</h2>
                    {execution.isRunning && (
                      <Badge className="bg-primary/20 text-primary border-primary/30 animate-pulse font-mono uppercase text-[10px] tracking-wider px-2">
                        <Zap className="h-3 w-3 mr-1.5" /> Live Ops
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">{playbook.description}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {playbook.severity.map(sev => (
                    <SeverityBadge key={sev} severity={sev as any} />
                  ))}
                  <div className="w-px h-4 bg-border/50 mx-2"></div>
                  <div className="flex flex-wrap gap-1.5">
                    {playbook.mitreTechniques.slice(0, 5).map(techId => (
                      <Badge key={techId} variant="outline" className="text-[10px] font-mono border-primary/20 text-primary/70 bg-primary/5">
                        {techId}
                      </Badge>
                    ))}
                    {playbook.mitreTechniques.length > 5 && (
                      <Badge variant="outline" className="text-[10px] font-mono border-border/40 text-muted-foreground bg-secondary/30">
                        +{playbook.mitreTechniques.length - 5}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* AI Recommendation */}
                <div className="bg-primary/5 border border-primary/10 rounded-lg p-3 flex items-start gap-3">
                  <BrainCircuit className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-primary block">AI Orchestration Intel</span>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      High confidence (94%) for fully automated execution path. Recommended to initialize runbook immediately to minimize lateral movement risk.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Telemetry & Workload */}
              <div className="space-y-5 border-t lg:border-t-0 lg:border-l border-border/30 pt-5 lg:pt-0 lg:pl-8">
                
                {/* Containment Prob */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground uppercase tracking-wider font-mono text-[10px] flex items-center gap-1.5">
                      <Target className="h-3 w-3" /> Containment Prob
                    </span>
                    <span className="text-green-400 font-mono font-bold">87%</span>
                  </div>
                  <Progress value={87} className="h-1.5 bg-background border border-border/50" />
                </div>

                {/* Automation Coverage */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground uppercase tracking-wider font-mono text-[10px] flex items-center gap-1.5">
                      <Zap className="h-3 w-3" /> Auto Coverage
                    </span>
                    <span className="text-primary font-mono font-bold">
                      {playbook.steps.length > 0 ? Math.round((playbook.steps.filter(s => s.actionType === 'automated').length / playbook.steps.length) * 100) : 0}%
                    </span>
                  </div>
                  <Progress value={playbook.steps.length > 0 ? Math.round((playbook.steps.filter(s => s.actionType === 'automated').length / playbook.steps.length) * 100) : 0} className="h-1.5 bg-background border border-border/50" />
                </div>

                {/* Execution Complexity */}
                <div className="flex items-center justify-between pt-2 border-t border-border/20">
                  <span className="text-[10px] uppercase tracking-wider font-mono text-muted-foreground">Execution Complexity</span>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-1.5 bg-primary rounded-sm"></div>
                    <div className="w-3 h-1.5 bg-primary/40 rounded-sm"></div>
                    <div className="w-3 h-1.5 bg-secondary rounded-sm"></div>
                  </div>
                </div>

                {/* Analyst Workload */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider font-mono text-muted-foreground">Analyst Workload</span>
                  <Badge variant="outline" className="text-[9px] font-mono border-amber-500/30 text-amber-500 bg-amber-500/10 px-1.5 py-0">Moderate</Badge>
                </div>

              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {execution.isRunning && (
        <Card className={`relative overflow-hidden border ${isComplete ? 'border-green-500/50 bg-green-500/5' : 'border-primary/30 bg-card/60 backdrop-blur'}`}>
          <div className="absolute top-0 left-0 w-full h-1 bg-secondary/50">
            <motion.div 
              className={`h-full ${isComplete ? 'bg-green-500' : 'bg-primary'}`}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                {isComplete ? (
                  <div className="h-6 w-6 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  </div>
                ) : (
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
                    <PlayCircle className="h-4 w-4 text-primary" />
                  </div>
                )}
                <span className="font-semibold text-sm uppercase tracking-wider text-foreground">
                  {isComplete ? 'Execution Complete' : 'Active Operation'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-primary">
                  {progress}% <span className="text-muted-foreground font-sans font-normal">({completedCount}/{playbook.steps.length})</span>
                </span>
              </div>
            </div>
            {execution.startedAt && (
              <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest flex items-center gap-1.5 mt-2">
                <Clock className="h-3 w-3" /> Time on Target: {execution.startedAt.toLocaleTimeString()}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        <div className="xl:col-span-2 space-y-6">
          <Card className="border-border/40 bg-card/40 backdrop-blur shadow-sm">
            <CardHeader className="pb-4 border-b border-border/40">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    Response Workflow
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">
                    Ordered operational timeline sequence
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-[10px] font-mono bg-background/50">
                  Estimated TTR: {playbook.estimatedDuration}m
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="relative">
                {playbook.steps.map((step, index) => (
                  <StepItem
                    key={step.id}
                    step={step}
                    index={index}
                    isLast={index === playbook.steps.length - 1}
                    stepState={execution.stepStates[step.id] || { status: 'pending', notes: '' }}
                    isExecuting={execution.isRunning}
                    onComplete={() => completeStep(step.id)}
                    onSkip={() => skipStep(step.id)}
                    onNoteChange={(notes) => updateNotes(step.id, notes)}
                    onReset={() => resetStep(step.id)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* AI Insights */}
          <Card className="border-primary/20 bg-primary/5 backdrop-blur shadow-[0_0_15px_rgba(var(--primary),0.1)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl -mr-10 -mt-10"></div>
            <CardHeader className="pb-3 pt-4 px-4 border-b border-primary/10">
              <CardTitle className="text-xs uppercase tracking-widest text-primary flex items-center gap-2">
                <BrainCircuit className="h-4 w-4" />
                AI Telemetry Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4 relative z-10">
              <div className="flex items-start gap-3 bg-background/50 p-3 rounded-lg border border-border/50">
                <Zap className="h-4 w-4 text-primary mt-0.5 flex-none" />
                <div className="space-y-1">
                  <p className="text-xs text-foreground/90 leading-relaxed">
                    Confidence is <span className="text-green-400 font-semibold">high (94%)</span> for this automated response sequence based on past similar threat profiles.
                  </p>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground font-medium">Analyst Confidence</span>
                  <span className="font-mono text-primary font-bold">94%</span>
                </div>
                <Progress value={94} className="h-1.5 bg-background border border-border/50" />
              </div>
            </CardContent>
          </Card>

          {/* Containment Metrics */}
          <Card className="border-border/40 bg-card/40 backdrop-blur shadow-sm">
            <CardHeader className="pb-3 pt-4 px-4 border-b border-border/40">
              <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Target className="h-4 w-4" />
                Containment Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-background/50 p-3 rounded-lg border border-border/40 flex flex-col items-center justify-center text-center">
                  <span className="text-[9px] text-muted-foreground uppercase tracking-widest mb-1">Est. TTR</span>
                  <span className="text-xl font-mono text-foreground font-bold">{playbook.estimatedDuration}<span className="text-xs font-sans text-muted-foreground font-normal ml-1">min</span></span>
                </div>
                <div className="bg-background/50 p-3 rounded-lg border border-border/40 flex flex-col items-center justify-center text-center">
                  <span className="text-[9px] text-muted-foreground uppercase tracking-widest mb-1">Automation</span>
                  <span className="text-xl font-mono text-primary font-bold">{playbook.steps.length > 0 ? Math.round((playbook.steps.filter(s => s.actionType === 'automated').length / playbook.steps.length) * 100) : 0}<span className="text-xs font-sans text-primary/70 font-normal ml-1">%</span></span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Execution Analytics */}
          <Card className="border-border/40 bg-card/40 backdrop-blur shadow-sm">
            <CardHeader className="pb-3 pt-4 px-4 border-b border-border/40">
              <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Execution Velocity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="h-[100px] w-full -ml-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[
                    { step: 'Init', time: 0 },
                    { step: 'Phase 1', time: playbook.estimatedDuration * 0.2 },
                    { step: 'Phase 2', time: playbook.estimatedDuration * 0.5 },
                    { step: 'Phase 3', time: playbook.estimatedDuration * 0.8 },
                    { step: 'Complete', time: playbook.estimatedDuration }
                  ]}>
                    <defs>
                      <linearGradient id="colorVelocity" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                    <XAxis dataKey="step" hide />
                    <YAxis hide />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '6px', fontSize: '11px' }}
                      itemStyle={{ color: 'hsl(var(--primary))', fontWeight: 'bold' }}
                      labelStyle={{ color: 'hsl(var(--muted-foreground))', marginBottom: '2px' }}
                    />
                    <Area type="monotone" dataKey="time" name="Cumulative Time (m)" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorVelocity)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* MITRE Mapping */}
          <Card className="border-border/40 bg-card/40 backdrop-blur shadow-sm">
            <CardHeader className="pb-3 pt-4 px-4 border-b border-border/40">
              <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Tactical Mapping
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div>
                <span className="text-[10px] uppercase text-muted-foreground tracking-wider mb-2 block">Severity Profile</span>
                <div className="flex flex-wrap gap-1.5">
                  {playbook.severity.map(sev => (
                    <SeverityBadge key={sev} severity={sev as any} />
                  ))}
                </div>
              </div>
              
              <div>
                <span className="text-[10px] uppercase text-muted-foreground tracking-wider mb-2 block">ATT&CK Techniques</span>
                <div className="space-y-2">
                  {playbook.mitreTechniques.map(techId => {
                    const tech = getTechniqueById(techId);
                    return tech ? (
                      <div key={techId} className="flex flex-col gap-1 p-2.5 bg-background/50 border border-border/40 rounded-md hover:border-primary/30 transition-colors group cursor-default">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-foreground group-hover:text-primary transition-colors">{tech.id}</span>
                        </div>
                        <span className="text-xs text-muted-foreground line-clamp-1">{tech.name}</span>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

const CreatePlaybookDialog = ({ onPlaybookCreated }: { onPlaybookCreated?: (playbook: Playbook) => void }) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    severity: 'medium' as 'critical' | 'high' | 'medium' | 'low',
    estimatedDuration: '30',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Create a new playbook object
    const newPlaybook: Playbook = {
      id: `custom-${Date.now()}`,
      name: formData.name,
      description: formData.description,
      severity: [formData.severity],
      estimatedDuration: parseInt(formData.estimatedDuration) || 30,
      steps: [
        {
          id: 'step-1',
          order: 1,
          title: 'Initial Assessment',
          description: 'Assess the situation and gather initial information',
          actionType: 'manual',
          estimatedMinutes: 5,
          required: true
        },
        {
          id: 'step-2',
          order: 2,
          title: 'Execute Response',
          description: 'Take appropriate action based on assessment',
          actionType: 'manual',
          estimatedMinutes: 15,
          required: true
        },
        {
          id: 'step-3',
          order: 3,
          title: 'Document Results',
          description: 'Document all actions taken and results',
          actionType: 'manual',
          estimatedMinutes: 10,
          required: true
        }
      ],
      mitreTechniques: []
    };

    toast.success('Playbook created successfully!');
    setOpen(false);
    setFormData({
      name: '',
      description: '',
      severity: 'medium',
      estimatedDuration: '30',
    });

    if (onPlaybookCreated) {
      onPlaybookCreated(newPlaybook);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Playbook
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Playbook</DialogTitle>
            <DialogDescription>
              Create a custom incident response playbook with automated workflows
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">
                Playbook Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., Custom Ransomware Response"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Describe the purpose and scope of this playbook..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                required
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="severity">Severity Level</Label>
                <Select
                  value={formData.severity}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, severity: value as any }))}
                >
                  <SelectTrigger id="severity">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="duration">Est. Duration (min)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  placeholder="30"
                  value={formData.estimatedDuration}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimatedDuration: e.target.value }))}
                />
              </div>
            </div>
            <div className="bg-muted/50 border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">
                💡 Your playbook will be created with 3 default steps. You can customize steps after creation.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Playbook</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default function Playbooks() {
  const [selectedPlaybook, setSelectedPlaybook] = useState<Playbook | null>(null);
  const [customPlaybooks, setCustomPlaybooks] = useState<Playbook[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSeverity, setActiveSeverity] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');

  const handlePlaybookCreated = (newPlaybook: Playbook) => {
    setCustomPlaybooks(prev => [newPlaybook, ...prev]);
    setSelectedPlaybook(newPlaybook);
  };

  const allPlaybooks = [...customPlaybooks, ...defaultPlaybooks];

  const filteredPlaybooks = allPlaybooks.filter(p => {
    const matchesSeverity = activeSeverity === 'all' || p.severity.includes(activeSeverity);
    const matchesSearch = !searchTerm.trim() ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSeverity && matchesSearch;
  });

  // Aggregate MITRE techniques across all playbooks
  const allTechniqueIds = [...new Set(allPlaybooks.flatMap(p => p.mitreTechniques))].slice(0, 8);

  // Stats
  const totalSteps = allPlaybooks.reduce((sum, p) => sum + p.steps.length, 0);
  const automatedSteps = allPlaybooks.reduce(
    (sum, p) => sum + p.steps.filter(s => s.actionType === 'automated').length, 0
  );
  const avgDuration = allPlaybooks.length
    ? Math.round(allPlaybooks.reduce((sum, p) => sum + p.estimatedDuration, 0) / allPlaybooks.length)
    : 0;

  if (selectedPlaybook) {
    return (
      <MainLayout>
        {/* Tactical Ambient Backgrounds */}
        <div className="fixed inset-0 pointer-events-none z-[-1] bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        <div className="fixed top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-primary/5 to-transparent blur-[100px] pointer-events-none z-[-1]"></div>
        
        <PlaybookDetail
          playbook={selectedPlaybook}
          onBack={() => setSelectedPlaybook(null)}
        />
      </MainLayout>
    );
  }

  const severityOptions: { value: typeof activeSeverity; label: string; color: string }[] = [
    { value: 'all',      label: 'All Playbooks', color: 'text-foreground' },
    { value: 'critical', label: 'Critical',      color: 'text-red-400' },
    { value: 'high',     label: 'High',          color: 'text-orange-400' },
    { value: 'medium',   label: 'Medium',        color: 'text-yellow-400' },
    { value: 'low',      label: 'Low',           color: 'text-green-400' },
  ];

  return (
    <MainLayout>
      {/* Tactical Ambient Backgrounds */}
      <div className="fixed inset-0 pointer-events-none z-[-1] bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      <div className="fixed top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-primary/5 to-transparent blur-[100px] pointer-events-none z-[-1]"></div>

      {/* Page Header */}
      <div className="mb-8 space-y-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 bg-primary/30 rounded-full animate-ping"></div>
                <div className="h-2.5 w-2.5 bg-primary rounded-full relative z-10 shadow-[0_0_10px_rgba(var(--primary),0.8)]"></div>
              </div>
              <h1 className="text-2xl font-bold tracking-tight uppercase font-mono">Response Operations</h1>
              <Badge variant="outline" className="text-[10px] uppercase font-mono border-primary/30 text-primary/80 bg-primary/5 hidden sm:flex">
                <BrainCircuit className="h-3 w-3 mr-1" /> AI Orchestrated
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground font-mono flex flex-wrap items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-primary/70" />
              SYSTEM TIME: {new Date().toISOString().substring(0, 19).replace('T', ' ')} UTC
              <span className="text-border/50 mx-1 hidden sm:inline">|</span>
              <span className="text-green-400 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" /> READINESS: 98%
              </span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <CreatePlaybookDialog onPlaybookCreated={handlePlaybookCreated} />
          </div>
        </div>

        {/* Header Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border/40 bg-card/40 backdrop-blur-md relative overflow-hidden group hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(var(--primary),0.1)] transition-all duration-300 cursor-default">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <FileText className="h-10 w-10" />
            </div>
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2 block">Active Playbooks</span>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-mono font-bold text-foreground">{allPlaybooks.length}</span>
                <span className="text-[10px] text-green-400 font-mono mb-1.5">+2 this week</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-border/40 bg-card/40 backdrop-blur-md relative overflow-hidden group hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(var(--primary),0.1)] transition-all duration-300 cursor-default">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Zap className="h-10 w-10 text-primary" />
            </div>
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2 block">Automated Responses</span>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-mono font-bold text-primary">{automatedSteps}</span>
                <span className="text-[10px] text-primary/70 font-mono mb-1.5">steps auto-resolved</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-card/40 backdrop-blur-md relative overflow-hidden group hover:border-amber-400/40 hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(251,191,36,0.1)] transition-all duration-300 cursor-default">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Clock className="h-10 w-10 text-amber-400" />
            </div>
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2 block">Avg Containment</span>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-mono font-bold text-amber-400">{avgDuration}</span>
                <span className="text-[10px] text-amber-400/70 font-mono mb-1.5">minutes</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-card/40 backdrop-blur-md relative overflow-hidden group hover:border-green-400/40 hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(74,222,128,0.1)] transition-all duration-300 cursor-default">
            <div className="absolute inset-0 bg-gradient-to-br from-green-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Target className="h-10 w-10 text-green-400" />
            </div>
            <CardContent className="p-4 flex flex-col justify-between h-full relative z-10">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2 block">SOC Efficiency</span>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-mono font-bold text-green-400">92%</span>
                <span className="text-[10px] text-green-400/70 font-mono mb-1.5 flex items-center"><TrendingUp className="h-2.5 w-2.5 mr-0.5" /> +4%</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 3-Column Grid: ~20% | ~55% | ~25% (using fr to prevent overflow from gaps) */}
      <div className="grid grid-cols-1 xl:grid-cols-[2fr_5.5fr_2.5fr] lg:grid-cols-[1fr_2.5fr_1fr] gap-6 items-start">

        {/* ── LEFT SIDEBAR ─────────────────────────────── */}
        <div className="space-y-6">

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-primary/0 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <Card className="relative border-border/40 bg-card/60 backdrop-blur-md shadow-sm">
                <CardHeader className="pb-3 pt-4 px-4">
                  <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <Search className="h-3.5 w-3.5" />
                    Global Search
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
                    <Input
                      placeholder="Search playbooks..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="pl-9 bg-background/50 border-border/50 focus-visible:ring-primary/50 text-sm h-10 transition-all hover:bg-background/80"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Severity Filters */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.05 }}
          >
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/10 to-transparent rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <Card className="relative border-border/40 bg-card/60 backdrop-blur-md shadow-sm overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/40 to-transparent"></div>
                <CardHeader className="pb-3 pt-4 px-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                      <Filter className="h-3.5 w-3.5" />
                      Severity Profile
                    </CardTitle>
                    <Badge variant="outline" className="text-[9px] uppercase border-primary/30 text-primary/80 bg-primary/5">
                      <Zap className="h-2.5 w-2.5 mr-1" /> AI Active
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="px-3 pb-3 space-y-1">
                  {severityOptions.map(opt => (
                    <motion.button
                      whileHover={{ x: 2 }}
                      whileTap={{ scale: 0.98 }}
                      key={opt.value}
                      onClick={() => setActiveSeverity(opt.value)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                        activeSeverity === opt.value
                          ? 'bg-primary/15 border border-primary/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
                          : 'hover:bg-secondary/40 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${activeSeverity === opt.value ? 'bg-primary shadow-[0_0_8px_rgba(var(--primary),0.8)]' : 'bg-transparent'}`} />
                        <span className={`${activeSeverity === opt.value ? 'text-foreground font-semibold' : 'text-muted-foreground'} transition-colors`}>
                          {opt.label}
                        </span>
                      </div>
                      <Badge 
                        variant={activeSeverity === opt.value ? "default" : "secondary"} 
                        className={`text-[10px] h-5 transition-colors ${activeSeverity === opt.value ? '' : 'bg-background/50 border-border/50 text-muted-foreground'}`}
                      >
                        {opt.value === 'all'
                          ? allPlaybooks.length
                          : allPlaybooks.filter(p => p.severity.includes(opt.value)).length}
                      </Badge>
                    </motion.button>
                  ))}
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
          >
            <Card className="border-border/30 bg-card/40 backdrop-blur-sm shadow-none">
              <CardHeader className="pb-3 pt-4 px-4">
                <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                  <Target className="h-3.5 w-3.5" />
                  Library Telemetry
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-3">
                {[
                  { label: 'Total Playbooks', value: allPlaybooks.length },
                  { label: 'Total Steps',     value: totalSteps },
                  { label: 'Automated Steps', value: automatedSteps },
                  { label: 'Avg Duration',    value: `${avgDuration}m` },
                ].map((s) => (
                  <div key={s.label} className="flex items-center justify-between text-sm group">
                    <span className="text-muted-foreground/80 group-hover:text-muted-foreground transition-colors">{s.label}</span>
                    <span className="font-mono text-foreground/90 bg-background/50 px-2 py-0.5 rounded border border-border/40 text-xs">
                      {s.value}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* ── CENTER WORKSPACE ─────────────────────────── */}
        <div className="space-y-4">
          {/* Results bar */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{filteredPlaybooks.length}</span> of{' '}
              <span className="font-semibold text-foreground">{allPlaybooks.length}</span> playbooks
            </p>
          </div>

          {/* Playbook Cards */}
          {filteredPlaybooks.length > 0 ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {filteredPlaybooks.map(playbook => (
                <PlaybookCard
                  key={playbook.id}
                  playbook={playbook}
                  onSelect={setSelectedPlaybook}
                />
              ))}
            </div>
          ) : (
            <Card className="border-dashed border-border/60">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <FileText className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <p className="text-lg font-medium">No playbooks found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Try adjusting your search or severity filter
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* ── RIGHT SIDEBAR ────────────────────────────── */}
        <div className="space-y-4">

          {/* Threat Intelligence */}
          <Card className="border-border/60 bg-card/80 backdrop-blur">
            <CardHeader className="pb-3 pt-4 px-4">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-400" />
                Threat Intel
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-3">
              {[
                { label: 'Critical Playbooks', value: allPlaybooks.filter(p => p.severity.includes('critical')).length, color: 'text-red-400' },
                { label: 'High Playbooks',     value: allPlaybooks.filter(p => p.severity.includes('high')).length,     color: 'text-orange-400' },
                { label: 'Medium Playbooks',   value: allPlaybooks.filter(p => p.severity.includes('medium')).length,   color: 'text-yellow-400' },
                { label: 'Low Playbooks',      value: allPlaybooks.filter(p => p.severity.includes('low')).length,      color: 'text-green-400' },
              ].map(item => (
                <div key={item.label} className="flex flex-wrap items-center justify-between text-xs gap-x-2 gap-y-1">
                  <span className="text-muted-foreground whitespace-nowrap">{item.label}</span>
                  <span className={`font-bold tabular-nums ${item.color} text-right whitespace-nowrap`}>{item.value}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-border/50">
                <div className="flex flex-wrap items-center justify-between text-xs gap-x-2 gap-y-1">
                  <span className="text-muted-foreground whitespace-nowrap">Coverage</span>
                  <span className="font-bold text-primary text-right whitespace-nowrap">
                    {allTechniqueIds.length} techniques
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* MITRE ATT&CK */}
          <Card className="border-border/60 bg-card/80 backdrop-blur">
            <CardHeader className="pb-3 pt-4 px-4">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                MITRE ATT&amp;CK
              </CardTitle>
              <CardDescription className="text-xs">Techniques covered across all playbooks</CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="flex flex-wrap gap-1.5">
                {allTechniqueIds.map(techId => {
                  const tech = getTechniqueById(techId);
                  return tech ? (
                    <Badge
                      key={techId}
                      variant="outline"
                      className="text-[10px] font-mono border-primary/30 text-primary/80 hover:border-primary hover:text-primary cursor-default transition-colors"
                    >
                      {tech.id}
                    </Badge>
                  ) : null;
                })}
                {[...new Set(allPlaybooks.flatMap(p => p.mitreTechniques))].length > 8 && (
                  <Badge variant="secondary" className="text-[10px]">
                    +{[...new Set(allPlaybooks.flatMap(p => p.mitreTechniques))].length - 8} more
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Analyst Confidence */}
          <Card className="border-border/60 bg-card/80 backdrop-blur">
            <CardHeader className="pb-3 pt-4 px-4">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                Analyst Confidence
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-3">
              {[
                { label: 'Automated Coverage', pct: automatedSteps && totalSteps ? Math.round((automatedSteps / totalSteps) * 100) : 0, color: 'bg-primary' },
                { label: 'Critical Response',  pct: allPlaybooks.filter(p => p.severity.includes('critical')).length && allPlaybooks.length ? Math.round((allPlaybooks.filter(p => p.severity.includes('critical')).length / allPlaybooks.length) * 100) : 0, color: 'bg-red-500' },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-semibold">{item.pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.color} transition-all duration-700`}
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              ))}
              <p className="text-[11px] text-muted-foreground pt-1">
                Based on {allPlaybooks.length} configured playbooks with {totalSteps} total response steps.
              </p>
            </CardContent>
          </Card>

          {/* Live Activity Feed */}
          <Card className="border-border/60 bg-card/80 backdrop-blur relative overflow-hidden group/feed">
            {/* Subtle scanline effect */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] group-hover/feed:opacity-[0.05] transition-opacity bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-0"></div>
            <CardHeader className="pb-3 pt-4 px-4 relative z-10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-400" />
                  Live Activity
                </CardTitle>
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-[9px] uppercase font-mono text-green-500/80">Realtime</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-3 pb-3 relative z-10">
              <div className="space-y-1">
                {[
                  { id: 1, type: 'automation', text: 'Auto-containment triggered on HOST-09', time: 'Just now', icon: <Zap className="h-3 w-3 text-blue-400" />, border: 'border-blue-500/20', bg: 'bg-blue-500/5' },
                  { id: 2, type: 'playbook', text: 'Phishing Response initialized', time: '1m ago', icon: <PlayCircle className="h-3 w-3 text-primary" />, border: 'border-primary/20', bg: 'bg-primary/5' },
                  { id: 3, type: 'detection', text: 'T1078 detected by CrowdStrike', time: '3m ago', icon: <Target className="h-3 w-3 text-red-400" />, border: 'border-red-500/20', bg: 'bg-red-500/5' },
                  { id: 4, type: 'analyst', text: 'Admin approved isolation for DB-01', time: '5m ago', icon: <User className="h-3 w-3 text-emerald-400" />, border: 'border-emerald-500/20', bg: 'bg-emerald-500/5' },
                  { id: 5, type: 'escalation', text: 'Incident #1042 escalated to Tier 3', time: '12m ago', icon: <AlertTriangle className="h-3 w-3 text-amber-400" />, border: 'border-amber-500/20', bg: 'bg-amber-500/5' },
                ].map((act, i) => (
                  <motion.div
                    key={act.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.1 }}
                    className={`flex items-start gap-2.5 p-2 rounded-md border ${act.border} ${act.bg} hover:brightness-125 transition-all cursor-default group/item`}
                  >
                    <div className="mt-0.5 shrink-0 opacity-80 group-hover/item:opacity-100 transition-opacity">
                      {act.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-foreground/90 font-mono leading-tight truncate">
                        {act.text}
                      </p>
                      <span className="text-[9px] text-muted-foreground/70 font-mono tracking-wider mt-0.5 block">
                        {act.time}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </MainLayout>
  );
}
