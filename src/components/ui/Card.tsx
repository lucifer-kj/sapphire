'use client';

import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'interactive' | 'bordered';
  padding?: 'none' | 'sm' | 'default' | 'lg';
}

export const Card = ({
  className,
  variant = 'default',
  padding = 'default',
  children,
  ...props
}: CardProps) => {
  const variants = {
    default: 'bg-bg-elevated border border-border',
    elevated: 'bg-bg-elevated border border-border shadow-md',
    interactive: 'bg-bg-elevated border border-border cursor-pointer transition-all duration-200 hover:border-brand',
    bordered: 'bg-bg border-border',
  };

  const paddings = {
    none: '',
    sm: 'p-3',
    default: 'p-5',
    lg: 'p-7',
  };

  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-bg-elevated transition-all duration-200',
        variants[variant],
        paddings[padding],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('mb-4', className)} {...props}>{children}</div>
);

export const CardTitle = ({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn('font-display text-lg font-semibold text-text', className)} {...props}>{children}</h3>
);

export const CardDescription = ({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn('text-text-muted text-sm mt-1', className)} {...props}>{children}</p>
);

export const CardContent = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('', className)} {...props}>{children}</div>
);

export const CardFooter = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('mt-4 flex items-center gap-2', className)} {...props}>{children}</div>
);

export const CardDivider = ({ className }: { className?: string }) => (
  <hr className={cn('border-border my-4', className)} />
);
