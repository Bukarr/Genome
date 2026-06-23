import React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export function Button({
  children,
  variant = 'secondary',
  size = 'md',
  loading = false,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 ease-out active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none select-none';
  
  const variants = {
    primary: 'bg-accent text-white hover:bg-bright shadow-[0_4px_12px_rgba(99,102,241,0.25)] hover:shadow-[0_4px_20px_rgba(99,102,241,0.4)] border border-transparent font-semibold',
    accent: 'bg-transparent text-accent hover:text-bright border border-accent/30 hover:border-bright/50 hover:bg-accent/5',
    secondary: 'bg-surface hover:bg-card border border-border-accent text-text-main hover:text-bright',
    danger: 'bg-error text-bg hover:opacity-90 shadow-[0_4px_12px_rgba(255,107,107,0.2)] border border-transparent font-medium',
    ghost: 'bg-transparent hover:bg-surface text-muted hover:text-text-main border border-transparent',
  };

  const sizes = {
    sm: 'text-xs px-3.5 py-2 min-h-[38px]',
    md: 'text-sm px-5 py-2.5 min-h-[44px]', // minimum size of 44 for core mobile tap buttons
    lg: 'text-base px-6 py-3 min-h-[50px]',
    icon: 'p-2.5 min-w-[44px] min-h-[44px]',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
