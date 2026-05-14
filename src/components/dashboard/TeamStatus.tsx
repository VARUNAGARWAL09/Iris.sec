import { memo } from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { User } from '@/types/incident';

interface TeamStatusProps {
  users: User[];
}

function getStatusInfo(lastActive?: Date) {
  if (!lastActive) return { color: 'bg-muted-foreground', text: 'Offline', ring: 'ring-muted-foreground/20' };
  const diff = Date.now() - lastActive.getTime();
  if (diff < 300000)  return { color: 'bg-status-open',          text: 'Online',  ring: 'ring-status-open/20' };
  if (diff < 1800000) return { color: 'bg-status-investigating',  text: 'Away',    ring: 'ring-status-investigating/20' };
  return { color: 'bg-muted-foreground/40', text: 'Offline', ring: 'ring-muted/20' };
}

export const TeamStatus = memo(function TeamStatus({ users }: TeamStatusProps) {
  const onlineCount = users.filter(u => {
    const diff = u.lastActive ? Date.now() - u.lastActive.getTime() : Infinity;
    return diff < 1800000;
  }).length;

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
          <Users className="h-4 w-4 text-primary" />
          <h3 className="font-mono text-sm font-semibold uppercase tracking-wider">Team Status</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-status-open animate-pulse" />
          <span className="text-xs font-mono text-status-open font-semibold">{onlineCount} online</span>
        </div>
      </div>

      {/* Members */}
      <div className="divide-y divide-border/40">
        {users.map((user, index) => {
          const status = getStatusInfo(user.lastActive);
          const initials = user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase();

          return (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.18, delay: index * 0.04 }}
              className="flex items-center gap-3 px-4 py-3 hover:bg-accent/25 transition-colors"
            >
              {/* Avatar with status ring */}
              <div className="relative flex-shrink-0">
                <Avatar className={cn('h-8 w-8 border border-border ring-2', status.ring)}>
                  <AvatarFallback className="bg-secondary/80 text-[11px] font-semibold font-mono text-foreground/80">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className={cn(
                  'absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card',
                  status.color,
                  status.text === 'Online' && 'animate-pulse'
                )} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-[10px] text-muted-foreground capitalize font-mono">{user.role}</p>
              </div>

              {/* Status pill */}
              <span className={cn(
                'text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border',
                status.text === 'Online'
                  ? 'bg-status-open/10 text-status-open border-status-open/30'
                  : status.text === 'Away'
                  ? 'bg-status-investigating/10 text-status-investigating border-status-investigating/30'
                  : 'bg-muted text-muted-foreground border-border'
              )}>
                {status.text}
              </span>
            </motion.div>
          );
        })}

        {users.length === 0 && (
          <div className="flex items-center justify-center py-8">
            <p className="text-xs text-muted-foreground font-mono">No team members assigned</p>
          </div>
        )}
      </div>
    </motion.div>
  );
});
