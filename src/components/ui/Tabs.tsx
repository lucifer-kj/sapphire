'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface TabItem {
  value: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  badge?: string | number;
}

interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  variant?: 'default' | 'pills' | 'underline';
  fullWidth?: boolean;
}

export const Tabs = ({
  items,
  value,
  onChange,
  className,
  variant = 'default',
  fullWidth = false,
}: TabsProps) => {
  const [activeIndex, setActiveIndex] = useState(items.findIndex(t => t.value === value));

  useEffect(() => {
    const newIndex = items.findIndex(t => t.value === value);
    setActiveIndex(newIndex >= 0 ? newIndex : 0);
  }, [value, items]);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let newIndex = activeIndex;
    if (e.key === 'ArrowRight') newIndex = (activeIndex + 1) % items.length;
    else if (e.key === 'ArrowLeft') newIndex = (activeIndex - 1 + items.length) % items.length;
    else if (e.key === 'Home') newIndex = 0;
    else if (e.key === 'End') newIndex = items.length - 1;
    else return;

    if (items[newIndex].disabled) return;
    e.preventDefault();
    onChange(items[newIndex].value);
  };

  const containerVariants = {
    default: 'bg-bg-elevated rounded-xl p-1',
    pills: 'bg-bg-elevated rounded-xl p-1',
    underline: 'border-b border-border',
  };

  const tabVariants = {
    default: 'data-[state=active]:bg-brand data-[state=active]:text-bg data-[state=active]:shadow-md',
    pills: 'data-[state=active]:bg-brand data-[state=active]:text-bg data-[state=active]:shadow-md',
    underline: 'data-[state=active]:text-brand data-[state=active]:border-b-2 data-[state=active]:border-brand',
  };

  return (
    <div className={cn('relative', containerVariants[variant], className)} role="tablist" aria-orientation="horizontal">
      {items.map((item, index) => (
        <button
          key={item.value}
          role="tab"
          aria-selected={value === item.value}
          aria-disabled={item.disabled}
          aria-controls={`panel-${item.value}`}
          id={`tab-${item.value}`}
          tabIndex={value === item.value ? 0 : -1}
          disabled={item.disabled}
          onClick={() => !item.disabled && onChange(item.value)}
          onKeyDown={e => handleKeyDown(e, index)}
          className={cn(
            'relative flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium',
            'transition-all duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            item.badge && 'pr-6',
            tabVariants[variant],
            fullWidth && 'flex-1',
          )}
          data-state={value === item.value ? 'active' : 'inactive'}
          data-disabled={item.disabled}
        >
          {item.icon && <span className="flex-shrink-0 w-4 h-4">{item.icon}</span>}
          <span>{item.label}</span>
          {item.badge && (
            <span className="absolute -right-1 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-brand-muted text-brand">
              {item.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

export const TabPanel = ({ value, children, className }: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    role="tabpanel"
    className={cn('mt-4', className)}
  >
    {children}
  </div>
);
