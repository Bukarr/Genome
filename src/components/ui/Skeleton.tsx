import React from 'react';
import { cn } from '../../lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-xl bg-surface/80 border border-border-accent/40',
        className
      )}
      {...props}
    />
  );
}

export function ContentCardSkeleton() {
  return (
    <div className="border border-border-accent/40 rounded-2xl p-5 bg-card/25 animate-pulse space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-12" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
      <div className="space-y-2 mt-4">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="border-t border-border-accent/30 pt-3 flex justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}

export function SuggestionListSkeleton() {
  return (
    <div className="space-y-4">
      <ContentCardSkeleton />
      <ContentCardSkeleton />
      <ContentCardSkeleton />
    </div>
  );
}

export function TrendCardSkeleton() {
  return (
    <div className="border border-border-accent/40 rounded-2xl p-5 bg-card/25 animate-pulse space-y-3">
      <div className="flex justify-between">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-6 w-14" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <div className="space-y-2 pt-2">
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  );
}
