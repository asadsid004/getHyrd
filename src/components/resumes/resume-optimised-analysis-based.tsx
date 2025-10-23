"use client";

import { Resume } from "@/router/onboarding/schema";
import { Button } from "../ui/button";
import { useForm } from "@tanstack/react-form";
import { aiAnalyzeSchema } from "@/service/resume/analyse";
import { z } from "zod";
import { orpc } from "@/lib/orpc";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { Separator } from "../ui/separator";
import { Spinner } from "../ui/spinner";

export const ResumeOptimisedAnalysisBased = ({
  resumeId,
  resumeData,
  AnalysisData,
}: {
  resumeId: string;
  resumeData: Resume | null;
  AnalysisData: z.infer<typeof aiAnalyzeSchema>;
}) => {
  const optimiseAnalysisBasedMutation = useMutation(
    orpc.resumes.optimizeAnalysisBased.mutationOptions({
      onSuccess: () => {
        toast.success("Resume optimised successfully");
      },
    })
  );

  const form = useForm({
    onSubmit: async () => {
      optimiseAnalysisBasedMutation.mutate({
        resumeId,
        resumeData: resumeData!,
        analysisData: AnalysisData,
      });
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">
          Optimise resume based on analysis:
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
