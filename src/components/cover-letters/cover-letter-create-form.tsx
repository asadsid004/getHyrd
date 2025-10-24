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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import { toast } from "sonner";
import { Spinner } from "../ui/spinner";
import { useRouter } from "next/navigation";
import { PlusIcon } from "lucide-react";

export const CoverLetterCreateForm = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const form = useForm({
    defaultValues: {
      title: "",
      recipientCompany: "",
      recipientPosition: "",
      recipientName: "",
      jobDescription: "",
    },
    validators: {
      onChange: z.object({
        title: z.string().min(1, "Title is required"),
        recipientCompany: z.string(),
        recipientPosition: z.string(),
        recipientName: z.string(),
        jobDescription: z.string(),
      }),
      onSubmit: async ({ value }) => {
        const input = {
          title: value.title,
          recipientCompany: value.recipientCompany,
          recipientPosition: value.recipientPosition,
          recipientName: value.recipientName,
          jobDescription: value.jobDescription,
        };

        createMutation.mutate(input);
      },
    },
  });

  const createMutation = useMutation(
    orpc.coverLetters.create.mutationOptions({
      onSuccess: ({ id }) => {
        toast.success("Cover letter created successfully");
        queryClient.invalidateQueries({
          queryKey: orpc.coverLetters.get.queryKey(),
        });
        router.push(`/cover-letter/${id}`);
      },
      onError: (error) => {
        toast.error("Error creating cover letter: " + error.cause);
      },
    })
  );

  return (
    <ResponsiveDialog>
      <ResponsiveDialogTrigger asChild>
        <Button variant="outline">
          Create <PlusIcon className="h-4 w-4 ml-2" />
        </Button>
      </ResponsiveDialogTrigger>
      <ResponsiveDialogContent className="sm:max-w-lg">
        <div className="overflow-y-auto p-6">
          <ResponsiveDialogHeader className="sm:text-center">
            <ResponsiveDialogTitle>Create Cover Letter</ResponsiveDialogTitle>
            <ResponsiveDialogDescription>
              Create a new cover letter
            </ResponsiveDialogDescription>
          </ResponsiveDialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <form.Field name="title">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid} className="mb-4">
                    <FieldLegend className="-mb-1">Title</FieldLegend>
                    <FieldDescription className="mb-0">
                      A title for your cover letter
                    </FieldDescription>
                    <FieldContent>
                      <Input
                        className=""
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="e.g., Software Engineer at Tech Corp"
                      />
                    </FieldContent>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="recipientCompany">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid} className="mb-4">
                    <FieldLegend className="-mb-1">Company</FieldLegend>
                    <FieldDescription className="mb-0">
                      The company you&apos;re applying to
                    </FieldDescription>
                    <FieldContent>
                      <Input
                        className=""
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="e.g., Google Inc."
                      />
                    </FieldContent>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="recipientPosition">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid} className="mb-4">
                    <FieldLegend className="-mb-1">
                      Recipient Position
                    </FieldLegend>
                    <FieldDescription className="mb-0">
                      The job position of the recipient
                    </FieldDescription>
                    <FieldContent>
                      <Input
                        className=""
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="e.g., Hiring Manager"
                      />
                    </FieldContent>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="recipientName">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid} className="mb-4">
                    <FieldLegend className="-mb-1">Contact Name</FieldLegend>
                    <FieldDescription className="mb-0">
                      The name of the hiring manager or contact person
                    </FieldDescription>
                    <FieldContent>
                      <Input
                        className=""
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="e.g., John Smith"
                      />
                    </FieldContent>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="jobDescription">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid} className="mb-4">
                    <FieldLegend className="-mb-1">Job Description</FieldLegend>
                    <FieldDescription className="mb-0">
                      Paste the job description to tailor your cover letter
                    </FieldDescription>
                    <FieldContent>
                      <Textarea
                        className=""
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Paste the job description here..."
                        rows={4}
                      />
                    </FieldContent>
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
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? (
                <>
                  <Spinner />
                  Creating...
                </>
              ) : (
                "Create"
              )}
            </Button>
          </form>
        </div>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
};
