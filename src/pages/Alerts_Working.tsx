import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Check,
  Filter,
  Search,
  Bell,
  BellOff,
  ArrowUpDown,
  Play,
  CheckCircle,
  ArrowUpCircle,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { AlertCard } from '@/components/dashboard/AlertCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSimulation } from '@/context/SimulationContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import type { Severity } from '@/types/incident';

const AlertsWorking = () => {
  const { alerts, acknowledgeAlert, resolveAlert, escalateToIncident, virtualTime } = useSimulation();

  // Function to generate realistic timestamps based on virtual time
  const getRealisticTimestamp = (created_at: string) => {
    const alertTime = new Date(created_at);
    const now = virtualTime;
    const timeDiff = now.getTime() - alertTime.getTime();
    
    // If alert is very recent, show "just now" or "X minutes ago"
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
    return alertTime.toLocaleDateString();
  };
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low' | 'info'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  // Filter alerts based on search, severity, and tab
  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.source.toLowerCase().includes(searchTerm.toLowerCase());

      // Severity filter
      const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;

      // Tab filter
      const matchesTab = activeTab === 'all' ||
        (activeTab === 'pending' && alert.status === 'pending') ||
        (activeTab === 'acknowledged' && alert.status === 'acknowledged') ||
        (activeTab === 'resolved' && alert.status === 'resolved');

      return matchesSearch && matchesSeverity && matchesTab;
    });
  }, [alerts, searchTerm, severityFilter, activeTab]);

  const paginatedAlerts = filteredAlerts.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const totalPages = Math.ceil(filteredAlerts.length / pageSize);

  const pendingCount = alerts.filter(a => a.status === 'pending').length;
  const acknowledgedCount = alerts.filter(a => a.status === 'acknowledged').length;
  const resolvedCount = alerts.filter(a => a.status === 'resolved').length;

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
              Security Alerts
            </motion.h1>
            <p className="text-muted-foreground">
              Monitor and respond to security alerts in real-time
            </p>
          </div>
        </div>

        {/* Alert Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all" className="flex items-center gap-2">
              All Alerts
              <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded-full text-xs">
                {alerts.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center gap-2">
              Pending
              <span className="bg-severity-high/10 text-severity-high px-2 py-0.5 rounded-full text-xs">
                {pendingCount}
              </span>
            </TabsTrigger>
            <TabsTrigger value="acknowledged" className="flex items-center gap-2">
              Acknowledged
              <span className="bg-status-investigating/10 text-status-investigating px-2 py-0.5 rounded-full text-xs">
                {acknowledgedCount}
              </span>
            </TabsTrigger>
            <TabsTrigger value="resolved" className="flex items-center gap-2">
              Resolved
              <span className="bg-status-resolved/10 text-status-resolved px-2 py-0.5 rounded-full text-xs">
                {resolvedCount}
              </span>
            </TabsTrigger>
          </TabsList>

          {/* Tab Content */}
          <TabsContent value={activeTab} className="mt-4">
            {/* Search and Filters */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-wrap items-center gap-2 mb-4"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search alerts..."
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
                </SelectContent>
              </Select>

              <Button variant="outline" size="icon">
                <ArrowUpDown className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="shrink-0"
                onClick={() => {
                  setSearchTerm('');
                  setSeverityFilter('all');
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
                Showing <span className="font-semibold text-foreground">{paginatedAlerts.length}</span> of{' '}
                <span className="font-semibold text-foreground">{filteredAlerts.length}</span> alerts
                {filteredAlerts.length !== alerts.length && (
                  <span className="ml-2">
                    (filtered from {alerts.length} total)
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

            {/* Alerts Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              {paginatedAlerts.length > 0 ? (
                paginatedAlerts.map((alert, index) => (
                  <div key={alert.id} className="relative">
                    <AlertCard alert={alert} index={index} />
                  </div>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-16 text-center rounded-xl border bg-card">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground/30 mb-4" />
                  <p className="text-lg font-medium">No alerts found</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {alerts.length === 0
                      ? 'Simulation is generating alerts automatically...'
                      : 'Try adjusting your filters or search term'}
                  </p>
                  {alerts.length === 0 && (
                    <div className="flex items-center gap-2 mt-4 text-primary">
                      <Play className="h-4 w-4 animate-pulse" />
                      <span className="text-sm">Generating alerts...</span>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default AlertsWorking;
