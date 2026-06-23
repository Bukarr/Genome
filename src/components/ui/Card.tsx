import React from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export function Card({ children, glow = false, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border bg-card/45 backdrop-blur-md p-5 transition-all duration-200 ease-out',
        glow
          ? 'border-accent/35 shadow-[0_0_15px_rgba(99,102,241,0.15)] bg-card/75'
          : 'border-border-accent hover:border-accent/20 hover:bg-card/65',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
