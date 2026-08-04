'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

interface DropdownItem {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  destructive?: boolean;
  divider?: boolean;
}

interface DropdownProps {
  trigger: React.ReactElement;
  items: DropdownItem[];
  align?: 'left' | 'right';
  width?: number | 'trigger';
}

export const Dropdown = ({ trigger, items, align = 'right', width = 240 }: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        triggerRef.current?.contains(e.target as Node) ||
        contentRef.current?.contains(e.target as Node)
      ) return;
      setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mounted]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setIsOpen(false);
  };

  const alignClasses = {
    left: 'origin-top-left left-0',
    right: 'origin-top-right right-0',
  };

  const portalContent = isOpen && (
    <div
      ref={contentRef}
      className={cn(
        'fixed z-50',
        alignClasses[align],
        'transform',
      )}
      style={{ 
        minWidth: width === 'trigger' ? undefined : width,
      }}
    >
      <div 
        className={cn(
          'bg-bg-elevated border border-border rounded-xl shadow-xl overflow-hidden py-1.5',
          'animate-slide-down min-w-[240px]',
        )}
        role="menu" 
      >
        {items.map((item, index) => (
          item.divider ? (
            <hr key={`divider-${index}`} className="my-1.5 border-border" role="separator" />
          ) : (
            <button
              key={index}
              onClick={() => { if (!item.disabled) { item.onClick(); setIsOpen(false); }}}
              disabled={item.disabled}
              className={cn(
                'w-full px-4 py-2.5 text-left text-sm transition-colors duration-150',
                'flex items-center gap-3',
                'disabled:opacity-40 disabled:cursor-not-allowed',
                item.destructive 
                  ? 'text-error hover:bg-error-muted' 
                  : 'text-text hover:bg-bg-hover',
              )}
              role="menuitem"
              tabIndex={-1}
            >
              {item.icon && <span className="flex-shrink-0 w-4 h-4">{item.icon}</span>}
              <span className="flex-1">{item.label}</span>
            </button>
          )
        ))}
      </div>
    </div>
  );

  return (
    <>
      <span ref={triggerRef}>{trigger}</span>
      {mounted && createPortal(portalContent, document.body)}
    </>
  );
};

export const DropdownTrigger = ({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    className={cn(
      'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-text-muted',
      'bg-bg-elevated border border-border rounded-md',
      'hover:bg-bg-hover hover:text-text',
      'transition-colors duration-200',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      className
    )}
    {...props}
  >
    {children}
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  </button>
);