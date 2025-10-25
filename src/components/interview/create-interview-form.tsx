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
  FieldLabel,
  FieldLegend,
} from "../ui/field";
import { Textarea } from "../ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import { toast } from "sonner";
import { Spinner } from "../ui/spinner";
import { PlusIcon } from "lucide-react";
import { getQueryClient } from "@/lib/query/hydration";
import { useState } from "react";

export const CreateInterviewForm = () => {
  const queryClient = getQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm({
    defaultValues: {
      topic: "",
      description: "",
      difficulty: "easy",
      numQuestions: 5,
      timeLimit: 5,
    },
    validators: {
      onChange: z.object({
        topic: z.string().min(1, "Topic is required"),
        description: z.string(),
        difficulty: z.enum(["easy", "medium", "hard"]),
        numQuestions: z
          .number()
          .min(1, "No. of Questions cannot be less than 1"),
        timeLimit: z.number().min(5, "Time cannot be less than 5 minutes"),
      }),
      onSubmit: async ({ value }) => {
        const input = {
          ...value,
          difficulty: value.difficulty as "easy" | "medium" | "hard",
        };
        createMutation.mutate(input);
      },
    },
  });

  const createMutation = useMutation(
    orpc.interview.create.mutationOptions({
      onSuccess: () => {
        toast.success("Interview created successfully");
        queryClient.invalidateQueries({
          queryKey: orpc.interview.get.queryKey(),
        });
        queryClient.refetchQueries({
          queryKey: orpc.interview.get.queryKey(),
        });
        setOpen(false);
      },
      onError: (error: Error) => {
        toast.error("Error creating interview: " + error.message);
      },
    })
  );

  return (
    <ResponsiveDialog open={open} onOpenChange={setOpen}>
      <ResponsiveDialogTrigger asChild>
        <Button variant="outline">
          Create <PlusIcon />
        </Button>
      </ResponsiveDialogTrigger>
      <ResponsiveDialogContent className="sm:max-w-sm">
        <div className="overflow-y-auto p-6">
          <ResponsiveDialogHeader className="sm:text-center">
            <ResponsiveDialogTitle>Create Interview</ResponsiveDialogTitle>
            <ResponsiveDialogDescription>
              Create a new interview
            </ResponsiveDialogDescription>
          </ResponsiveDialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <form.Field name="topic">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid} className="mb-4">
                    <FieldLegend className="-mb-1">Topic</FieldLegend>
                    <FieldDescription className="mb-0">
                      The topic you want to prepare for
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
                    <FieldLegend className="-mb-1">Description</FieldLegend>
                    <FieldDescription>
                      A description for the topic
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
            <form.Field name="difficulty">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid} className="mb-4">
                    <FieldLabel
                      htmlFor="interview-difficulty"
                      className="-mb-1"
                    >
                      Difficulty
                    </FieldLabel>
                    <FieldDescription>
                      Difficulty of the interview
                    </FieldDescription>
                    <FieldContent>
                      <select
                        id="interview-difficulty"
                        className="flex h-10 w-[180px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </FieldContent>
                  </Field>
                );
              }}
            </form.Field>
            <form.Field name="numQuestions">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLegend className="-mb-1">
                      Number of Questions
                    </FieldLegend>
                    <FieldDescription>
                      Number of questions for the interview
                    </FieldDescription>
                    <FieldContent>
                      <Input
                        className="mb-4"
                        type="number"
                        value={field.state.value}
                        onChange={(e) =>
                          field.handleChange(Number(e.target.value))
                        }
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </FieldContent>
                  </Field>
                );
              }}
            </form.Field>
            <form.Field name="timeLimit">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLegend className="-mb-1">Time Limit</FieldLegend>
                    <FieldDescription>
                      Time limit for the interview
                    </FieldDescription>
                    <FieldContent>
                      <Input
                        className="mb-4"
                        type="number"
                        value={field.state.value}
                        onChange={(e) =>
                          field.handleChange(Number(e.target.value))
                        }
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
