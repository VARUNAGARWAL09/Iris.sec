import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
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
import { useOptimizedData } from '@/hooks/useOptimizedData';
import type { EvidenceType } from '@/types/incident';

type EvidenceClassification = 'malicious' | 'suspicious' | 'benign' | 'unknown';

const Evidence = () => {
  const { evidence } = useSimulation();
  const { toast } = useToast();
  const { verifyIntegrity, verifying } = useEvidenceIntegrityOptimized();
  const [selectedEvidence, setSelectedEvidence] = useState<SimEvidence | null>(null);

  const {
    paginatedItems,
    searchTerm,
    setSearchTerm,
    filters,
    setFilter,
    currentPage,
    setCurrentPage,
    totalPages,
    loading: dataLoading,
    debouncedSearchTerm
  } = useOptimizedData({
    items: evidence,
    searchFields: ['value', 'description'],
    filterFn: (evidence, filters) => {
      const matchesType = filters.type === 'all' || evidence.type === filters.type;
      const matchesClass = filters.classification === 'all' || evidence.classification === filters.classification;
      return matchesType && matchesClass;
    },
    sortFn: (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    pageSize: 30
  });

  // Initialize filters
  useMemo(() => {
    setFilter('type', 'all');
    setFilter('classification', 'all');
  }, [setFilter]);

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
              className="font-mono text-2xl font-bold tracking-tight"
            >
              Evidence Repository
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="text-muted-foreground mt-1"
            >
              Real-time digital forensic evidence collection
            </motion.p>
          </div>

          <UploadEvidenceDialog
            trigger={
              <Button className="gap-2">
                <Upload className="h-4 w-4" />
                Upload Evidence
              </Button>
            }
          />
        </div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-4 grid-cols-2 sm:grid-cols-4"
        >
          {[
            { label: 'Total Items', value: evidence.length, color: 'text-primary' },
            { label: 'Malicious', value: evidence.filter(e => e.classification === 'malicious').length, color: 'text-severity-critical' },
            { label: 'Suspicious', value: evidence.filter(e => e.classification === 'suspicious').length, color: 'text-severity-high' },
            { label: 'Benign', value: evidence.filter(e => e.classification === 'benign').length, color: 'text-status-resolved' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border bg-card p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              <p className={cn('font-mono text-2xl font-bold mt-1', stat.color)}>{stat.value}</p>
            </div>
          ))}
        </motion.div>

        {/* Filters Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="flex flex-wrap items-center gap-3 rounded-xl border bg-card p-4"
        >
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by value or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-secondary/50"
            />
          </div>

          <Select
            value={filters.type || 'all'}
            onValueChange={(value) => setFilter('type', value as EvidenceType | 'all')}
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
            value={filters.classification || 'all'}
            onValueChange={(value) => setFilter('classification', value as EvidenceClassification | 'all')}
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
        </motion.div>

        {/* Results Summary */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <p>
            Showing <span className="font-semibold text-foreground">{paginatedItems.length}</span> of{' '}
            <span className="font-semibold text-foreground">{evidence.length}</span> evidence items
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
          {paginatedItems.length > 0 ? (
            paginatedItems.map((e, index) => {
              const TypeIcon = getTypeIcon(e.type);
              const ClassIcon = getClassificationIcon(e.classification);

              return (
                <motion.div
                  key={e.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.02, duration: 0.2 }}
                  onClick={() => setSelectedEvidence(e)}
                  className="group rounded-xl border bg-card hover:border-primary/30 transition-all cursor-pointer overflow-hidden"
                >
                  {/* Visual Header — real image or type-themed fallback */}
                  {e.image_url ? (
                    <img
                      src={e.image_url}
                      alt="Evidence"
                      className="w-full h-28 object-cover"
                      onError={(ev) => { (ev.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <div className={cn(
                      'w-full h-28 flex flex-col items-center justify-center gap-1',
                      e.classification === 'malicious'  ? 'bg-gradient-to-br from-red-950/60 to-red-900/30' :
                      e.classification === 'suspicious' ? 'bg-gradient-to-br from-orange-950/60 to-orange-900/30' :
                      e.classification === 'benign'     ? 'bg-gradient-to-br from-emerald-950/60 to-emerald-900/30' :
                                                          'bg-gradient-to-br from-slate-900/80 to-slate-800/40'
                    )}>
                      <TypeIcon className={cn(
                        'h-8 w-8',
                        e.classification === 'malicious'  ? 'text-red-400' :
                        e.classification === 'suspicious' ? 'text-orange-400' :
                        e.classification === 'benign'     ? 'text-emerald-400' :
                                                            'text-slate-400'
                      )} />
                      <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">{e.type}</span>
                    </div>
                  )}

                  <div className="p-4">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <Badge variant="outline" className="text-[10px] uppercase">
                        {e.type}
                      </Badge>
                      <div className={cn(
                        'flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium border',
                        getClassificationColor(e.classification)
                      )}>
                        <ClassIcon className="h-3 w-3" />
                        {e.classification}
                      </div>
                    </div>

                    <p className="font-mono text-sm break-all text-foreground">
                      {e.value.length > 50
                        ? `${e.value.substring(0, 50)}...`
                        : e.value}
                    </p>

                    {e.description && (
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                        {e.description}
                      </p>
                    )}

                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{formatDistanceToNow(new Date(e.created_at), { addSuffix: true })}</span>
                      <span className="text-primary text-[10px]">Click to view</span>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center rounded-xl border bg-card">
              <Filter className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-lg font-medium">No evidence found</p>
              <p className="text-sm text-muted-foreground mt-1">
                {evidence.length === 0
                  ? 'Evidence is being collected automatically from alerts...'
                  : 'Try adjusting your filters'}
              </p>
              {evidence.length === 0 && (
                <div className="flex items-center gap-2 mt-4 text-primary">
                  <Play className="h-4 w-4 animate-pulse" />
                  <span className="text-sm">Collecting evidence...</span>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Evidence Details Dialog */}
        <Dialog open={!!selectedEvidence} onOpenChange={() => setSelectedEvidence(null)}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                {selectedEvidence && (() => {
                  const TypeIcon = getTypeIcon(selectedEvidence.type);
                  return <TypeIcon className="h-5 w-5 text-primary" />;
                })()}
                <Badge variant="outline" className="uppercase">{selectedEvidence?.type}</Badge>
                {selectedEvidence && (
                  <div className={cn(
                    'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium border ml-auto',
                    getClassificationColor(selectedEvidence.classification)
                  )}>
                    {(() => {
                      const ClassIcon = getClassificationIcon(selectedEvidence.classification);
                      return <ClassIcon className="h-3 w-3" />;
                    })()}
                    {selectedEvidence.classification}
                  </div>
                )}
              </DialogTitle>
            </DialogHeader>
            {selectedEvidence && (
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Value</p>
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-secondary/50 font-mono text-sm break-all">
                    <span className="flex-1">{selectedEvidence.value}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      onClick={() => {
                        navigator.clipboard.writeText(selectedEvidence.value);
                        toast({ title: 'Copied to clipboard' });
                      }}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {selectedEvidence.image_url && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Attached Image</p>
                    <img
                      src={selectedEvidence.image_url}
                      alt="Evidence"
                      className="w-full rounded-lg border max-h-48 object-cover"
                    />
                  </div>
                )}

                {selectedEvidence.description && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Description</p>
                    <p className="text-sm">{selectedEvidence.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Type</p>
                    <p className="text-sm font-medium capitalize">{selectedEvidence.type}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Collected</p>
                    <p className="text-sm font-mono">{new Date(selectedEvidence.created_at).toLocaleString()}</p>
                  </div>
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
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default Evidence;
