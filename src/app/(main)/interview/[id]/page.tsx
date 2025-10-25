import { InterviewAttempt } from "@/components/interview/interview-attempt";
import { getQueryClient, HydrateClient } from "@/lib/query/hydration";
import { orpc } from "@/lib/orpc";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function InterviewAttemptPage({ params }: PageProps) {
  const { id } = await params;
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(
    orpc.interview.getOne.queryOptions({ input: { id } })
  );

  await queryClient.prefetchQuery(
    orpc.interview.getReport.queryOptions({ input: { interviewId: id } })
  );

  return (
    <HydrateClient client={queryClient}>
      <InterviewAttempt id={id} />
    </HydrateClient>
  );
}
