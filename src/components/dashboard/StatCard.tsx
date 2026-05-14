import { memo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'danger' | 'warning' | 'info';
  className?: string;
  onClick?: () => void;
}

const variantConfig = {
  default: {
    border:    'border-border hover:border-primary/30',
    bg:        'bg-card',
    glowBg:    'bg-primary/10',
    iconBg:    'bg-primary/10',
    iconColor: 'text-primary',
    glow:      'hsl(152 100% 48% / 0.06)',
  },
  primary: {
    border:    'border-primary/20 hover:border-primary/40',
    bg:        'bg-primary/5',
    glowBg:    'bg-primary/15',
    iconBg:    'bg-primary/20',
    iconColor: 'text-primary',
    glow:      'hsl(152 100% 48% / 0.10)',
  },
  danger: {
    border:    'border-severity-critical/20 hover:border-severity-critical/40',
    bg:        'bg-card',
    glowBg:    'bg-severity-critical/10',
    iconBg:    'bg-severity-critical/15',
    iconColor: 'text-severity-critical',
    glow:      'hsl(0 80% 58% / 0.08)',
  },
  warning: {
    border:    'border-severity-high/20 hover:border-severity-high/40',
    bg:        'bg-card',
    glowBg:    'bg-severity-high/10',
    iconBg:    'bg-severity-high/15',
    iconColor: 'text-severity-high',
    glow:      'hsl(25 92% 52% / 0.08)',
  },
  info: {
    border:    'border-severity-low/20 hover:border-severity-low/40',
    bg:        'bg-card',
    glowBg:    'bg-severity-low/10',
    iconBg:    'bg-severity-low/15',
    iconColor: 'text-severity-low',
    glow:      'hsl(208 96% 54% / 0.08)',
  },
} as const;

export const StatCard = memo(function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
  className,
  onClick,
}: StatCardProps) {
  const cfg = variantConfig[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      whileHover={onClick ? { y: -2, transition: { duration: 0.15 } } : undefined}
      onClick={onClick}
      className={cn(
        'relative overflow-hidden rounded-xl border p-5 transition-all duration-200',
        cfg.border,
        cfg.bg,
        onClick && 'cursor-pointer',
        className
      )}
      style={{
        boxShadow: `inset 0 1px 0 hsl(210 30% 94% / 0.04), 0 0 0 0 ${cfg.glow}`,
      }}
    >
      {/* Corner ambient glow */}
      <div
        className={cn('absolute -right-6 -top-6 h-20 w-20 rounded-full blur-2xl opacity-40', cfg.glowBg)}
      />

      {/* Bottom-left faint grid lines */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px opacity-30"
        style={{ background: `linear-gradient(90deg, transparent, ${cfg.glow}, transparent)` }}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1.5">
          {/* Label */}
          <p className="text-[10px] font-mono font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {title}
          </p>

          {/* Value */}
          <p className={cn(
            'font-mono text-2xl font-bold tracking-tight leading-none',
            variant === 'danger'  ? 'text-severity-critical' :
            variant === 'warning' ? 'text-severity-high' :
            variant === 'info'    ? 'text-severity-low' :
            'text-foreground'
          )}>
            {value}
          </p>

          {/* Subtitle */}
          {subtitle && (
            <p className="text-xs text-muted-foreground leading-tight">{subtitle}</p>
          )}

          {/* Trend */}
          {trend && (
            <div className={cn(
              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold',
              trend.isPositive
                ? 'bg-status-resolved/10 text-status-resolved'
                : 'bg-severity-critical/10 text-severity-critical'
            )}>
              {trend.isPositive
                ? <TrendingUp className="h-2.5 w-2.5" />
                : <TrendingDown className="h-2.5 w-2.5" />}
              {Math.abs(trend.value)}% vs last period
            </div>
          )}
        </div>

        {/* Icon badge */}
        <div className={cn(
          'flex-shrink-0 rounded-lg p-2.5 border border-white/5',
          cfg.iconBg
        )}>
          <Icon className={cn('h-5 w-5', cfg.iconColor)} />
        </div>
      </div>

      {/* Click hint */}
      {onClick && (
        <div className="absolute bottom-2 right-3 text-[9px] font-mono text-muted-foreground/40 uppercase tracking-wide">
          tap for detail
        </div>
      )}
    </motion.div>
  );
});