import { CoverLettersList } from "@/components/cover-letters/cover-letters-list";
import { getQueryClient, HydrateClient } from "@/lib/query/hydration";
import { orpc } from "@/lib/orpc";
import { ButtonGroup } from "@/components/ui/button-group";
import { CoverLetterCreateForm } from "@/components/cover-letters/cover-letter-create-form";
import { CoverLetterAnalyseForm } from "@/components/cover-letters/cover-letter-analyse-form";
import { CoverLetterOptimizeForm } from "@/components/cover-letters/cover-letter-optimise-form";

export default async function CoverLetterPage() {
  const queryClient = getQueryClient();

  // Prefetch cover letters data
  await queryClient.prefetchQuery(orpc.coverLetters.get.queryOptions());

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between mt-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Cover Letters</h1>
          <p className="text-xl text-muted-foreground">
            Manage your cover letters
          </p>
        </div>
        <ButtonGroup aria-label="Cover letter actions">
          <CoverLetterAnalyseForm />
          <CoverLetterOptimizeForm />
          <CoverLetterCreateForm />
        </ButtonGroup>
      </div>

      {/* Cover Letters List */}
      <HydrateClient client={queryClient}>
        <CoverLettersList />
      </HydrateClient>
    </div>
  );
}
