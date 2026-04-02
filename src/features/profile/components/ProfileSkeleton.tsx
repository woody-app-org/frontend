import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const styles = {
  card: "rounded-2xl border border-[var(--woody-accent)]/20 bg-[var(--woody-card)] shadow-[0_1px_3px_rgba(92,58,59,0.06)]",
  skeleton: "bg-[var(--woody-nav)]/10",
};

export function ProfileSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-4 md:space-y-6", className)}>
      <Card className={styles.card}>
        <Skeleton className={cn("h-40 md:h-56 w-full rounded-t-2xl rounded-b-none", styles.skeleton)} />
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <Skeleton className={cn("size-20 md:size-24 rounded-full -mt-12 shrink-0 border-4 border-[var(--woody-card)]", styles.skeleton)} />
            <div className="flex-1 min-w-0 space-y-2">
              <Skeleton className={cn("h-6 w-48", styles.skeleton)} />
              <Skeleton className={cn("h-4 w-32", styles.skeleton)} />
              <div className="flex gap-2 flex-wrap">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className={cn("h-6 w-14 rounded-md", styles.skeleton)} />
                ))}
              </div>
            </div>
            <Skeleton className={cn("h-9 w-24 rounded-md shrink-0", styles.skeleton)} />
          </div>
          <div className="mt-4 space-y-2">
            <Skeleton className={cn("h-4 w-full", styles.skeleton)} />
            <Skeleton className={cn("h-4 w-4/5", styles.skeleton)} />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-6">
        <div className="space-y-4">
          <Card className={styles.card}>
            <CardHeader className="pb-2">
              <Skeleton className={cn("h-5 w-24", styles.skeleton)} />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className={cn("h-4 w-full", styles.skeleton)} />
              <Skeleton className={cn("h-4 w-full", styles.skeleton)} />
              <Skeleton className={cn("h-4 w-3/4", styles.skeleton)} />
            </CardContent>
          </Card>
          <Card className={styles.card}>
            <CardHeader className="pb-2">
              <Skeleton className={cn("h-5 w-32", styles.skeleton)} />
              <Skeleton className={cn("h-3 w-full max-w-md mt-2", styles.skeleton)} />
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className={cn("h-[4.5rem] w-full rounded-xl", styles.skeleton)} />
              ))}
            </CardContent>
          </Card>
          <div className="space-y-4">
            <Skeleton className={cn("h-5 w-28", styles.skeleton)} />
            {[1, 2].map((i) => (
              <Card key={i} className={styles.card}>
                <CardHeader className="flex flex-row items-start gap-3 px-4 py-3">
                  <Skeleton className={cn("size-9 rounded-full shrink-0", styles.skeleton)} />
                  <div className="flex-1 space-y-2">
                    <Skeleton className={cn("h-4 w-32", styles.skeleton)} />
                    <Skeleton className={cn("h-3 w-24", styles.skeleton)} />
                  </div>
                </CardHeader>
                <CardContent className="px-4 pt-0 pb-4 space-y-2">
                  <Skeleton className={cn("h-4 w-full", styles.skeleton)} />
                  <Skeleton className={cn("h-24 w-full rounded-lg", styles.skeleton)} />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <aside className="hidden md:block space-y-4">
          <Card className={styles.card}>
            <CardHeader className="pb-2">
              <Skeleton className={cn("h-5 w-28", styles.skeleton)} />
            </CardHeader>
            <CardContent className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className={cn("h-8 w-full rounded-md", styles.skeleton)} />
              ))}
            </CardContent>
          </Card>
          <Card className={styles.card}>
            <CardHeader className="pb-2">
              <Skeleton className={cn("h-5 w-36", styles.skeleton)} />
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className={cn("h-7 w-16 rounded-md", styles.skeleton)} />
                ))}
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
