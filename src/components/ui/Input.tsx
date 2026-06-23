import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  children?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          'flex w-full rounded-xl border border-border-accent bg-surface px-4 py-3 text-sm text-text-main placeholder-muted transition-all duration-200 ease-out focus:border-accent/60 focus:ring-1 focus:ring-accent/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 min-h-[44px]',
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  children?: React.ReactNode;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'flex min-h-[80px] w-full rounded-xl border border-border-accent bg-surface px-4 py-3 text-sm text-text-main placeholder-muted transition-all duration-200 ease-out focus:border-accent/60 focus:ring-1 focus:ring-accent/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 leading-relaxed',
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';
