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
import { FileUpload } from "../file-upload";
import { useMutation } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import { toast } from "sonner";
import { Spinner } from "../ui/spinner";
import { useRouter } from "next/navigation";

export const ResumeOptimizeForm = () => {
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      role: "",
      description: "",
      resume: null as File | null,
    },
    validators: {
      onChange: z.object({
        role: z.string().min(1, "Role is required"),
        description: z.string().min(1, "Description is required"),
        resume: z.instanceof(File, { message: "Resume is required" }),
      }),
      onSubmit: async ({ value }) => {
        if (!value.resume) {
          toast.error("Please upload a resume");
          return;
        }

        const file = value.resume;
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            const commaIndex = result.indexOf(",");
            resolve(commaIndex >= 0 ? result.slice(commaIndex + 1) : result);
          };
          reader.onerror = (e) => reject(e);
          reader.readAsDataURL(file);
        });

        const input = {
          ...value,
          resumeData: base64,
        };

        optimizeMutation.mutate(input);
      },
    },
  });

  const optimizeMutation = useMutation(
    orpc.resumes.optimize.mutationOptions({
      onSuccess: (data) => {
        toast.success("Resume optimized successfully");
        router.push(`/resumes/${data.id}`);
      },
      onError: (error) => {
        toast.error("Error optimizing resume: " + error.cause);
      },
    })
  );

  return (
    <ResponsiveDialog>
      <ResponsiveDialogTrigger asChild>
        <Button variant="outline">Optimize</Button>
      </ResponsiveDialogTrigger>
      <ResponsiveDialogContent className="sm:max-w-sm">
        <div className="overflow-y-auto p-6">
          <ResponsiveDialogHeader className="sm:text-center">
            <ResponsiveDialogTitle>Resume Optimize</ResponsiveDialogTitle>
            <ResponsiveDialogDescription>
              Optimize your resume
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
                      The role you want to optimize for
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
            <form.Field name="resume">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLegend>Resume</FieldLegend>
                    <FileUpload
                      aria-invalid={isInvalid}
                      onFileChange={(file) => {
                        field.handleChange(file);
                      }}
                      value={field.state.value}
                      label="Upload your resume here"
                      description="Drag and drop or click to browse"
                      allowedTypes={["application/pdf"]}
                      maxSizeMB={15}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>

            <Button
              type="submit"
              className="mt-4"
              disabled={optimizeMutation.isPending}
            >
              {optimizeMutation.isPending ? (
                <>
                  <Spinner />
                  Optimizing...
                </>
              ) : (
                "Optimize"
              )}
            </Button>
          </form>
        </div>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
};
