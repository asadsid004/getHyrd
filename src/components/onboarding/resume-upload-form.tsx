"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/file-upload";
import { Sparkles, FileText } from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Spinner } from "../ui/spinner";
import { Field, FieldError, FieldGroup } from "../ui/field";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import { useRouter } from "next/navigation";

export function ResumeUploadForm() {
  const router = useRouter();
  const extractResumeMutation = useMutation(
    orpc.onboarding.extractResume.mutationOptions({
      onSuccess: ({ message }) => {
        toast.success(message);
        router.push("/dashboard");
      },
      onError: (error) => {
        toast.error("Error uploading resume: " + error.cause);
      },
    })
  );

  const form = useForm({
    defaultValues: {
      resume: null as File | null,
    },
    validators: {
      onChange: z.object({
        resume: z.instanceof(File, { message: "Resume is required" }),
      }),
    },
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

      extractResumeMutation.mutate({
        fileName: file.name,
        mimeType: file.type || "application/pdf",
        data: base64,
      });
    },
  });

  return (
    <Card className="max-w-2xl mx-auto m-4 border-border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <FileText className="w-5 h-5 text-primary" />
          Upload Your Resume
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Upload your
          <span className="font-medium text-foreground"> latest resume</span> so
          we can automatically extract your experience, skills, and education to
          improve job matches.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="bg-muted rounded-lg p-4 space-y-3 border border-border">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Sparkles className="w-4 h-4 text-primary" />
            What we&apos;ll extract from your resume
          </div>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-1">
            <li>Work Experience — your career journey and achievements</li>
            <li>Skills & Expertise — technical and soft skills</li>
            <li>Education & Certifications — academic background</li>
            <li>Contact Information — to complete your profile</li>
          </ul>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.Field name="resume">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0;

                return (
                  <Field data-invalid={isInvalid}>
                    <FileUpload
                      aria-invalid={isInvalid}
                      onFileChange={(file) => {
                        field.handleChange(file);
                      }}
                      value={field.state.value}
                      label="Upload your resume here"
                      description="Drag and drop or click to browse"
                      allowedTypes={["application/pdf"]}
                      maxSizeMB={5}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>
          </FieldGroup>

          <div className="bg-accent/30 border border-border rounded-lg p-3 text-sm text-muted-foreground mt-6">
            💡 <span className="font-medium text-foreground">Pro tip:</span>{" "}
            Upload your latest resume with your latest experience to get the
            most relevant job matches.
          </div>

          <div className="flex justify-end mt-6">
            <Button type="submit" disabled={extractResumeMutation.isPending}>
              {extractResumeMutation.isPending ? (
                <>
                  <Spinner />
                  Uploading...
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </div>
        </form>

        <p className="text-xs text-center text-muted-foreground">
          Disclaimer: Your resume is used only for job matching purpose.
        </p>
      </CardContent>
    </Card>
  );
}
