import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';
import {
  Plus,
  Filter,
  Search,
  ArrowUpDown,
  LayoutGrid,
  List,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { IncidentRow } from '@/components/dashboard/IncidentRow';
import { NewIncidentDialog } from '@/components/dashboard/NewIncidentDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useIncidents, type Severity, type IncidentStatus } from '@/context/IncidentsContext';
import { useSimulation } from '@/context/SimulationContext';

const IncidentsWorking = () => {
  const { incidents, loading } = useIncidents();
  const { virtualTime } = useSimulation();

  // Function to generate realistic timestamps based on virtual time
  const getRealisticTimestamp = (created_at: string) => {
    const incidentTime = new Date(created_at);
    const now = virtualTime;
    const timeDiff = now.getTime() - incidentTime.getTime();
    
    // If incident is very recent, show "just now" or "X minutes ago"
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
    return incidentTime.toLocaleDateString();
  };
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low' | 'info'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'investigating' | 'contained' | 'resolved' | 'closed'>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // Filter incidents based on search and filters
  const filteredIncidents = useMemo(() => {
    return incidents.filter(incident => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.case_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      // Severity filter
      const matchesSeverity = severityFilter === 'all' || incident.severity === severityFilter;

      // Status filter
      const matchesStatus = statusFilter === 'all' || incident.status === statusFilter;

      return matchesSearch && matchesSeverity && matchesStatus;
    });
  }, [incidents, searchTerm, severityFilter, statusFilter]);

  // Sort incidents
  const sortedIncidents = useMemo(() => {
    return [...filteredIncidents].sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }, [filteredIncidents, sortOrder]);

  const paginatedItems = sortedIncidents.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const totalPages = Math.ceil(sortedIncidents.length / pageSize);

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
              Incidents
            </motion.h1>
            <p className="text-muted-foreground">
              Manage and track security incidents
            </p>
          </div>
          <NewIncidentDialog />
        </div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search incidents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-secondary/50"
              />
            </div>

            <Select
              value={severityFilter}
              onValueChange={(value) => setSeverityFilter(value as Severity | 'all')}
            >
              <SelectTrigger className="w-[140px] bg-secondary/50">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="info">Info</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as IncidentStatus | 'all')}
            >
              <SelectTrigger className="w-[150px] bg-secondary/50">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="contained">Contained</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="icon"
              className="shrink-0"
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              title={sortOrder === 'desc' ? 'Newest first' : 'Oldest first'}
            >
              <ArrowUpDown className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="shrink-0"
              onClick={() => {
                setSearchTerm('');
                setSeverityFilter('all');
                setStatusFilter('all');
                setSortOrder('desc');
                setCurrentPage(1);
              }}
              title="Reset all filters"
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center rounded-lg border bg-secondary/50 p-1">
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 px-2"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 px-2"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>

        {/* Results Summary */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <p>
            Showing <span className="font-semibold text-foreground">{paginatedItems.length}</span> of{' '}
            <span className="font-semibold text-foreground">{sortedIncidents.length}</span> incidents
            {sortedIncidents.length !== incidents.length && (
              <span className="ml-2">
                (filtered from {incidents.length} total)
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

        {/* Incidents List */}
        {viewMode === 'list' ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="rounded-xl border bg-card overflow-hidden"
          >
            {paginatedItems.length > 0 ? (
              <div className="divide-y divide-border/50">
                {paginatedItems.map((incident, index) => (
                  <IncidentRow key={incident.id} incident={incident} index={index} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Filter className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <p className="text-lg font-medium">No incidents found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Try adjusting your filters or search term
                </p>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {paginatedItems.length > 0 ? (
              paginatedItems.map((incident, index) => (
                <IncidentRow key={incident.id} incident={incident} index={index} viewMode="grid" />
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-16 text-center rounded-xl border bg-card">
                <Filter className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <p className="text-lg font-medium">No incidents found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Try adjusting your filters or search term
                </p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </MainLayout>
  );
};

export default IncidentsWorking;
