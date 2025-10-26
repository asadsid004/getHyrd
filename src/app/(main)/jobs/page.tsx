import { Suspense } from "react";
import { ListJobsSection } from "@/components/jobs/list-jobs-page";
import { JobSearchForm } from "@/components/jobs/job-search-form";
import { Skeleton } from "@/components/ui/skeleton";

export default function JobsPage() {
  return (
    <div className="space-y-8 mt-6">
      <div className="flex justify-between items-center gap-2">
        <div className="flex flex-col items-start gap-2">
          <h1 className="text-4xl font-bold tracking-tight">Jobs</h1>
          <p className="text-xl text-muted-foreground">
            Discover your next opportunity
          </p>
        </div>
        <JobSearchForm />
      </div>
      <Suspense fallback={<JobsSkeleton />}>
        <ListJobsSection />
      </Suspense>
    </div>
  );
}

function JobsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-4 w-1/2" />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-4 p-4 border rounded-lg">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}
