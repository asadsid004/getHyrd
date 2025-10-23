import { orpc } from "@/lib/orpc";

import { ListJobsSection } from "@/components/jobs/list-jobs-page";
import { getQueryClient, HydrateClient } from "@/lib/query/hydration";
import { JobSearchForm } from "@/components/jobs/job-search-form";

export default function JobsPage() {
  const queryClient = getQueryClient();

  queryClient.prefetchQuery(orpc.jobs.get.queryOptions());

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
      <HydrateClient client={queryClient}>
        <ListJobsSection />
      </HydrateClient>
    </div>
  );
}
