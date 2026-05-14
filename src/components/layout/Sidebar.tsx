import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  AlertTriangle,
  Folder,
  FileSearch,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
  Activity,
  Zap,
  FileText,
  ClipboardList,
  PlayCircle,
  Target,
  Database,
  Radio,
  Brain,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useIncidents } from '@/context/IncidentsContext';
import { useSimulation } from '@/context/SimulationContext';

const navItems = [
  { label: 'Dashboard',    href: '/',             icon: LayoutDashboard, section: 'ops' },
  { label: 'Incidents',    href: '/incidents',    icon: Folder,          section: 'ops', badgeKey: 'incidents' },
  { label: 'Alerts',       href: '/alerts',       icon: AlertTriangle,   section: 'ops', badgeKey: 'alerts' },
  { label: 'Evidence',     href: '/evidence',     icon: FileSearch,      section: 'ops' },
  { label: 'Log Ingestion',href: '/log-ingestion',icon: Database,        section: 'intel' },
  { label: 'Playbooks',    href: '/playbooks',    icon: PlayCircle,      section: 'intel' },
  { label: 'MITRE ATT&CK', href: '/mitre',        icon: Target,          section: 'intel' },
  { label: 'ML Intelligence',href: '/ml-intelligence',icon: Brain,        section: 'intel' },
  { label: 'Enrichment',   href: '/enrichment',   icon: Zap,             section: 'intel' },
] as const;

const bottomNavItems = [
  { label: 'Compliance',   href: '/compliance',   icon: Shield },
  { label: 'Activity Log', href: '/activity',     icon: Activity },
  { label: 'Audit Log',    href: '/audit-log',    icon: ClipboardList },
  { label: 'Documentation',href: '/documentation',icon: FileText },
  { label: 'Settings',     href: '/settings',     icon: Settings },
] as const;

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { incidents } = useIncidents();
  const { alerts } = useSimulation();

  const badges: Record<string, number> = {
    incidents: incidents.length,
    alerts:    alerts.length,
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 68 : 240 }}
      transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
      className="fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-sidebar-border bg-sidebar-background overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, hsl(222 50% 4%) 0%, hsl(220 45% 5%) 60%, hsl(218 50% 4%) 100%)',
      }}
    >
      {/* Subtle cyber-grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage:
            'linear-gradient(hsl(220 25% 14% / 0.4) 1px, transparent 1px), linear-gradient(90deg, hsl(220 25% 14% / 0.4) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

      {/* ── Logo ───────────────────────────────────── */}
      <div className="relative flex h-16 items-center justify-between border-b border-sidebar-border px-4 flex-shrink-0">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              key="logo-full"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.18 }}
              className="flex items-center gap-2.5"
            >
              <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-primary glow-primary flex-shrink-0">
                <Shield className="h-4 w-4 text-primary-foreground" />
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary border-2 border-sidebar-background" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-mono text-base font-bold tracking-tight text-foreground">
                  IRIS<span className="text-primary">.</span>SEC
                </span>
                <span className="text-[9px] font-mono text-muted-foreground tracking-widest uppercase">
                  Cyber Ops v2.4
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {collapsed && (
          <div className="mx-auto relative flex h-8 w-8 items-center justify-center rounded-lg bg-primary glow-primary">
            <Shield className="h-4 w-4 text-primary-foreground" />
            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary border-2 border-sidebar-background" />
          </div>
        )}
      </div>

      {/* ── Live Status Bar ─────────────────────────── */}
      {!collapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative mx-3 mt-3 mb-1 flex items-center gap-2 rounded-md border border-primary/15 bg-primary/5 px-3 py-1.5"
        >
          <Radio className="h-3 w-3 text-primary animate-pulse" />
          <span className="text-[10px] font-mono text-primary tracking-wider">SYSTEM LIVE</span>
          <span className="ml-auto flex gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <span className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-pulse [animation-delay:0.3s]" />
            <span className="h-1.5 w-1.5 rounded-full bg-primary/30 animate-pulse [animation-delay:0.6s]" />
          </span>
        </motion.div>
      )}

      {/* ── Navigation ─────────────────────────────── */}
      <nav className="relative flex-1 overflow-y-auto overflow-x-hidden p-2.5 space-y-0.5 scrollbar-thin">
        {/* Operations section label */}
        {!collapsed && (
          <p className="px-3 pb-1 pt-2 text-[9px] font-mono font-semibold uppercase tracking-[0.15em] text-muted-foreground/50">
            Operations
          </p>
        )}

        {navItems.filter(i => i.section === 'ops').map((item) => {
          const isActive = location.pathname === item.href;
          const badge = (item as any).badgeKey ? badges[(item as any).badgeKey] : undefined;

          return (
            <Link key={item.href} to={item.href}>
              <motion.div
                whileHover={{ x: collapsed ? 0 : 3 }}
                transition={{ duration: 0.15 }}
                className={cn(
                  'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border border-transparent'
                )}
              >
                {/* Active left indicator */}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}

                <item.icon
                  className={cn(
                    'h-4 w-4 shrink-0 transition-colors',
                    isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                  )}
                />

                <AnimatePresence mode="wait">
                  {!collapsed && (
                    <motion.span
                      key="label"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.12 }}
                      className="flex-1 truncate text-sm"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {!collapsed && badge !== undefined && badge > 0 && (
                  <span className={cn(
                    'flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold font-mono',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-primary/15 text-primary'
                  )}>
                    {badge > 9999 ? '9k+' : badge}
                  </span>
                )}

                {collapsed && badge !== undefined && badge > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
                    {badge > 999 ? '1k+' : badge}
                  </span>
                )}
              </motion.div>
            </Link>
          );
        })}

        {/* Intelligence section label */}
        {!collapsed && (
          <p className="px-3 pb-1 pt-3 text-[9px] font-mono font-semibold uppercase tracking-[0.15em] text-muted-foreground/50">
            Intelligence
          </p>
        )}
        {!collapsed && <div className="mx-3 mb-1 h-px bg-border/50" />}

        {navItems.filter(i => i.section === 'intel').map((item) => {
          const isActive = location.pathname === item.href;

          return (
            <Link key={item.href} to={item.href}>
              <motion.div
                whileHover={{ x: collapsed ? 0 : 3 }}
                transition={{ duration: 0.15 }}
                className={cn(
                  'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border border-transparent'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}

                <item.icon
                  className={cn(
                    'h-4 w-4 shrink-0 transition-colors',
                    isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                  )}
                />

                <AnimatePresence mode="wait">
                  {!collapsed && (
                    <motion.span
                      key="label"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.12 }}
                      className="flex-1 truncate text-sm"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* ── Bottom Navigation ──────────────────────── */}
      <div className="relative border-t border-sidebar-border p-2.5 space-y-0.5">
        {bottomNavItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link key={item.href} to={item.href}>
              <motion.div
                whileHover={{ x: collapsed ? 0 : 3 }}
                transition={{ duration: 0.15 }}
                className={cn(
                  'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-150',
                  isActive
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border border-transparent'
                )}
              >
                <item.icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-primary' : 'text-muted-foreground/70 group-hover:text-foreground')} />
                <AnimatePresence mode="wait">
                  {!collapsed && (
                    <motion.span
                      key="label"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.12 }}
                      className="truncate"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          );
        })}

        {/* Collapse Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'w-full mt-2 text-muted-foreground/60 hover:text-foreground border border-transparent hover:border-border/50 transition-all',
            collapsed ? 'justify-center px-0' : 'justify-start gap-2'
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span className="text-xs">Collapse</span>
            </>
          )}
        </Button>
      </div>
    </motion.aside>
  );
}
