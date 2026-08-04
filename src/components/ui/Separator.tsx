'use client';

import { cn } from '@/lib/utils';

interface SeparatorProps extends React.HTMLAttributes<HTMLHRElement> {
  orientation?: 'horizontal' | 'vertical';
  decorative?: boolean;
}

export const Separator = ({ className, orientation = 'horizontal', decorative = true, ...props }: SeparatorProps) => (
  <hr
    aria-orientation={orientation}
    role={decorative ? 'none' : 'separator'}
    className={cn(
      'bg-border',
      orientation === 'horizontal' ? 'w-full h-px' : 'h-full w-px',
      className
    )}
    {...props}
  />
);

export const SectionDivider = ({ className, children }: { className?: string; children?: React.ReactNode }) => (
  <div className={`flex items-center gap-4 ${className}`}>
    <Separator className="flex-1" />
    {children && <span className="px-3 text-xs text-text-subtle uppercase tracking-wider font-medium">{children}</span>}
    <Separator className="flex-1" />
  </div>
);

export const VerticalDivider = ({ className, height = 'full' }: { className?: string; height?: string }) => (
  <Separator orientation="vertical" className={cn(`h-${height}`, className)} />
);