import { CreateInterviewForm } from "@/components/interview/create-interview-form";
import { InterviewList } from "@/components/interview/interview-list";
import { getQueryClient, HydrateClient } from "@/lib/query/hydration";
import { orpc } from "@/lib/orpc";

export default async function InterviewPage() {
  const queryClient = getQueryClient();

  // Prefetch interviews data
  await queryClient.prefetchQuery(orpc.interview.get.queryOptions());

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mt-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">
            Interview Readiness
          </h1>
          <p className="text-xl text-muted-foreground">
            Prepare for your next interview with our AI-powered interview
            simulator.
          </p>
        </div>
        <div>
          <CreateInterviewForm />
        </div>
      </div>

      {/* Interviews List */}
      <HydrateClient client={queryClient}>
        <InterviewList />
      </HydrateClient>
    </div>
  );
}
