'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline';
  size?: 'sm' | 'default' | 'lg' | 'icon' | 'icon-sm';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'default', isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:opacity-45 disabled:cursor-not-allowed';
    
    const variants = {
      primary: 'bg-brand text-bg font-semibold hover:brightness-110 active:brightness-90',
      secondary: 'bg-bg-elevated border border-border text-text hover:bg-bg-hover',
      ghost: 'bg-transparent text-text-muted hover:bg-bg-elevated hover:text-text',
      destructive: 'bg-error-muted border border-error text-error hover:bg-error hover:text-bg',
      outline: 'border border-border bg-transparent hover:bg-bg-elevated',
    };
    
    const sizes = {
      sm: 'px-3 py-1.5 text-xs rounded-md',
      default: 'px-4 py-2 text-sm rounded-md',
      lg: 'px-6 py-3 text-base rounded-lg',
      icon: 'p-2 rounded-md',
      'icon-sm': 'p-1.5 rounded-md',
    };
    
    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], 'flex items-center justify-center')}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export const ButtonGroup = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('inline-flex items-center gap-2', className)} {...props}>
    {children}
  </div>
);