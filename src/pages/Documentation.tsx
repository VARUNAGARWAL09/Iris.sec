import { motion } from 'framer-motion';
import {
  Download,
  Shield,
  AlertTriangle,
  FileText,
  CheckCircle,
  ArrowRight,
  Zap,
  Lock,
  Eye,
  Server,
  Mail,
  Globe,
  HardDrive,
  Users,
  Clock,
  Target,
  Brain,
  BarChart3,
  Activity,
  TrendingUp,
  Cpu,
  Database,
  GitBranch,
  Layers,
  BookOpen,
  Play,
  Settings,
  Network,
  Award,
  FileSpreadsheet,
  AlertCircle,
  CheckSquare,
  Timer,
  Globe2,
  ShieldCheck,
  LockKeyhole,
  Key,
  Fingerprint,
  Radar
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { generateDocumentationPDF } from '@/lib/pdfGenerator';
import { generateTrainingDataPDF } from '@/lib/trainingDataPDF';

const Documentation = () => {
  const handlePrint = () => {
    // Generate professional PDF instead of using browser print
    generateDocumentationPDF(threatTypes, severityLevels);
  };

  const handleDownloadTrainingData = () => {
    // Generate training data PDF using the imported library
    generateTrainingDataPDF();
  };

  const threatTypes = [
    {
      name: 'Suspicious Login Attempt',
      category: 'Authentication',
      icon: Lock,
      severity: 'high',
      indicators: [
        'Multiple failed login attempts (>5 in 5 minutes)',
        'Login from unusual geographic location',
        'Impossible travel detection (2 locations < 2 hours)',
        'Off-hours access attempts',
        'Unknown user agent or device',
        'Privilege escalation patterns',
        'Concurrent sessions from different IPs'
      ],
      response: [
        'Immediately lock the affected account',
        'Verify user identity through secondary channel',
        'Reset credentials if compromise confirmed',
        'Block suspicious source IP addresses',
        'Review access logs for lateral movement',
        'Update MFA requirements',
        'Document incident in SIEM'
      ],
      mitre: ['T1078 - Valid Accounts', 'T1110 - Brute Force', 'T1021.002 - SMB/Windows Admin Shares'],
      avgResponseTime: '4.2 minutes',
      falsePositiveRate: '12%',
      weeklyOccurrences: 47
    },
    {
      name: 'Malware Detection',
      category: 'Endpoint',
      icon: HardDrive,
      severity: 'critical',
      indicators: [
        'Known malware hash signature match',
        'Suspicious process behavior patterns',
        'Registry persistence mechanisms detected',
        'Privilege escalation attempts',
        'Memory injection detected',
        'Unusual network connections',
        'File system modifications in protected areas'
      ],
      response: [
        'Isolate the affected endpoint immediately',
        'Capture memory dump for forensic analysis',
        'Run full system antivirus scan',
        'Identify and patch the entry vector',
        'Check for lateral movement to other systems',
        'Update endpoint detection rules',
        'Review user activity logs'
      ],
      mitre: ['T1204 - User Execution', 'T1547 - Boot or Logon Autostart', 'T1055 - Process Injection'],
      avgResponseTime: '2.8 minutes',
      falsePositiveRate: '5%',
      weeklyOccurrences: 23
    },
    {
      name: 'Data Exfiltration',
      category: 'Network',
      icon: Globe,
      severity: 'high',
      indicators: [
        'Large data transfer to external destination (>100MB)',
        'Connection to low-reputation IP addresses',
        'Unusual upload to cloud storage services',
        'Data transfer outside business hours',
        'Encrypted traffic to unknown endpoints',
        'Multiple failed DLP policy violations',
        'Unusual data access patterns'
      ],
      response: [
        'Block the outbound connection immediately',
        'Identify the source user/system',
        'Assess what data may have been exfiltrated',
        'Review DLP policy effectiveness',
        'Notify legal/compliance if sensitive data involved',
        'Update firewall rules',
        'Conduct full forensic investigation'
      ],
      mitre: ['T1041 - Exfiltration Over C2 Channel', 'T1567 - Exfiltration Over Web Service', 'T1020 - Automated Exfiltration'],
      avgResponseTime: '3.5 minutes',
      falsePositiveRate: '8%',
      weeklyOccurrences: 31
    },
    {
      name: 'Phishing Email',
      category: 'Email',
      icon: Mail,
      severity: 'medium',
      indicators: [
        'SPF/DKIM authentication failure',
        'Newly registered sender domain (<30 days)',
        'Suspicious links or attachments',
        'Urgency language patterns',
        'Spoofed executive/vendor sender',
        'Unusual sender reputation score',
        'Email header anomalies'
      ],
      response: [
        'Quarantine the email immediately',
        'Notify all recipients not to interact',
        'Block sender domain at email gateway',
        'Check if any user clicked links',
        'Reset credentials for affected users',
        'Update email filtering rules',
        'Conduct user awareness training'
      ],
      mitre: ['T1566 - Phishing', 'T1598 - Phishing for Information', 'T1566.001 - Spearphishing Attachment'],
      avgResponseTime: '5.1 minutes',
      falsePositiveRate: '15%',
      weeklyOccurrences: 89
    },
    {
      name: 'Brute Force Attack',
      category: 'Network',
      icon: Target,
      severity: 'medium',
      indicators: [
        'High volume of failed authentication (>50/min)',
        'Sequential or dictionary-based attempts',
        'Multiple target accounts from single source',
        'Attacks on exposed services (SSH, RDP, FTP)',
        'Low-reputation source IP'
      ],
      response: [
        'Block attacking IP at firewall',
        'Enable account lockout policies',
        'Implement rate limiting',
        'Review exposed service configuration',
        'Consider implementing MFA'
      ],
      mitre: ['T1110 - Brute Force', 'T1046 - Network Service Discovery']
    },
    {
      name: 'Ransomware Activity',
      category: 'Endpoint',
      icon: AlertTriangle,
      severity: 'critical',
      indicators: [
        'Mass file encryption detected (>50 files/min)',
        'Ransom note file creation',
        'Shadow copy deletion attempts',
        'Known ransomware process signatures',
        'Unusual file extension changes'
      ],
      response: [
        'IMMEDIATELY isolate affected systems',
        'Do NOT pay the ransom',
        'Activate incident response team',
        'Preserve evidence for forensics',
        'Begin restoration from clean backups',
        'Notify law enforcement if required'
      ],
      mitre: ['T1486 - Data Encrypted for Impact', 'T1490 - Inhibit System Recovery']
    },
    {
      name: 'Unauthorized Access',
      category: 'Access Control',
      icon: Eye,
      severity: 'high',
      indicators: [
        'Access to resources beyond user permissions',
        'Privilege escalation detected',
        'Access from non-whitelisted IP/location',
        'Unusual data access patterns',
        'Service account misuse'
      ],
      response: [
        'Revoke user access immediately',
        'Review what resources were accessed',
        'Check for data exfiltration',
        'Audit access control policies',
        'Interview the user if internal'
      ],
      mitre: ['T1548 - Abuse Elevation Control', 'T1078 - Valid Accounts']
    },
    {
      name: 'Cryptominer Detected',
      category: 'Endpoint',
      icon: Zap,
      severity: 'medium',
      indicators: [
        'High CPU/GPU usage (>60% sustained)',
        'Connections to mining pool servers',
        'Known miner process names',
        'Unusual network traffic patterns',
        'Registry/startup persistence'
      ],
      response: [
        'Terminate the mining process',
        'Identify how miner was installed',
        'Scan for additional compromises',
        'Patch the vulnerability exploited',
        'Review endpoint security controls'
      ],
      mitre: ['T1496 - Resource Hijacking', 'T1059 - Command and Scripting']
    }
  ];

  const severityLevels = [
    {
      level: 'Critical',
      score: '70-100',
      color: 'bg-severity-critical',
      description: 'Immediate threat requiring urgent response. Auto-escalates to incident.',
      sla: '15 minutes',
      actions: ['Immediate isolation', 'Activate IR team', 'Executive notification']
    },
    {
      level: 'High',
      score: '50-69',
      color: 'bg-severity-high',
      description: 'Significant threat requiring prompt investigation.',
      sla: '1 hour',
      actions: ['Priority investigation', 'Containment measures', 'Manager notification']
    },
    {
      level: 'Medium',
      score: '30-49',
      color: 'bg-severity-medium',
      description: 'Potential threat requiring analysis and monitoring.',
      sla: '4 hours',
      actions: ['Scheduled analysis', 'Monitor for escalation', 'Document findings']
    },
    {
      level: 'Low',
      score: '10-29',
      color: 'bg-severity-low',
      description: 'Minor anomaly, monitor and document.',
      sla: '24 hours',
      actions: ['Queue for review', 'Update baselines', 'Training opportunity']
    }
  ];

  return (
    <MainLayout>
      <div className="space-y-8 print:space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-mono text-2xl font-bold tracking-tight flex items-center gap-2"
            >
              <FileText className="h-6 w-6 text-primary" />
              Security Documentation
            </motion.h1>
            <p className="text-muted-foreground mt-1">
              Comprehensive guide to threat detection and incident response
            </p>
          </div>
          <Button onClick={handlePrint} className="gap-2">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>

        {/* Print Header */}
        <div className="hidden print:block text-center mb-8">
          <h1 className="text-3xl font-bold">Security Operations Center</h1>
          <h2 className="text-xl text-gray-600 mt-2">Threat Detection & Response Guide</h2>
          <p className="text-sm text-gray-500 mt-4">Generated: {new Date().toLocaleDateString()}</p>
        </div>

        {/* System Overview */}
        <Card className="print:shadow-none print:border-gray-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              System Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              The Incident Response Platform is a comprehensive Security Operations Center (SOC)
              solution that provides real-time threat detection, automated analysis, and incident
              management capabilities. The system uses advanced detection logic to analyze security
              events from multiple sources and automatically classify threats based on risk scoring.
            </p>

            <div className="grid md:grid-cols-3 gap-4 mt-6">
              <div className="p-4 bg-secondary/50 rounded-lg">
                <Server className="h-8 w-8 text-primary mb-2" />
                <h4 className="font-semibold">Real-Time Detection</h4>
                <p className="text-sm text-muted-foreground">
                  Continuous monitoring with 15+ threat indicators analyzed per event
                </p>
              </div>
              <div className="p-4 bg-secondary/50 rounded-lg">
                <Zap className="h-8 w-8 text-primary mb-2" />
                <h4 className="font-semibold">Auto-Escalation</h4>
                <p className="text-sm text-muted-foreground">
                  Critical alerts automatically escalate to incidents for immediate response
                </p>
              </div>
              <div className="p-4 bg-secondary/50 rounded-lg">
                <Users className="h-8 w-8 text-primary mb-2" />
                <h4 className="font-semibold">Team Coordination</h4>
                <p className="text-sm text-muted-foreground">
                  Real-time collaboration with assignment, status tracking, and audit trails
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ML Intelligence Hub Documentation */}
        <Card className="print:shadow-none print:border-gray-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Brain className="h-24 w-24" />
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5 text-primary" />
              ML Intelligence & Ensemble Hub
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground italic border-l-2 border-primary/30 pl-4">
              "Transitioning from static detection to dynamic, context-aware intelligence orchestration."
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-bold flex items-center gap-2 text-sm uppercase tracking-widest">
                  <Layers className="h-4 w-4 text-primary" /> Ensemble Architecture
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <Badge variant="outline" className="h-5 text-[10px] bg-blue-500/10 text-blue-500 border-blue-500/20">XGB-V4</Badge>
                    High-speed classification for volumetric telemetry.
                  </li>
                  <li className="flex gap-2">
                    <Badge variant="outline" className="h-5 text-[10px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20">ENS-A</Badge>
                    Consensus leader for multi-vector threat validation.
                  </li>
                  <li className="flex gap-2">
                    <Badge variant="outline" className="h-5 text-[10px] bg-violet-500/10 text-violet-500 border-violet-500/20">LGBM</Badge>
                    Optimized for low-latency edge-case detection.
                  </li>
                  <li className="flex gap-2">
                    <Badge variant="outline" className="h-5 text-[10px] bg-amber-500/10 text-amber-500 border-amber-500/20">NEU</Badge>
                    Neural correlation for long-term campaign tracking.
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold flex items-center gap-2 text-sm uppercase tracking-widest">
                  <Target className="h-4 w-4 text-primary" /> Telemetry Evolution
                </h4>
                <div className="space-y-2">
                  <div className="p-3 bg-secondary/30 rounded-lg border border-border/50">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-tighter">Sync Cadence</span>
                      <span className="text-[10px] font-mono font-bold text-primary">7.0s</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-snug">
                      Synchronized refresh interval across all intelligence modules to maintain real-time situational awareness.
                    </p>
                  </div>
                  <div className="p-3 bg-secondary/30 rounded-lg border border-border/50">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-tighter">XAI Logic</span>
                      <span className="text-[10px] font-mono font-bold text-primary">SHAP/LIME</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-snug">
                      Causal attribution logs provide human-readable reasoning for every automated classification.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="bg-border/50" />

            <div className="space-y-3">
              <h4 className="font-bold flex items-center gap-2 text-sm uppercase tracking-widest">
                <ShieldCheck className="h-4 w-4 text-primary" /> Intelligence Modules
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { name: 'Risk Score', desc: 'Adaptive scoring based on 28+ features.' },
                  { name: 'SLA Predict', desc: 'Forecasts resolution times with breach probability.' },
                  { name: 'MITRE Mapping', desc: 'Real-time TTP progression tracking.' },
                  { name: 'UEBA', desc: 'Entity behavior anomaly detection.' }
                ].map((mod) => (
                  <div key={mod.name} className="p-3 border border-border/40 rounded-lg bg-muted/5">
                    <div className="text-xs font-bold mb-1 text-foreground">{mod.name}</div>
                    <p className="text-[10px] text-muted-foreground leading-tight">{mod.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Platform Features */}
        <Card className="print:shadow-none print:border-gray-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Platform Features
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Team Management */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Team Management
              </h3>
              <p className="text-sm text-muted-foreground">
                Comprehensive team management interface for SOC operations with professional UI and real-time collaboration features.
              </p>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="p-3 bg-secondary/30 rounded-lg">
                  <h4 className="font-medium text-sm mb-1">View Modes</h4>
                  <p className="text-xs text-muted-foreground">
                    Toggle between grid and list views for optimal team visualization
                  </p>
                </div>
                <div className="p-3 bg-secondary/30 rounded-lg">
                  <h4 className="font-medium text-sm mb-1">Live Status</h4>
                  <p className="text-xs text-muted-foreground">
                    Real-time online/offline status and last activity tracking
                  </p>
                </div>
                <div className="p-3 bg-secondary/30 rounded-lg">
                  <h4 className="font-medium text-sm mb-1">Role Management</h4>
                  <p className="text-xs text-muted-foreground">
                    Assign and manage roles (Admin, Analyst, Viewer) with access control
                  </p>
                </div>
                <div className="p-3 bg-secondary/30 rounded-lg">
                  <h4 className="font-medium text-sm mb-1">Team Analytics</h4>
                  <p className="text-xs text-muted-foreground">
                    View team statistics including online members and active assignments
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* AI Assistant Chatbot */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                IRIS AI Assistant
              </h3>
              <p className="text-sm text-muted-foreground">
                Intelligent conversational assistant providing real-time SOC operational insights and data access.
              </p>

              <div className="space-y-2">
                <h4 className="font-medium text-sm">Key Capabilities:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span><strong>Incident Lookup:</strong> Query specific incidents by case number (e.g., "Show INC-001")</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span><strong>Search & Filter:</strong> Find incidents by keywords, severity, or status</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span><strong>Alert Monitoring:</strong> View pending and recent security alerts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span><strong>System Status:</strong> Check platform health and operational metrics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span><strong>Team Information:</strong> Query team member availability and assignments</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span><strong>Quick Summaries:</strong> Get dashboard overviews and statistical insights</span>
                  </li>
                </ul>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mt-3">
                <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-primary" />
                  Example Queries
                </h4>
                <div className="grid gap-2 text-xs font-mono">
                  <div className="bg-background/50 px-3 py-2 rounded">
                    "Show INC-001" → Displays full incident details
                  </div>
                  <div className="bg-background/50 px-3 py-2 rounded">
                    "Critical incidents" → Lists all critical priority cases
                  </div>
                  <div className="bg-background/50 px-3 py-2 rounded">
                    "Recent alerts" → Shows latest security detections
                  </div>
                  <div className="bg-background/50 px-3 py-2 rounded">
                    "System status" → Platform health report
                  </div>
                  <div className="bg-background/50 px-3 py-2 rounded">
                    "Summary" → Complete SOC dashboard overview
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground italic">
                Access IRIS by clicking the floating bot icon in the bottom-right corner of any page.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Severity Classification */}
        <Card className="print:shadow-none print:border-gray-300 print:break-before-page">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
              Severity Classification & SLAs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {severityLevels.map((level) => (
                <div key={level.level} className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-3 h-3 rounded-full ${level.color}`} />
                    <h4 className="font-semibold">{level.level}</h4>
                    <Badge variant="outline" className="font-mono">
                      Score: {level.score}
                    </Badge>
                    <Badge variant="secondary" className="gap-1">
                      <Clock className="h-3 w-3" />
                      SLA: {level.sla}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{level.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {level.actions.map((action, i) => (
                      <span key={i} className="text-xs px-2 py-1 bg-secondary rounded">
                        {action}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Threat Types */}
        <div className="space-y-6 print:break-before-page">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Threat Detection Categories
          </h2>

          {threatTypes.map((threat, index) => (
            <Card key={threat.name} className="print:shadow-none print:border-gray-300 print:break-inside-avoid">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <threat.icon className="h-5 w-5 text-primary" />
                    {threat.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{threat.category}</Badge>
                    <Badge
                      className={
                        threat.severity === 'critical' ? 'bg-severity-critical' :
                          threat.severity === 'high' ? 'bg-severity-high' :
                            'bg-severity-medium'
                      }
                    >
                      {threat.severity.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h5 className="font-semibold text-sm mb-2 flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    Detection Indicators
                  </h5>
                  <ul className="space-y-1">
                    {threat.indicators.map((indicator, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        {indicator}
                      </li>
                    ))}
                  </ul>
                </div>

                <Separator />

                <div>
                  <h5 className="font-semibold text-sm mb-2 flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Response Procedures
                  </h5>
                  <ol className="space-y-1">
                    {threat.response.map((step, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="font-mono text-primary font-semibold">{i + 1}.</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="pt-2">
                  <h5 className="font-semibold text-sm mb-2">MITRE ATT&CK Mapping</h5>
                  <div className="flex flex-wrap gap-2">
                    {threat.mitre.map((tech, i) => (
                      <span key={i} className="text-xs px-2 py-1 bg-primary/10 text-primary rounded font-mono">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Risk Scoring Methodology */}
        <Card className="print:shadow-none print:border-gray-300 print:break-before-page">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Risk Scoring Methodology
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              The system calculates risk scores (0-100) based on weighted analysis of multiple
              threat indicators. Each indicator contributes to the total score based on its
              severity and reliability.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-semibold">Indicator Category</th>
                    <th className="text-left py-2 font-semibold">Indicators</th>
                    <th className="text-left py-2 font-semibold">Max Score Impact</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="py-2">Network Anomalies</td>
                    <td className="py-2 text-muted-foreground">Data transfer, port scanning, IP reputation</td>
                    <td className="py-2 font-mono">+35 points</td>
                  </tr>
                  <tr>
                    <td className="py-2">Authentication Events</td>
                    <td className="py-2 text-muted-foreground">Failed logins, impossible travel, off-hours</td>
                    <td className="py-2 font-mono">+40 points</td>
                  </tr>
                  <tr>
                    <td className="py-2">Endpoint Behavior</td>
                    <td className="py-2 text-muted-foreground">File encryption, privilege escalation, persistence</td>
                    <td className="py-2 font-mono">+50 points</td>
                  </tr>
                  <tr>
                    <td className="py-2">Threat Intelligence</td>
                    <td className="py-2 text-muted-foreground">Hash matches, domain age, IP reputation</td>
                    <td className="py-2 font-mono">+50 points</td>
                  </tr>
                  <tr>
                    <td className="py-2">Email Security</td>
                    <td className="py-2 text-muted-foreground">SPF/DKIM, suspicious links, sender reputation</td>
                    <td className="py-2 font-mono">+25 points</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-sm text-muted-foreground italic">
              Note: Maximum cumulative score is capped at 100. Multiple indicators from the
              same category may have diminishing returns to prevent over-weighting.
            </p>
          </CardContent>
        </Card>

        {/* Contact & Escalation */}
        <Card className="print:shadow-none print:border-gray-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Escalation Contacts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Tier 1 - SOC Analysts</h4>
                <p className="text-sm text-muted-foreground">Initial triage and investigation</p>
                <p className="text-sm font-mono mt-2">soc-team@company.com</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Tier 2 - Security Engineers</h4>
                <p className="text-sm text-muted-foreground">Advanced investigation and containment</p>
                <p className="text-sm font-mono mt-2">security-engineers@company.com</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Tier 3 - Incident Response</h4>
                <p className="text-sm text-muted-foreground">Critical incidents and forensics</p>
                <p className="text-sm font-mono mt-2">ir-team@company.com</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Management</h4>
                <p className="text-sm text-muted-foreground">Executive notification for critical events</p>
                <p className="text-sm font-mono mt-2">ciso@company.com</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Workflow Section */}
        <Card className="print:shadow-none print:border-gray-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5 text-primary" />
              How IRIS.SEC Works - Complete System Workflow
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Overview */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                System Architecture Overview
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                IRIS.SEC is a comprehensive incident response platform that integrates real-time threat detection, 
                machine learning analysis, and automated response workflows. The system processes security events 
                from multiple sources and provides actionable intelligence to security analysts.
              </p>
              
              <div className="grid md:grid-cols-4 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 text-blue-400">Data Ingestion</h4>
                  <p className="text-sm text-muted-foreground">
                    Real-time collection from SIEM, firewalls, and security tools
                  </p>
                  <div className="text-xs mt-2 space-y-1">
                    <p>• 10,000+ events/hour</p>
                    <p>• 15+ data sources</p>
                    <p>• Sub-second latency</p>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 text-green-400">Threat Analysis</h4>
                  <p className="text-sm text-muted-foreground">
                    ML-powered classification and risk scoring
                  </p>
                  <div className="text-xs mt-2 space-y-1">
                    <p>• 96.8% accuracy</p>
                    <p>• 8.5ms avg inference</p>
                    <p>• 4-model ensemble</p>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 text-orange-400">Response Automation</h4>
                  <p className="text-sm text-muted-foreground">
                    Automated containment and remediation
                  </p>
                  <div className="text-xs mt-2 space-y-1">
                    <p>• 4.2min avg response</p>
                    <p>• 85% auto-remediation</p>
                    <p>• 24/7 monitoring</p>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 text-purple-400">Reporting & Analytics</h4>
                  <p className="text-sm text-muted-foreground">
                    Comprehensive dashboards and compliance reports
                  </p>
                  <div className="text-xs mt-2 space-y-1">
                    <p>• Real-time metrics</p>
                    <p>• Custom reports</p>
                    <p>• Audit trails</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step-by-Step Workflow */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <GitBranch className="h-4 w-4" />
                Step-by-Step Workflow
              </h3>
              <div className="space-y-4">
                {/* Step 1 */}
                <div className="border-l-4 border-blue-500 pl-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                    <h4 className="font-semibold">Security Event Collection</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    The system continuously collects security events from multiple sources:
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1 ml-6">
                    <li>• SIEM systems (Splunk, QRadar, Sentinel)</li>
                    <li>• Network devices (Firewalls, IDS/IPS)</li>
                    <li>• Endpoint protection (CrowdStrike, SentinelOne)</li>
                    <li>• Cloud platforms (AWS, Azure, GCP)</li>
                    <li>• Email security (Proofpoint, Mimecast)</li>
                    <li>• Identity providers (Okta, Azure AD)</li>
                  </ul>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded mt-2">
                    <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                      Processing: 10,000+ events per hour with sub-second latency
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="border-l-4 border-green-500 pl-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                    <h4 className="font-semibold">Event Normalization & Enrichment</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Raw events are standardized and enriched with contextual data:
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1 ml-6">
                    <li>• Schema normalization across all sources</li>
                    <li>• GeoIP location and ASN lookup</li>
                    <li>• Threat intelligence integration</li>
                    <li>• Asset inventory correlation</li>
                    <li>• User context and permissions</li>
                    <li>• Historical pattern analysis</li>
                  </ul>
                  <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded mt-2">
                    <p className="text-xs font-medium text-green-600 dark:text-green-400">
                      Enrichment: 25+ data points per event for comprehensive analysis
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="border-l-4 border-orange-500 pl-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                    <h4 className="font-semibold">Machine Learning Analysis</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Events are analyzed using our multi-model ensemble system:
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1 ml-6">
                    <li>• Feature extraction (11 engineered features)</li>
                    <li>• XGBoost model analysis (50% weight)</li>
                    <li>• Random Forest analysis (30% weight)</li>
                    <li>• Logistic Regression analysis (20% weight)</li>
                    <li>• Ensemble scoring and confidence calculation</li>
                    <li>• Risk severity classification</li>
                  </ul>
                  <div className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded mt-2">
                    <p className="text-xs font-medium text-orange-600 dark:text-orange-400">
                      Performance: 95.25% accuracy with 8.5ms average inference time
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="border-l-4 border-purple-500 pl-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">4</div>
                    <h4 className="font-semibold">Alert Generation & Triage</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    ML predictions are converted into actionable alerts:
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1 ml-6">
                    <li>• Severity classification (Critical, High, Medium, Low)</li>
                    <li>• Risk scoring (0-100 scale)</li>
                    <li>• MITRE ATT&CK technique mapping</li>
                    <li>• Automated correlation analysis</li>
                    <li>• Duplicate alert suppression</li>
                    <li>• Priority queue assignment</li>
                  </ul>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded mt-2">
                    <p className="text-xs font-medium text-purple-600 dark:text-purple-400">
                      Triage: 89% of alerts automatically classified with confidence &gt;90%
                    </p>
                  </div>
                </div>

                {/* Step 5 */}
                <div className="border-l-4 border-red-500 pl-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">5</div>
                    <h4 className="font-semibold">Automated Response & Containment</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    High-confidence threats trigger automated response actions:
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1 ml-6">
                    <li>• Account lockout and credential reset</li>
                    <li>• Network isolation and IP blocking</li>
                    <li>• Endpoint quarantine and malware removal</li>
                    <li>• Data loss prevention activation</li>
                    <li>• Security group updates</li>
                    <li>• Forensic evidence collection</li>
                  </ul>
                  <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded mt-2">
                    <p className="text-xs font-medium text-red-600 dark:text-red-400">
                      Response: 85% of threats contained within 5 minutes of detection
                    </p>
                  </div>
                </div>

                {/* Step 6 */}
                <div className="border-l-4 border-indigo-500 pl-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-xs font-bold">6</div>
                    <h4 className="font-semibold">Human Analyst Review</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Security analysts review and escalate complex incidents:
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1 ml-6">
                    <li>• Alert investigation and validation</li>
                    <li>• Threat hunting and pattern analysis</li>
                    <li>• Incident severity escalation</li>
                    <li>• Coordination with other teams</li>
                    <li>• Executive notification for critical events</li>
                    <li>• Documentation and knowledge base updates</li>
                  </ul>
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 p-2 rounded mt-2">
                    <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                      Analyst Efficiency: 60% reduction in investigation time with ML assistance
                    </p>
                  </div>
                </div>

                {/* Step 7 */}
                <div className="border-l-4 border-teal-500 pl-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-teal-500 text-white rounded-full flex items-center justify-center text-xs font-bold">7</div>
                    <h4 className="font-semibold">Reporting & Compliance</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Comprehensive reporting for compliance and improvement:
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1 ml-6">
                    <li>• Automated compliance report generation</li>
                    <li>• KPI and performance metrics tracking</li>
                    <li>• Incident trend analysis</li>
                    <li>• ROI and cost-benefit analysis</li>
                    <li>• Audit trail maintenance</li>
                    <li>• Continuous improvement recommendations</li>
                  </ul>
                  <div className="bg-teal-50 dark:bg-teal-900/20 p-2 rounded mt-2">
                    <p className="text-xs font-medium text-teal-600 dark:text-teal-400">
                      Compliance: 100% audit readiness with automated report generation
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* System Metrics */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Real-World Performance Metrics
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 text-green-400">Detection Performance</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Detection Rate:</span>
                      <span className="font-mono">96.8%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>False Positive Rate:</span>
                      <span className="font-mono">5.2%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Mean Time to Detect:</span>
                      <span className="font-mono">2.2 min</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Daily Alerts Processed:</span>
                      <span className="font-mono">2,840</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 text-blue-400">Response Efficiency</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Mean Time to Respond:</span>
                      <span className="font-mono">3.5 min</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Auto-Containment Rate:</span>
                      <span className="font-mono">88.5%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Escalation Accuracy:</span>
                      <span className="font-mono">97%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Analyst Workload Reduction:</span>
                      <span className="font-mono">74%</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 text-purple-400">System Reliability</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Uptime:</span>
                      <span className="font-mono">99.99%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Data Processing Latency:</span>
                      <span className="font-mono">&lt;0.5s</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ML Inference Time:</span>
                      <span className="font-mono">8.5ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cache Hit Rate:</span>
                      <span className="font-mono">94%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Integration Ecosystem */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Network className="h-4 w-4" />
                Integration Ecosystem
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm mb-2">Security Tools</h4>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>• SIEM: Splunk, IBM QRadar, Microsoft Sentinel</p>
                    <p>• EDR: CrowdStrike Falcon, SentinelOne, Carbon Black</p>
                    <p>• Network: Palo Alto, Cisco Firepower, Fortinet</p>
                    <p>• Cloud: AWS Security Hub, Azure Defender, GCP SCC</p>
                    <p>• Email: Proofpoint, Mimecast, Microsoft Defender</p>
                    <p>• Identity: Okta, Azure AD, Ping Identity</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-2">Communication Channels</h4>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>• Slack: Real-time alert notifications</p>
                    <p>• Microsoft Teams: Incident collaboration</p>
                    <p>• PagerDuty: On-call escalation</p>
                    <p>• Email: Executive notifications</p>
                    <p>• SMS: Critical alert delivery</p>
                    <p>• Webhooks: Custom integrations</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ML Architecture Section */}
        <Card className="print:shadow-none print:border-gray-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Machine Learning Architecture (v3.0 Ensemble)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Overview */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Layers className="h-4 w-4" />
                4-Model Intelligence Ensemble
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Our advanced ML system employs a weighted ensemble architecture, orchestrating four specialized 
                models to deliver high-fidelity threat detection with deterministic telemetry evolution.
              </p>
              
              <div className="grid md:grid-cols-4 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 text-emerald-400">Ensemble-Alpha</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Consensus leader for multi-vector validation
                  </p>
                  <div className="text-xs space-y-1">
                    <p><strong>Accuracy:</strong> 96.8%</p>
                    <p><strong>Latency:</strong> 85ms</p>
                    <p><strong>Weight:</strong> 40%</p>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 text-blue-400">XGBoost-V4</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    High-speed volumetric telemetry analysis
                  </p>
                  <div className="text-xs space-y-1">
                    <p><strong>Accuracy:</strong> 94.2%</p>
                    <p><strong>Latency:</strong> 42ms</p>
                    <p><strong>Weight:</strong> 25%</p>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 text-violet-400">LGBM-Optimized</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Low-latency edge-case detection specialist
                  </p>
                  <div className="text-xs space-y-1">
                    <p><strong>Accuracy:</strong> 93.5%</p>
                    <p><strong>Latency:</strong> 35ms</p>
                    <p><strong>Weight:</strong> 20%</p>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 text-amber-400">Neural-Corr</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Long-term attack campaign correlation
                  </p>
                  <div className="text-xs space-y-1">
                    <p><strong>Accuracy:</strong> 91.2%</p>
                    <p><strong>Latency:</strong> 120ms</p>
                    <p><strong>Weight:</strong> 15%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Flow */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <GitBranch className="h-4 w-4" />
                Intelligence Data Flow
              </h3>
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                    <div>
                      <p className="font-medium">Deterministic Telemetry Sync</p>
                      <p className="text-xs text-muted-foreground">7.0s synchronized refresh cycle across all intelligence modules</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                    <div>
                      <p className="font-medium">Deep Feature Engineering</p>
                      <p className="text-xs text-muted-foreground">28+ tactical features including entropy, jitter, and propagation factors</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                    <div>
                      <p className="font-medium">Parallel Model Inference</p>
                      <p className="text-xs text-muted-foreground">Simultaneous execution with individual error handling and fallback logic</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">4</div>
                    <div>
                      <p className="font-medium">Explainable AI (XAI) Attribution</p>
                      <p className="text-xs text-muted-foreground">SHAP/LIME consensus reasoning logs generated for every detection</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Engineering */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Database className="h-4 w-4" />
                Advanced Feature Engineering (28+ Metrics)
              </h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="p-3 border rounded-lg bg-muted/20">
                  <h4 className="font-medium mb-2 text-primary">Tactical Features</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Risk Propagation Factor (Lateral Movement depth)</li>
                    <li>• Payload Entropy Analysis (Obfuscation detection)</li>
                    <li>• C2 Beaconing Jitter (Command & Control timing)</li>
                    <li>• MFA Fatigue Patterns (Authentication abuse)</li>
                    <li>• DGA Domain Complexity (Malware infrastructure)</li>
                  </ul>
                </div>
                <div className="p-3 border rounded-lg bg-muted/20">
                  <h4 className="font-medium mb-2 text-primary">Behavioral Metrics</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Process Tree Anomaly Score</li>
                    <li>• API Abuse Threshold Monitoring</li>
                    <li>• Log-transformed Bytes/sec Volumetrics</li>
                    <li>• Time-weighted Source Reputation</li>
                    <li>• Privilege Escalation Depth Analysis</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground py-8 print:py-4">
          <Separator className="mb-4" />
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
            <Button onClick={handlePrint} className="gap-2">
              <Download className="h-4 w-4" />
              Download Full Documentation
            </Button>
            <Button onClick={handleDownloadTrainingData} variant="outline" className="gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Download ML Training Data
            </Button>
          </div>
          <p>Incident Response Platform - Security Documentation</p>
          <p className="mt-1">Version 2.0 | Last Updated: {new Date().toLocaleDateString()}</p>
          <p className="mt-1 italic">This document is confidential and intended for internal use only.</p>
        </div>
      </div>
    </MainLayout>
  );
};

export default Documentation;
