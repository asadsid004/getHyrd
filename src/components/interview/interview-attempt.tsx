"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import {
  ClockIcon,
  SendIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircle2,
  Circle,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Spinner } from "../ui/spinner";

interface InterviewAttemptProps {
  id: string;
}

export const InterviewAttempt = ({ id }: InterviewAttemptProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isTimeUp, setIsTimeUp] = useState(false);
  // Safe init: check for window before using localStorage
  const [hasAutoSubmitted, setHasAutoSubmitted] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(`interview-${id}-autoSubmitted`) === "true";
  });

  // Use a generic timer ref type to avoid Node/Browser mismatch issues
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: interview, isLoading } = useQuery(
    orpc.interview.getOne.queryOptions({
      input: { id },
    })
  );

  const submitMutation = useMutation(
    orpc.interview.submitAttempt.mutationOptions({
      onSuccess: (result) => {
        // Persist that the attempt was submitted so we don't auto-submit again
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(`interview-${id}-autoSubmitted`, "true");
            localStorage.removeItem(`interview-${id}-start`);
          } catch (e) {
            // ignore localStorage errors
            console.error(e);
          }
        }

        toast.success(
          `Interview submitted! Score: ${result.score}/${result.total}`
        );
        queryClient.invalidateQueries({
          queryKey: orpc.interview.get.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: orpc.interview.getOne.queryKey({ input: { id } }),
        });
        // router.push("/interview");
      },
      onError: (error: Error) => {
        toast.error("Failed to submit interview: " + error.message);
      },
    })
  );

  const handleSubmit = useCallback(() => {
    if (!interview) return;

    console.log("Submitting interview...");
    console.log("Interview ID:", id);
    console.log("Answers:", answers);

    submitMutation.mutate({
      interviewId: id,
      answers,
    });
  }, [interview, id, answers, submitMutation]);

  // Initialize timer — only runs client-side within useEffect
  useEffect(() => {
    if (!interview || interview.attempt) return;

    // restore start time if present
    if (typeof window !== "undefined") {
      const storedStart = localStorage.getItem(`interview-${id}-start`);
      if (storedStart) {
        const startTime = parseInt(storedStart, 10);
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const remaining = Math.max(0, interview.timeLimit * 60 - elapsed);
        setTimeLeft(remaining);
        if (remaining === 0) {
          setIsTimeUp(true);
        }
        return;
      } else {
        const initialTime = interview.timeLimit * 60;
        setTimeLeft(initialTime);
        try {
          localStorage.setItem(`interview-${id}-start`, Date.now().toString());
        } catch (e) {
          // ignore localStorage write errors
          console.error(e);
        }
      }
    } else {
      // fallback if somehow running without window (shouldn't happen with "use client")
      setTimeLeft(interview.timeLimit * 60);
    }
  }, [interview, id]);

  // Timer countdown — uses timerRef to ensure interval is not recreated each render
  useEffect(() => {
    if (!interview || interview.attempt) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    // Inform user at 10 seconds left (only when crossing threshold)
    if (timeLeft === 10) {
      toast.info("You have 10 seconds left!");
    }

    if (timeLeft > 0) {
      if (!timerRef.current) {
        timerRef.current = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              // stop interval and mark time up
              if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
              }
              setIsTimeUp(true);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    // Cleanup on unmount or deps change
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [interview, timeLeft]);

  // Auto-submit when time is up — only once (guarded by hasAutoSubmitted)
  useEffect(() => {
    if (isTimeUp && !submitMutation.isPending && !hasAutoSubmitted) {
      setHasAutoSubmitted(true);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(`interview-${id}-autoSubmitted`, "true");
        } catch (e) {
          // ignore localStorage errors
          console.error(e);
        }
      }
      toast.warning("Time's up! Submitting your answers...");
      submitMutation.mutate({
        interviewId: id,
        answers,
      });
    }
  }, [isTimeUp, id, answers, submitMutation, hasAutoSubmitted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const goToQuestion = (index: number) => {
    setCurrentQuestion(index);
  };

  const goToPrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const goToNext = () => {
    if (interview && currentQuestion < interview.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Spinner className="mx-auto" />
          <p className="text-sm text-muted-foreground">Loading interview...</p>
        </div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg font-medium">Interview not found</p>
          <Button className="mt-4" onClick={() => router.push("/interview")}>
            Back to Interviews
          </Button>
        </div>
      </div>
    );
  }

  if (interview.attempt) {
    // Show results
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">{interview.topic}</h2>
                <p className="text-muted-foreground">{interview.genDesc}</p>
              </div>

              <div className="py-8">
                <div className="text-6xl font-bold text-primary mb-2">
                  {interview.attempt.score}/{interview.attempt.totalQuestions}
                </div>
                <p className="text-xl text-muted-foreground">
                  {Math.round(
                    (interview.attempt.score! /
                      interview.attempt.totalQuestions) *
                      100
                  )}
                  % Correct
                </p>
              </div>

              <div className="flex justify-center gap-4">
                <Button onClick={() => router.push("/interview")}>
                  Back to Interviews
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/interview/${id}/review`)}
                >
                  Review Answers
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sortedQuestions = [...interview.questions].sort(
    (a, b) => a.order - b.order
  );
  const currentQ = sortedQuestions[currentQuestion];
  const isLastQuestion = currentQuestion === sortedQuestions.length - 1;
  const answeredCount = Object.keys(answers).length;
  const totalQuestions = sortedQuestions.length;
  const unansweredCount = totalQuestions - answeredCount;

  return (
    <div className="min-h-screen">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 bg-background border-b z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold">{interview.topic}</h1>
              <p className="text-sm text-muted-foreground">
                {answeredCount} of {totalQuestions} answered
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg font-mono font-semibold",
                  timeLeft < 60
                    ? "bg-destructive/10 text-destructive"
                    : "bg-muted"
                )}
              >
                <ClockIcon className="w-5 h-5" />
                {formatTime(timeLeft)}
              </div>
              <Button
                onClick={handleSubmit}
                disabled={submitMutation.isPending}
                size="lg"
                variant={
                  answeredCount === totalQuestions ? "default" : "outline"
                }
              >
                {submitMutation.isPending ? (
                  <>
                    <Spinner className="mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <SendIcon className="w-4 h-4 mr-2" />
                    Submit
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Question Navigation Grid */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {sortedQuestions.map((q, index) => (
              <button
                key={q.id}
                onClick={() => goToQuestion(index)}
                disabled={submitMutation.isPending}
                className={cn(
                  "flex items-center justify-center min-w-[40px] h-10 rounded-md font-medium transition-all",
                  currentQuestion === index
                    ? "bg-primary text-primary-foreground"
                    : answers[q.id]
                    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : "bg-muted hover:bg-muted/80",
                  submitMutation.isPending && "opacity-50 cursor-not-allowed"
                )}
              >
                {answers[q.id] ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Circle className="w-4 h-4" />
                )}
                <span className="ml-1">{index + 1}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* Question Header */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Question {currentQuestion + 1} of {totalQuestions}
                  </span>
                  {answers[currentQ.id] && (
                    <span className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      Answered
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-semibold leading-relaxed">
                  {currentQ.question}
                </h2>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {["A", "B", "C", "D"].map((option) => {
                  const optionText = currentQ[
                    `option${option}` as keyof typeof currentQ
                  ] as string;
                  const isSelected = answers[currentQ.id] === option;

                  return (
                    <label
                      key={option}
                      className={cn(
                        "flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all",
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50 hover:bg-muted/50",
                        submitMutation.isPending &&
                          "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <input
                        type="radio"
                        name={`question-${currentQ.id}`}
                        value={option}
                        checked={isSelected}
                        onChange={(e) =>
                          handleAnswerChange(currentQ.id, e.target.value)
                        }
                        disabled={submitMutation.isPending}
                        className="mt-1 w-4 h-4 text-primary"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">
                            {option}.
                          </span>
                          <span className="text-base">{optionText}</span>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>

              {/* Warning for unanswered questions */}
              {isLastQuestion && unansweredCount > 0 && (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-900">
                  <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
                      {unansweredCount}{" "}
                      {unansweredCount === 1 ? "question" : "questions"}{" "}
                      unanswered
                    </p>
                    <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                      Review your answers before submitting. You can navigate
                      using the question numbers above.
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={goToPrevious}
                  disabled={currentQuestion === 0 || submitMutation.isPending}
                >
                  <ChevronLeftIcon className="w-4 h-4 mr-2" />
                  Previous
                </Button>

                {isLastQuestion ? (
                  <Button
                    onClick={handleSubmit}
                    disabled={submitMutation.isPending}
                  >
                    {submitMutation.isPending ? (
                      <>
                        <Spinner className="mr-2" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Interview
                        <SendIcon className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={goToNext}
                    disabled={submitMutation.isPending}
                  >
                    Next
                    <ChevronRightIcon className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
