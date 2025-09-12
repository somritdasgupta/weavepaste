import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted/50 backdrop-blur-sm glass",
        className
      )}
      {...props}
    />
  );
}

function LoadingSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[80%]" />
      </div>
    </div>
  );
}

function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("glass-card p-6 space-y-4", className)}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-[150px]" />
        <Skeleton className="h-6 w-[60px] rounded-full" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[90%]" />
        <Skeleton className="h-4 w-[80%]" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}

function TextAreaSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("glass-card relative overflow-hidden", className)}>
      <div className="absolute top-4 right-4 z-10">
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <div className="p-6 pt-12 space-y-4 min-h-[50vh]">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[95%]" />
        <Skeleton className="h-4 w-[90%]" />
        <Skeleton className="h-4 w-[85%]" />
        <Skeleton className="h-4 w-[80%]" />
        <div className="space-y-4 mt-8">
          <Skeleton className="h-4 w-[70%]" />
          <Skeleton className="h-4 w-[60%]" />
          <Skeleton className="h-4 w-[50%]" />
        </div>
      </div>
    </div>
  );
}

function DeviceListSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-3", className)}>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-3 rounded-lg bg-accent/5 border border-accent/10"
        >
          <Skeleton className="w-4 h-4" />
          <Skeleton className="h-4 flex-1" />
          <div className="flex items-center gap-2">
            <Skeleton className="w-2 h-2 rounded-full" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      ))}
    </div>
  );
}

export {
  Skeleton,
  LoadingSkeleton,
  CardSkeleton,
  TextAreaSkeleton,
  DeviceListSkeleton,
};
