import React from 'react';
import { cn } from '../../lib/utils';

export interface ChipProps extends React.HTMLAttributes<HTMLDivElement> {
  active?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export function Chip({ children, active = false, className, ...props }: ChipProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium border cursor-pointer select-none transition-all duration-200 active:scale-95',
        active
          ? 'bg-accent/10 border-accent text-accent shadow-[0_0_10px_rgba(99,102,241,0.15)]'
          : 'bg-surface border-border-accent text-muted hover:text-text-main hover:border-accent/40',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
