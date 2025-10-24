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

export const CoverLetterAnalyseForm = () => {
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      role: "",
      description: "",
      coverLetter: null as File | null,
    },
    validators: {
      onChange: z.object({
        role: z.string().min(1, "Role is required"),
        description: z.string().min(1, "Description is required"),
        coverLetter: z.instanceof(File, {
          message: "Cover letter is required",
        }),
      }),
      onSubmit: async ({ value }) => {
        if (!value.coverLetter) {
          toast.error("Please upload a cover letter");
          return;
        }

        const file = value.coverLetter;
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
          coverLetterData: base64,
        };

        analyseMutation.mutate(input);
      },
    },
  });

  const analyseMutation = useMutation(
    orpc.coverLetters.analyse.mutationOptions({
      onSuccess: (data) => {
        toast.success("Cover letter analysed successfully");
        router.push(`/cover-letters/${data.id}`);
      },
      onError: (error) => {
        toast.error("Error analysing cover letter: " + error.cause);
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
            <ResponsiveDialogTitle>Cover Letter Analyse</ResponsiveDialogTitle>
            <ResponsiveDialogDescription>
              Analyze your cover letter
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
            <form.Field name="coverLetter">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLegend>Cover Letter</FieldLegend>
                    <FileUpload
                      aria-invalid={isInvalid}
                      onFileChange={(file) => {
                        field.handleChange(file);
                      }}
                      value={field.state.value}
                      label="Upload your cover letter here"
                      description="Drag and drop or click to browse"
                      allowedTypes={["application/pdf"]}
                      maxSizeMB={10}
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
              disabled={analyseMutation.isPending}
            >
              {analyseMutation.isPending ? (
                <>
                  <Spinner />
                  Analyzing...
                </>
              ) : (
                "Analyse"
              )}
            </Button>
          </form>
        </div>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
};
