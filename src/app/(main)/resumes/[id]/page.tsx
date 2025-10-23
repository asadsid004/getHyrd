import { notFound } from "next/navigation";
import { getQueryClient, HydrateClient } from "@/lib/query/hydration";
import { orpc } from "@/lib/orpc";
import { ResumeContentForm } from "@/components/resumes/resume-content-form";
import { ButtonGroup } from "@/components/ui/button-group";
import { ResumeAnalyseTextForm } from "@/components/resumes/resume-analyse-text-form";
import { ResumeOptimizeTextForm } from "@/components/resumes/resume-optmize-text-form";

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
          <ResumeOptimizeTextForm resumeId={id} />
        </ButtonGroup>
      </div>

      <HydrateClient client={queryClient}>
        <ResumeContentForm resumeId={id} initialData={resume} />
      </HydrateClient>
    </div>
  );
}
