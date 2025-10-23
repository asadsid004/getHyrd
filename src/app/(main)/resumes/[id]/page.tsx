import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getQueryClient, HydrateClient } from "@/lib/query/hydration";
import { orpc } from "@/lib/orpc";
import { ResumeContentForm } from "@/components/resumes/resume-content-form";
import { ButtonGroup } from "@/components/ui/button-group";
import { Button } from "@/components/ui/button";
import { ResumeAnalyseTextForm } from "@/components/resumes/resume-analyse-text-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ResumeContentPage({ params }: PageProps) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  const queryClient = getQueryClient();

  // Prefetch resume data
  await queryClient.prefetchQuery(
    orpc.resumes.getOne.queryOptions({ input: { id } })
  );

  // Prefetch analyses data
  await queryClient.prefetchQuery(
    orpc.resumes.getAnalyses.queryOptions({ input: { id } })
  );

  const resume = queryClient.getQueryData(
    orpc.resumes.getOne.queryOptions({ input: { id } }).queryKey
  );

  if (!resume) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Resume</h1>
          <p className="text-muted-foreground">
            Update your resume information and content
          </p>
        </div>
        <ButtonGroup>
          <ResumeAnalyseTextForm id={id} />
          <Button variant="outline">Optimize</Button>
        </ButtonGroup>
      </div>

      <HydrateClient client={queryClient}>
        <Suspense fallback={<div>Loading...</div>}>
          <ResumeContentForm resumeId={id} initialData={resume} />
        </Suspense>
      </HydrateClient>
    </div>
  );
}
