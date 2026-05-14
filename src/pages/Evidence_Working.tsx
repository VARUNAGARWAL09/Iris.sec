import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';
import {
  FileSearch,
  Upload,
  Hash,
  Globe,
  Network,
  Mail,
  File,
  Filter,
  Search,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  Play,
  Copy,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useSimulation, type Evidence as SimEvidence } from '@/context/SimulationContext';
import { useToast } from '@/hooks/use-toast';
import { UploadEvidenceDialog } from '@/components/evidence/UploadEvidenceDialog';
import { IntegrityBadge } from '@/components/evidence/IntegrityBadge';
import { useEvidenceIntegrityOptimized } from '@/hooks/useEvidenceIntegrityOptimized';
import type { EvidenceType } from '@/types/incident';

type EvidenceClassification = 'malicious' | 'suspicious' | 'benign' | 'unknown';

const EvidenceWorking = () => {
  const { evidence, virtualTime } = useSimulation();

  // Function to generate realistic timestamps based on virtual time
  const getRealisticTimestamp = (created_at: string) => {
    const evidenceTime = new Date(created_at);
    const now = virtualTime;
    const timeDiff = now.getTime() - evidenceTime.getTime();
    
    // If evidence is very recent, show "just now" or "X minutes ago"
    if (timeDiff < 60000) {
      return 'Just now';
    }
    
    // If within last hour, show minutes ago
    if (timeDiff < 3600000) {
      const minutes = Math.floor(timeDiff / 60000);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    }
    
    // If within last 24 hours, show hours ago
    if (timeDiff < 86400000) {
      const hours = Math.floor(timeDiff / 3600000);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
    
    // If within last week, show days ago
    if (timeDiff < 604800000) {
      const days = Math.floor(timeDiff / 86400000);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
    
    // Otherwise show actual date
    return evidenceTime.toLocaleDateString();
  };
  const { toast } = useToast();
  const { verifyIntegrity, verifying } = useEvidenceIntegrityOptimized();
  const [selectedEvidence, setSelectedEvidence] = useState<SimEvidence | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<EvidenceType | 'all'>('all');
  const [classFilter, setClassFilter] = useState<EvidenceClassification | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 30;

  // Filter evidence based on search, type, and classification
  const filteredEvidence = useMemo(() => {
    return evidence.filter(e => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        e.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.description?.toLowerCase().includes(searchTerm.toLowerCase()));

      // Type filter
      const matchesType = typeFilter === 'all' || e.type === typeFilter;

      // Classification filter
      const matchesClass = classFilter === 'all' || e.classification === classFilter;

      return matchesSearch && matchesType && matchesClass;
    });
  }, [evidence, searchTerm, typeFilter, classFilter]);

  const paginatedEvidence = filteredEvidence.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const totalPages = Math.ceil(filteredEvidence.length / pageSize);

  const getTypeIcon = (type: EvidenceType) => {
    switch (type) {
      case 'hash': return Hash;
      case 'url': return Globe;
      case 'ip': return Network;
      case 'domain': return Globe;
      case 'email': return Mail;
      case 'file': return File;
      default: return FileSearch;
    }
  };

  const getClassificationIcon = (classification: EvidenceClassification) => {
    switch (classification) {
      case 'malicious': return ShieldAlert;
      case 'suspicious': return ShieldQuestion;
      case 'benign': return ShieldCheck;
      default: return ShieldQuestion;
    }
  };

  const getClassificationColor = (classification: EvidenceClassification) => {
    switch (classification) {
      case 'malicious': return 'text-severity-critical bg-severity-critical/10 border-severity-critical/30';
      case 'suspicious': return 'text-severity-high bg-severity-high/10 border-severity-high/30';
      case 'benign': return 'text-status-resolved bg-status-resolved/10 border-status-resolved/30';
      default: return 'text-muted-foreground bg-muted border-border';
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-mono text-xl md:text-2xl font-bold tracking-tight"
            >
              Evidence Repository
            </motion.h1>
            <p className="text-muted-foreground">
              Digital evidence collection and integrity verification
            </p>
          </div>
          <UploadEvidenceDialog trigger={<Button>Upload Evidence</Button>} />
        </div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap items-center gap-2"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by value or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-secondary/50"
            />
          </div>

          <Select
            value={typeFilter}
            onValueChange={(value) => setTypeFilter(value as EvidenceType | 'all')}
          >
            <SelectTrigger className="w-[130px] bg-secondary/50">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="hash">Hash</SelectItem>
              <SelectItem value="ip">IP Address</SelectItem>
              <SelectItem value="url">URL</SelectItem>
              <SelectItem value="domain">Domain</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="file">File</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={classFilter}
            onValueChange={(value) => setClassFilter(value as EvidenceClassification | 'all')}
          >
            <SelectTrigger className="w-[150px] bg-secondary/50">
              <SelectValue placeholder="Classification" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              <SelectItem value="malicious">Malicious</SelectItem>
              <SelectItem value="suspicious">Suspicious</SelectItem>
              <SelectItem value="benign">Benign</SelectItem>
              <SelectItem value="unknown">Unknown</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={() => {
              setSearchTerm('');
              setTypeFilter('all');
              setClassFilter('all');
              setCurrentPage(1);
            }}
            title="Reset all filters"
          >
            <Filter className="h-4 w-4" />
          </Button>
        </motion.div>

        {/* Results Summary */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <p>
            Showing <span className="font-semibold text-foreground">{paginatedEvidence.length}</span> of{' '}
            <span className="font-semibold text-foreground">{filteredEvidence.length}</span> evidence items
            {filteredEvidence.length !== evidence.length && (
              <span className="ml-2">
                (filtered from {evidence.length} total)
              </span>
            )}
            {totalPages > 1 && (
              <span className="ml-2">
                (Page {currentPage} of {totalPages})
              </span>
            )}
          </p>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>

        {/* Evidence Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          {paginatedEvidence.length > 0 ? (
            paginatedEvidence.map((e, index) => {
              const TypeIcon = getTypeIcon(e.type);
              const ClassIcon = getClassificationIcon(e.classification);

              return (
                <motion.div
                  key={e.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.02, duration: 0.2 }}
                  onClick={() => setSelectedEvidence(e)}
                  className="group rounded-xl border bg-card p-4 hover:border-primary/30 transition-all cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-secondary p-2.5">
                      <TypeIcon className="h-5 w-5 text-primary" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="outline" className="text-[10px] uppercase">
                          {e.type}
                        </Badge>
                        <div className={cn(
                          'flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium border',
                          getClassificationColor(e.classification)
                        )}>
                          <ClassIcon className="h-3 w-3" />
                          <span>{e.classification}</span>
                        </div>
                      </div>

                      <div className="mt-2">
                        <p className="font-mono text-sm break-all">{e.value}</p>
                        {e.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {e.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <span>Last active: {getRealisticTimestamp(e.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center rounded-xl border bg-card">
              <FileSearch className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-lg font-medium">No evidence found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Upload evidence or adjust your filters
              </p>
            </div>
          )}
        </motion.div>

        {/* Evidence Detail Dialog */}
        {selectedEvidence && (
          <Dialog open={true} onOpenChange={() => setSelectedEvidence(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {getTypeIcon(selectedEvidence.type)}
                  Evidence Details
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Value</p>
                  <p className="font-mono text-sm break-all">{selectedEvidence.value}</p>
                </div>

                {selectedEvidence.description && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Description</p>
                    <p className="text-sm">{selectedEvidence.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Type</p>
                    <Badge variant="outline" className="text-xs">
                      {selectedEvidence.type}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Classification</p>
                    <div className={cn(
                      'flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium border',
                      getClassificationColor(selectedEvidence.classification)
                    )}>
                      {getClassificationIcon(selectedEvidence.classification)}
                      <span>{selectedEvidence.classification}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Collected</p>
                  <p className="text-sm font-mono">{new Date(selectedEvidence.created_at).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">Last active: {getRealisticTimestamp(selectedEvidence.created_at)}</p>
                </div>

                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-xs text-muted-foreground">Chain of Custody</span>
                  <IntegrityBadge
                    isVerified={Boolean((selectedEvidence as any).metadata?.custody?.isVerified)}
                    lastVerified={(selectedEvidence as any).metadata?.custody?.lastVerified}
                    onVerify={() => verifyIntegrity(selectedEvidence.id)}
                    verifying={verifying === selectedEvidence?.id}
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="gap-2 flex-1" onClick={() => {
                    navigator.clipboard.writeText(selectedEvidence.value);
                    toast({ title: 'Copied to clipboard' });
                  }}>
                    <Copy className="h-4 w-4" />
                    Copy Value
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedEvidence(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </MainLayout>
  );
};

export default EvidenceWorking;
