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
import { EyeIcon, PlayIcon, Filter } from "lucide-react";
import { Badge } from "../ui/badge";
import Link from "next/link";

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
  const [attemptedFilter, setAttemptedFilter] = useState<boolean | null>(null);

  const {
    data: interviews,
    isLoading,
    error,
  } = useQuery(
    orpc.interview.get.queryOptions({
      queryKey: orpc.interview.get.queryKey(),
    })
  );

  const filteredInterviews = (interviews as Interview[]).filter(
    (interview: Interview) => {
      const matchesSearch = interview.topic
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesDifficulty =
        !difficultyFilter || interview.difficulty === difficultyFilter;
      const matchesAttempted =
        attemptedFilter === null || interview.isAttempted === attemptedFilter;
      return matchesSearch && matchesDifficulty && matchesAttempted;
    }
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading interviews</div>;

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          placeholder="Search by topic..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="max-w-sm justify-between">
              <Filter className="h-4 w-4 mr-1" />
              Difficulty: {difficultyFilter || "All"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="max-w-sm justify-between">
              <Filter className="h-4 w-4 mr-1" />
              Status:{" "}
              {attemptedFilter === null
                ? "All"
                : attemptedFilter
                ? "Attempted"
                : "Not Attempted"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setAttemptedFilter(null)}>
              All
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setAttemptedFilter(true)}>
              Attempted
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setAttemptedFilter(false)}>
              Not Attempted
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredInterviews?.map((interview: Interview) => (
          <Card
            key={interview.id}
            className="group hover:shadow-lg transition-all duration-300 hover:border-primary/50 overflow-hidden"
          >
            <CardHeader className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <CardTitle className="text-xl font-bold leading-tight group-hover:text-primary transition-colors">
                  {interview.topic}
                </CardTitle>
                <Badge
                  variant="secondary"
                  className={`shrink-0 ${
                    interview.difficulty === "easy"
                      ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                      : interview.difficulty === "medium"
                      ? "bg-amber-100 text-amber-700 hover:bg-amber-100"
                      : "bg-rose-100 text-rose-700 hover:bg-rose-100"
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

            <CardContent className="space-y-4">
              {/* Divider */}
              <div className="border-t" />

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    Duration
                  </span>
                  <span className="text-sm font-semibold flex items-center gap-1.5">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-4 h-4 text-muted-foreground"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    {interview.timeLimit} min
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    Questions
                  </span>
                  <span className="text-sm font-semibold flex items-center gap-1.5">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-4 h-4 text-muted-foreground"
                    >
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    {interview.numQuestions}
                  </span>
                </div>
              </div>

              {/* Score Section (if attempted) */}
              {interview.isAttempted && (
                <>
                  <div className="border-t" />
                  <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/10">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-muted-foreground font-medium">
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
                      <span className="text-xs text-muted-foreground">
                        {Math.round(
                          (interview.score / interview.numQuestions) * 100
                        )}
                        % correct
                      </span>
                    </div>
                  </div>
                </>
              )}

              {/* Action Button */}
              {interview.isAttempted ? (
                <Button variant="outline" className="w-full" asChild>
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
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
