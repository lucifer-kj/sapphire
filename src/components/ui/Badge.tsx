'use client';

import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'brand' | 'neutral';
  size?: 'sm' | 'default' | 'lg';
  dot?: boolean;
}

export const Badge = ({
  className,
  variant = 'default',
  size = 'default',
  dot = false,
  children,
  ...props
}: BadgeProps) => {
  const variants = {
    default: 'bg-neutral-muted text-text-muted',
    success: 'bg-success-muted text-success',
    warning: 'bg-warning-muted text-warning',
    error: 'bg-error-muted text-error',
    info: 'bg-info-muted text-info',
    brand: 'bg-brand-muted text-brand',
    neutral: 'bg-neutral-muted text-text-muted',
  };
  
  const sizes = {
    sm: 'px-2 py-0.5 text-[10px] gap-1',
    default: 'px-2.5 py-1 text-[11px] gap-1.5',
    lg: 'px-3 py-1.5 text-xs gap-2',
  };
  
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" aria-hidden="true" />}
      {children}
    </span>
  );
};

export const StatusBadge = ({ 
  status, 
  className, 
  ...props 
}: { 
  status: 'draft' | 'scheduled' | 'publishing' | 'published' | 'failed' | 'cancelled';
  className?: string;
}) => {
  const statusConfig = {
    draft: { variant: 'neutral' as const, label: 'Draft' },
    scheduled: { variant: 'warning' as const, label: 'Scheduled' },
    publishing: { variant: 'info' as const, label: 'Publishing' },
    published: { variant: 'success' as const, label: 'Published' },
    failed: { variant: 'error' as const, label: 'Failed' },
    cancelled: { variant: 'neutral' as const, label: 'Cancelled' },
  };
  
  const config = statusConfig[status];
  
  return (
    <Badge variant={config.variant} size="sm" className={className} {...props}>
      {config.label}
    </Badge>
  );
};