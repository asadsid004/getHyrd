"use client";

import { Button } from "../ui/button";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { orpc } from "@/lib/orpc";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { Separator } from "../ui/separator";
import { Spinner } from "../ui/spinner";
import { CoverLetterData } from "@/components/cover-letters/cover-letter-content-form";
import { aiCoverLetterAnalyzeSchema } from "@/service/cover-letter/analyse";

export const CoverLetterOptimisedAnalysisBased = ({
  coverLetterId,
  coverLetterData,
  AnalysisData,
}: {
  coverLetterId: string;
  coverLetterData:
    | (CoverLetterData & {
        senderEmail: string;
        senderPhone: string;
      })
    | null;
  AnalysisData: z.infer<typeof aiCoverLetterAnalyzeSchema>;
}) => {
  const optimiseAnalysisBasedMutation = useMutation(
    orpc.coverLetters.optimizeAnalysisBased.mutationOptions({
      onSuccess: () => {
        toast.success("Cover letter optimised successfully");
      },
      onError: (error) => {
        toast.error("Error optimising cover letter: " + error.message);
      },
    })
  );

  const form = useForm({
    onSubmit: async () => {
      optimiseAnalysisBasedMutation.mutate({
        coverLetterId,
        coverLetterData: coverLetterData!,
        analysisData: AnalysisData,
      });
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">
          Optimise cover letter based on analysis:
        </h1>
        <form
          id="optimise-analysis-based"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <Button
            type="submit"
            size="sm"
            form="optimise-analysis-based"
            disabled={optimiseAnalysisBasedMutation.isPending}
          >
            {optimiseAnalysisBasedMutation.isPending ? (
              <>
                <Spinner />
                Optimising...
              </>
            ) : (
              "Optimise"
            )}
          </Button>
        </form>
      </div>
      <Separator orientation="horizontal" className="mt-5 bg-foreground/20" />
    </div>
  );
};
