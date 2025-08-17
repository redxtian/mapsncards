import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  className?: string;
  children?: React.ReactNode;
}

export function LoadingSkeleton({ className, children }: LoadingSkeletonProps) {
  return (
    <div className={cn('animate-pulse bg-gray-200 rounded', className)}>
      {children}
    </div>
  );
}

// Pre-built skeleton components for common use cases
export function CardSkeleton() {
  return (
    <div className="border rounded-lg p-4 space-y-4">
      <LoadingSkeleton className="h-4 w-3/4" />
      <LoadingSkeleton className="h-3 w-1/2" />
      <div className="space-y-2">
        <LoadingSkeleton className="h-3 w-full" />
        <LoadingSkeleton className="h-3 w-4/5" />
      </div>
    </div>
  );
}

export function MapListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}