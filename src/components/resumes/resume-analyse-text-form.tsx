"use client";

import { useForm } from "@tanstack/react-form";
import { Button } from "../ui/button";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from "../ui/revola";
import { z } from "zod";
import { Input } from "../ui/input";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLegend,
} from "../ui/field";
import { Textarea } from "../ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import { toast } from "sonner";
import { Spinner } from "../ui/spinner";
import { useRouter } from "next/navigation";

export const ResumeAnalyseTextForm = ({ id }: { id: string }) => {
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      role: "",
      description: "",
    },
    validators: {
      onChange: z.object({
        role: z.string().min(1, "Role is required"),
        description: z.string().min(1, "Description is required"),
      }),
    },
    onSubmit: async ({ value }) => {
      const resumeId = id as string;

      console.log("Resume ID: " + resumeId);

      if (!value.role || !value.description) {
        toast.error("Please fill in all fields");
        return;
      }

      analyseMutation.mutate({
        resumeId,
        role: value.role,
        description: value.description,
      });
    },
  });

  const analyseMutation = useMutation(
    orpc.resumes.analyseText.mutationOptions({
      onSuccess: () => {
        toast.success("Resume analysed successfully");
        router.refresh();
      },
      onError: (error) => {
        toast.error("Error analysing resume: " + error.cause);
      },
    })
  );

  return (
    <ResponsiveDialog>
      <ResponsiveDialogTrigger asChild>
        <Button variant="outline">Analyze</Button>
      </ResponsiveDialogTrigger>
      <ResponsiveDialogContent className="sm:max-w-sm">
        <div className="overflow-y-auto p-6">
          <ResponsiveDialogHeader className="sm:text-center">
            <ResponsiveDialogTitle>Resume Analyse</ResponsiveDialogTitle>
            <ResponsiveDialogDescription>
              Analyze your resume
            </ResponsiveDialogDescription>
          </ResponsiveDialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <form.Field name="role">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid} className="mb-4">
                    <FieldLegend className="-mb-1">Role</FieldLegend>
                    <FieldDescription className="mb-0">
                      The role you want to analyse for
                    </FieldDescription>
                    <FieldContent>
                      <Input
                        className=""
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    </FieldContent>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>
            <form.Field name="description">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLegend className="-mb-1">Job Description</FieldLegend>
                    <FieldDescription>
                      A description of your role
                    </FieldDescription>
                    <FieldContent>
                      <Textarea
                        className="mb-4"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </FieldContent>
                  </Field>
                );
              }}
            </form.Field>
            <Button
              type="submit"
              className="mt-4"
              disabled={analyseMutation.isPending}
            >
              {analyseMutation.isPending ? (
                <>
                  <Spinner />
                  Analyzing...
                </>
              ) : (
                "Analyze"
              )}
            </Button>
          </form>
        </div>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
};
