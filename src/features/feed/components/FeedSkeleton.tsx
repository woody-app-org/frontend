import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface FeedSkeletonProps {
  count?: number;
  className?: string;
}

export function FeedSkeleton({ count = 3, className }: FeedSkeletonProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <Card
          key={i}
          className="border-[var(--woody-accent)]/20 bg-[var(--woody-card)]"
        >
          <CardHeader className="flex flex-row items-start gap-3 px-4 py-3">
            <Skeleton className="size-9 rounded-full shrink-0 bg-[var(--woody-nav)]/10" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32 bg-[var(--woody-nav)]/10" />
              <Skeleton className="h-3 w-24 bg-[var(--woody-nav)]/10" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pt-0 pb-4 space-y-2">
            <Skeleton className="h-4 w-full bg-[var(--woody-nav)]/10" />
            <Skeleton className="h-4 w-4/5 bg-[var(--woody-nav)]/10" />
            <Skeleton className="h-40 w-full rounded-lg mt-2 bg-[var(--woody-nav)]/10" />
            <div className="flex gap-4 pt-2">
              <Skeleton className="h-4 w-12 bg-[var(--woody-nav)]/10" />
              <Skeleton className="h-4 w-12 bg-[var(--woody-nav)]/10" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
