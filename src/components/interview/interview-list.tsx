"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  EyeIcon,
  PlayIcon,
  Filter,
  Clock,
  FileText,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { Badge } from "../ui/badge";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { InterviewDelete } from "./interview-delete";

type Interview = {
  id: string;
  userId: string;
  topic: string;
  description: string | null;
  difficulty: "easy" | "medium" | "hard";
  numQuestions: number;
  timeLimit: number;
  genDesc: string;
  score: number;
  correctAnswers: number;
  isAttempted: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export const InterviewList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string | null>(null);

  const {
    data: interviews,
    isLoading,
    error,
  } = useQuery(orpc.interview.get.queryOptions());

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Loading interviews...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-2">
          <p className="text-destructive">Error loading interviews</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!interviews || interviews.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-2">
          <p className="text-muted-foreground">No interviews yet.</p>
          <p className="text-sm text-muted-foreground">
            Create your first interview to get started!
          </p>
        </div>
      </div>
    );
  }

  const filterInterviews = (interviewList: Interview[]) => {
    return interviewList.filter((interview) => {
      const matchesSearch = interview.topic
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesDifficulty =
        !difficultyFilter || interview.difficulty === difficultyFilter;
      return matchesSearch && matchesDifficulty;
    });
  };

  const notAttemptedInterviews = filterInterviews(
    (interviews as Interview[]).filter((i) => !i.isAttempted)
  );

  const attemptedInterviews = filterInterviews(
    (interviews as Interview[]).filter((i) => i.isAttempted)
  );

  const InterviewCard = ({ interview }: { interview: Interview }) => (
    <Card
      key={interview.id}
      className="group hover:shadow-lg transition-all duration-300 hover:border-primary/50 overflow-hidden flex flex-col"
    >
      <CardHeader className="space-y-3 pb-4">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-lg font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">
            {interview.topic}
          </CardTitle>
          <Badge
            variant="secondary"
            className={`shrink-0 ${
              interview.difficulty === "easy"
                ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400"
                : interview.difficulty === "medium"
                ? "bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400"
                : "bg-rose-100 text-rose-700 hover:bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400"
            }`}
          >
            {interview.difficulty.charAt(0).toUpperCase() +
              interview.difficulty.slice(1)}
          </Badge>
        </div>

        {interview.genDesc && (
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {interview.genDesc}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-4 flex-1 flex flex-col pt-0">
        <div className="border-t" />

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted">
              <Clock className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">
                Duration
              </span>
              <span className="text-sm font-semibold">
                {interview.timeLimit} min
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted">
              <FileText className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">
                Questions
              </span>
              <span className="text-sm font-semibold">
                {interview.numQuestions}
              </span>
            </div>
          </div>
        </div>

        {interview.isAttempted && (
          <>
            <div className="border-t" />
            <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-primary/5 border border-primary/10">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  Your Score
                </span>
                <span className="text-2xl font-bold text-primary">
                  {interview.score}
                  <span className="text-lg text-muted-foreground">
                    /{interview.numQuestions}
                  </span>
                </span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">
                  {Math.round((interview.score / interview.numQuestions) * 100)}
                  %
                </div>
                <span className="text-xs text-muted-foreground">correct</span>
              </div>
            </div>
          </>
        )}

        <div className="flex-1" />
        {interview.isAttempted ? (
          <Button
            variant="outline"
            className="w-full group-hover:border-primary group-hover:text-primary"
            asChild
          >
            <Link href={`/interview/${interview.id}`}>
              <EyeIcon className="w-4 h-4 mr-2" />
              View Results
            </Link>
          </Button>
        ) : (
          <Button className="w-full" asChild>
            <Link href={`/interview/${interview.id}`}>
              <PlayIcon className="w-4 h-4 mr-2" />
              Start Interview
            </Link>
          </Button>
        )}
        <InterviewDelete title={true} id={interview.id} />
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Search by topic..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Difficulty: {difficultyFilter || "All"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => setDifficultyFilter(null)}>
              All
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setDifficultyFilter("easy")}>
              Easy
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setDifficultyFilter("medium")}>
              Medium
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setDifficultyFilter("hard")}>
              Hard
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Tabs for Attempted/Not Attempted */}
      <Tabs defaultValue="available" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="available" className="gap-2">
            <Circle className="w-4 h-4" />
            Available ({notAttemptedInterviews.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Completed ({attemptedInterviews.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="mt-6">
          {notAttemptedInterviews.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <Circle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No available interviews</p>
              <p className="text-sm text-muted-foreground mt-1">
                {searchTerm || difficultyFilter
                  ? "Try adjusting your filters"
                  : "Create a new interview to get started!"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {notAttemptedInterviews.map((interview) => (
                <InterviewCard key={interview.id} interview={interview} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          {attemptedInterviews.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <CheckCircle2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No completed interviews yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Complete an interview to see your results here
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {attemptedInterviews.map((interview) => (
                <InterviewCard key={interview.id} interview={interview} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
