import { memo } from 'react';
import { motion } from 'framer-motion';
import { Activity as ActivityIcon, Radio } from 'lucide-react';
import { TimelineItem } from './TimelineItem';
import type { Activity } from '@/context/ActivityContext';

interface ActivityFeedProps {
  events: Activity[];
  title?: string;
}

export const ActivityFeed = memo(function ActivityFeed({ events, title = 'Activity Feed' }: ActivityFeedProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className="rounded-xl border border-border bg-card overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <ActivityIcon className="h-4 w-4 text-primary" />
          <h3 className="font-mono text-sm font-semibold uppercase tracking-wider">{title}</h3>
          {events.length > 0 && (
            <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-mono font-semibold text-primary">
              {events.length}
            </span>
          )}
        </div>
        {events.length > 0 && (
          <div className="flex items-center gap-1.5">
            <Radio className="h-3 w-3 text-primary animate-pulse" />
            <span className="text-[10px] font-mono text-primary/70 tracking-wide">LIVE</span>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="p-4 max-h-[380px] overflow-y-auto scrollbar-thin">
        {events.length > 0 ? (
          <div className="space-y-0">
            {events.map((event, index) => (
              <TimelineItem
                key={event.id}
                event={event}
                isLast={index === events.length - 1}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <ActivityIcon className="h-7 w-7 text-muted-foreground/25 mb-2" />
            <p className="text-xs text-muted-foreground font-mono">No activity recorded yet</p>
          </div>
        )}
      </div>
    </motion.div>
  );
});
