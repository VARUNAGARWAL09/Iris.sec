import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MainLayout } from '@/components/layout/MainLayout';
import { useActivity } from '@/context/ActivityContext';
import { TimelineItem } from '@/components/dashboard/TimelineItem';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Activity as ActivityIcon, RefreshCw, Search, Loader2, Filter, ShieldAlert, UserCheck } from 'lucide-react';
import { useMLInference } from '@/hooks/useMLInference';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function Activity() {
  const { activities, loading, refetch } = useActivity();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const { detectAnomalies } = useMLInference();
  const [anomalyData, setAnomalyData] = useState<any>(null);

  useEffect(() => {
    if (activities.length > 0 && !anomalyData) {
      const checkAnomalies = async () => {
        const result = await detectAnomalies(
          'analyst-001',
          'analyst',
          'analyst_actions',
          { actions_per_hour: 45, failed_logins: 0, critical_access_count: 5 },
          [
            { actions_per_hour: 10, failed_logins: 0, critical_access_count: 1 },
            { actions_per_hour: 12, failed_logins: 0, critical_access_count: 2 }
          ]
        );
        if (result && result.anomaly_score > 0.5) {
          setAnomalyData(result);
        }
      };
      checkAnomalies();
    }
  }, [activities]);

  const filteredActivities = activities.filter((activity) => {
    const matchesSearch = !searchTerm ||
      activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.user_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'all' || activity.type === typeFilter;

    return matchesSearch && matchesType;
  });

  const activityTypes = [...new Set(activities.map(a => a.type))];

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      alert: 'Alerts',
      evidence: 'Evidence',
      status_change: 'Status Changes',
      note: 'Notes',
      assignment: 'Assignments',
      action: 'Actions',
    };
    return labels[type] || type;
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-mono text-xl md:text-2xl font-bold tracking-tight"
            >
              Activity Log
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="text-muted-foreground mt-1"
            >
              Real-time activity feed for all system events
            </motion.p>
          </div>

          <Button onClick={refetch} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="flex flex-wrap items-center gap-3 rounded-xl border bg-card p-4"
        >
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-secondary/50"
            />
          </div>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[160px] bg-secondary/50">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {activityTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {getTypeLabel(type)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        {/* UEBA Anomaly Banner */}
        {anomalyData && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/20 rounded-full">
                <ShieldAlert className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-red-600 uppercase tracking-wider flex items-center gap-2">
                  UEBA Anomaly Detected: {anomalyData.anomaly_type.replace('_', ' ')}
                  <Badge variant="destructive" className="text-[10px] h-4">{(anomalyData.anomaly_score * 100).toFixed(0)}% ANOMALY</Badge>
                </h4>
                <p className="text-xs text-red-600/80 mt-0.5">
                  {anomalyData.explanation} Affected Entity: <strong>{anomalyData.affected_entity}</strong>
                </p>
              </div>
            </div>
            <Button size="sm" variant="destructive" className="h-8 text-xs font-mono uppercase tracking-widest">
              Investigate Deviations
            </Button>
          </motion.div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{activities.length}</div>
              <p className="text-xs text-muted-foreground">Total Activities</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">
                {activities.filter(a => a.type === 'alert').length}
              </div>
              <p className="text-xs text-muted-foreground">Alerts</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">
                {activities.filter(a => a.type === 'status_change').length}
              </div>
              <p className="text-xs text-muted-foreground">Status Changes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">
                {activities.filter(a => a.type === 'evidence').length}
              </div>
              <p className="text-xs text-muted-foreground">Evidence Added</p>
            </CardContent>
          </Card>
        </div>

        {/* Activity Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ActivityIcon className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Showing {filteredActivities.length} of {activities.length} activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ScrollArea className="h-[500px] pr-4">
                {filteredActivities.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <ActivityIcon className="h-12 w-12 text-muted-foreground/30 mb-4" />
                    <p className="text-lg font-medium">No activity yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Activities will appear here as events occur
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredActivities.map((activity, index) => (
                      <TimelineItem
                        key={activity.id}
                        event={activity}
                        index={index}
                        isLast={index === filteredActivities.length - 1}
                      />
                    ))}
                  </div>
                )}
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
