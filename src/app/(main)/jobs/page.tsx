import { orpc } from "@/lib/orpc";

import { ListJobsSection } from "@/components/jobs/list-jobs-page";
import { getQueryClient, HydrateClient } from "@/lib/query/hydration";

export default function JobsPage() {
  const queryClient = getQueryClient();

  queryClient.prefetchQuery(orpc.jobs.get.queryOptions());

  return (
    <div className="space-y-8 mt-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">Jobs</h1>
        <p className="text-xl text-muted-foreground mt-2">
          Discover your next opportunity
        </p>
      </div>
      <HydrateClient client={queryClient}>
        <ListJobsSection />
      </HydrateClient>
    </div>
  );
}
