'use client';

import { useState, Children } from 'react';
import { cn } from '@/lib/utils';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: 'xs' | 'sm' | 'default' | 'lg' | 'xl';
  shape?: 'circle' | 'square';
}

export const Avatar = ({ 
  src, 
  alt, 
  fallback, 
  size = 'default', 
  shape = 'circle', 
  className, 
  ...props 
}: AvatarProps) => {
  const sizes = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-[11px]',
    default: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };
  
  const shapes = {
    circle: 'rounded-full',
    square: 'rounded-lg',
  };
  
  const [imgError, setImgError] = useState(false);
  
  const initials = fallback || alt?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  
  return (
    <div
      className={cn(
        'inline-flex items-center justify-center overflow-hidden bg-brand-muted',
        'font-medium text-brand font-display select-none',
        sizes[size],
        shapes[shape],
        'bg-brand-muted text-brand',
        className
      )}
    >
      {src && !imgError ? (
        <img 
          src={src} 
          alt={alt || ''} 
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <span className="font-medium font-display">{initials}</span>
      )}
    </div>
  );
};

export const AvatarGroup = ({ 
  children, 
  max = 5, 
  className, 
  ...props 
}: { 
  children: React.ReactNode; 
  max?: number; 
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) => {
  const childrenArray = Children.toArray(children);
  const visible = childrenArray.slice(0, max);
  const remaining = childrenArray.length - max;
  
  return (
    <div className={cn('flex -space-x-2', className)} {...props}>
      {visible.map((child, index) => (
        <div key={index} className="relative z-[calc(100-_index)]">
          {child}
        </div>
      ))}
      {remaining > 0 && (
        <div className={cn(
          'inline-flex items-center justify-center border-2 border-bg',
          'bg-bg-elevated text-text-muted font-medium',
          'rounded-full',
        )}>
          +{remaining}
        </div>
      )}
    </div>
  );
};