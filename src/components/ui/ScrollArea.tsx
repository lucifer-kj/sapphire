'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: 'always' | 'hover' | 'scroll' | 'auto';
}

export const ScrollArea = ({
  className,
  children,
  type = 'auto',
  ...props
}: ScrollAreaProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div
      ref={containerRef}
      className={cn('relative h-full w-full overflow-y-auto', className)}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      {...props}
    >
      {children}
    </div>
  );
};
