import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'accent' | 'warning' | 'error' | 'muted';
  children?: React.ReactNode;
  className?: string;
}

export function Badge({ children, variant = 'default', className, ...props }: BadgeProps) {
  const styles = {
    default: 'bg-surface border border-border-accent text-text-main font-mono text-xs px-2.5 py-0.5 rounded-full',
    accent: 'bg-accent/10 border border-accent/35 text-accent font-mono text-xs px-2.5 py-0.5 rounded-full',
    warning: 'bg-warning/10 border border-warning/35 text-warning font-mono text-xs px-2.5 py-0.5 rounded-full',
    error: 'bg-error/10 border border-error/35 text-error font-mono text-xs px-2.5 py-0.5 rounded-full',
    muted: 'bg-surface border border-border-accent/50 text-muted font-mono text-xs px-2.5 py-0.5 rounded-full',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center select-none font-medium',
        styles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
