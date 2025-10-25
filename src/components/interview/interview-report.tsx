"use client";

import { useQuery } from "@tanstack/react-query";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, ArrowLeft, CheckCircle2, ClockIcon } from "lucide-react";
import { orpc } from "@/lib/orpc";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";

export const InterviewReport = ({ id }: { id: string }) => {
  const router = useRouter();
  // Fetch the report
  const {
    data: report,
    isLoading: reportLoading,
    error: reportError,
  } = useQuery(
    orpc.interview.getReport.queryOptions({
      input: { interviewId: id },
    })
  );

  if (reportLoading) {
    return (
      <div className="flex items-center justify-center">
        <div className="text-center space-y-4">
          <Spinner className="mx-auto" />
          <p className="text-sm text-muted-foreground">Loading report...</p>
        </div>
      </div>
    );
  }

  if (reportError) {
    return (
      <div className="flex items-center justify-center mt-10">
        <div className="text-center space-y-4">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto" />
          <p className="text-2xl font-bold text-muted-foreground">
            Failed to Load Report
          </p>
          <p className="text-muted-foreground">
            There was an error generating your interview report. Please try
            again later.
          </p>
          <Button onClick={() => router.push("/interview")}>
            Back to Interviews
          </Button>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex items-center justify-center mt-10">
        <div className="text-center space-y-4">
          <p className="text-2xl font-bold text-muted-foreground">
            Report Not Found
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Action Buttons */}
      <div className="pb-7 pt-1">
        <Button variant="outline" onClick={() => router.push("/interview")}>
          <ArrowLeft />
          Back to Interviews
        </Button>
        {/* <Button onClick={() => router.push(`/interview/${id}/review`)}>
          Review Answers
        </Button> */}
      </div>
      <div className="rounded-2xl bg-muted mx-auto p-6 space-y-6">
        {/* Header Card */}
        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-2">
                <CheckCircle2 className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {report.interview.topic}
                </h1>
                <p className="text-start text-muted-foreground mx-auto">
                  {report.interview.genDesc}
                </p>
              </div>

              {/* Score Display */}
              <div className="flex items-center justify-center gap-8 py-6">
                <div className="text-center">
                  <div className="text-6xl font-bold text-primary mb-2">
                    {report.interview.score}
                    <span className="text-3xl text-muted-foreground">
                      /{report.interview.numQuestions}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wide">
                    Questions Correct
                  </p>
                </div>
                <div className="h-20 w-px bg-border" />
                <div className="text-center">
                  <div className="text-6xl font-bold text-primary mb-2">
                    {Math.round(
                      (report.interview.correctAnswers! /
                        report.interview.numQuestions) *
                        100
                    )}
                    <span className="text-3xl">%</span>
                  </div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wide">
                    Score
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Analysis Section */}
        {report && (
          <>
            {/* Overall Analysis */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  Overall Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {report.overallAnalysis}
                </p>
              </CardContent>
            </Card>

            {/* Strengths & Weaknesses Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Strengths */}
              <Card className="border-emerald-200 dark:border-emerald-900/30">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {report.strengthsAnalysis}
                  </p>
                </CardContent>
              </Card>

              {/* Weaknesses */}
              <Card className="border-amber-200 dark:border-amber-900/30">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                    Areas to Improve
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {report.weaknessesAnalysis}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Improvement Suggestions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-4 h-4 text-purple-600 dark:text-purple-400"
                    >
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  </div>
                  Actionable Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: report.improvementSuggestions
                      .split("\n")
                      .map((line) => `<p class="mb-2">${line}</p>`)
                      .join(""),
                  }}
                />
              </CardContent>
            </Card>

            {/* Learning Resources */}
            {report.resources && report.resources.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-4 h-4 text-indigo-600 dark:text-indigo-400"
                      >
                        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                      </svg>
                    </div>
                    Recommended Learning Resources
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Curated resources to help you improve
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {report.resources.map((resource) => (
                      <Link
                        key={resource.id}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block group"
                      >
                        <Card className="hover:shadow-md transition-shadow border-2 hover:border-primary/50">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              {/* Resource Type Icon */}
                              <div
                                className={cn(
                                  "flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center",
                                  resource.resourceType === "video" &&
                                    "bg-red-100 dark:bg-red-900/30",
                                  resource.resourceType === "article" &&
                                    "bg-blue-100 dark:bg-blue-900/30",
                                  resource.resourceType === "pdf" &&
                                    "bg-orange-100 dark:bg-orange-900/30",
                                  resource.resourceType === "documentation" &&
                                    "bg-green-100 dark:bg-green-900/30",
                                  resource.resourceType === "course" &&
                                    "bg-purple-100 dark:bg-purple-900/30"
                                )}
                              >
                                {resource.resourceType === "video" && (
                                  <svg
                                    className="w-6 h-6 text-red-600 dark:text-red-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                                    />
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                )}
                                {resource.resourceType === "article" && (
                                  <svg
                                    className="w-6 h-6 text-blue-600 dark:text-blue-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                  </svg>
                                )}
                                {resource.resourceType === "pdf" && (
                                  <svg
                                    className="w-6 h-6 text-orange-600 dark:text-orange-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                    />
                                  </svg>
                                )}
                                {resource.resourceType === "documentation" && (
                                  <svg
                                    className="w-6 h-6 text-green-600 dark:text-green-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                    />
                                  </svg>
                                )}
                                {resource.resourceType === "course" && (
                                  <svg
                                    className="w-6 h-6 text-purple-600 dark:text-purple-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 14l9-5-9-5-9 5 9 5z"
                                    />
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                                    />
                                  </svg>
                                )}
                              </div>

                              {/* Resource Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                  <h3 className="font-semibold text-base group-hover:text-primary transition-colors line-clamp-1">
                                    {resource.title}
                                  </h3>
                                  <svg
                                    className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                    />
                                  </svg>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                  {resource.description}
                                </p>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                    {resource.topicCovered}
                                  </span>
                                  <span
                                    className={cn(
                                      "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                                      resource.difficultyLevel === "beginner" &&
                                        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                                      resource.difficultyLevel ===
                                        "intermediate" &&
                                        "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                                      resource.difficultyLevel === "advanced" &&
                                        "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                    )}
                                  >
                                    {resource.difficultyLevel}
                                  </span>
                                  {resource.estimatedTime && (
                                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                      <ClockIcon className="w-3 h-3" />
                                      {resource.estimatedTime}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};
