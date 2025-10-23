"use client";

import { orpc } from "@/lib/orpc";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar,
  File,
  FileText,
  Mail,
  Phone,
  Star,
  User,
  Filter,
  SortAsc,
  SortDesc,
} from "lucide-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Button } from "../ui/button";
import Link from "next/link";
import { useState, useMemo } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

type FilterType = "all" | "primary";
type SortType = "newest" | "oldest" | "name";

interface Resume {
  id: string;
  fileName: string;
  mimeType: string;
  uploadDate: Date | null;
  isPrimary: boolean;
  createdAt: Date;
  updatedAt: Date;
  resumeData: {
    name: string | null;
    email: string | null;
    phone: string | null;
    summary: string | null;
    skills: string[] | null;
  } | null;
}

export function ResumesList() {
  const {
    data: resumes,
    isLoading,
    error,
  } = useSuspenseQuery(orpc.resumes.get.queryOptions());

  const [filter, setFilter] = useState<FilterType>("all");
  const [sort, setSort] = useState<SortType>("newest");
  const [search, setSearch] = useState("");

  // Filter and sort resumes
  const filteredAndSortedResumes = useMemo(() => {
    if (!resumes) return [];

    const filtered = resumes.filter((resume) => {
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesSearch =
          resume.fileName.toLowerCase().includes(searchLower) ||
          resume.resumeData?.name?.toLowerCase().includes(searchLower) ||
          resume.resumeData?.email?.toLowerCase().includes(searchLower) ||
          resume.resumeData?.skills?.some((skill) =>
            skill.toLowerCase().includes(searchLower)
          );
        if (!matchesSearch) return false;
      }

      // Type filter
      switch (filter) {
        case "primary":
          return resume.isPrimary;
        default:
          return true;
      }
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sort) {
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "name":
          return a.fileName.localeCompare(b.fileName);
        default:
          return 0;
      }
    });

    return filtered;
  }, [resumes, filter, sort, search]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-1/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <p className="text-destructive">
            Failed to load resumes. Please try again.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!resumes || resumes.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">No resumes found.</p>
            <p className="text-sm text-muted-foreground">
              Upload your first resume to get started.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search resumes by name, email, or skills..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter:{" "}
                {filter === "all"
                  ? "All"
                  : filter === "primary"
                  ? "Primary"
                  : filter === "parsed"
                  ? "Parsed"
                  : "Unparsed"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setFilter("all")}>
                All Resumes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("primary")}>
                Primary Only
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                {sort === "newest" ? (
                  <SortDesc className="h-4 w-4 mr-2" />
                ) : sort === "oldest" ? (
                  <SortAsc className="h-4 w-4 mr-2" />
                ) : (
                  <FileText className="h-4 w-4 mr-2" />
                )}
                Sort:{" "}
                {sort === "newest"
                  ? "Newest"
                  : sort === "oldest"
                  ? "Oldest"
                  : "Name"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSort("newest")}>
                Newest First
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSort("oldest")}>
                Oldest First
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSort("name")}>
                File Name
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredAndSortedResumes.length} of {resumes?.length || 0}{" "}
        resumes
      </div>

      {/* Resumes List */}
      <div className="space-y-4">
        {filteredAndSortedResumes.map((resume: Resume) => (
          <Card
            key={resume.id}
            className={resume.isPrimary ? "border-muted-foreground" : ""}
          >
            <CardHeader className="flex items-center justify-between">
              <div className="flex flex-col items-start gap-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {resume.fileName}
                    {resume.isPrimary && (
                      <Badge
                        variant="default"
                        className="flex items-center gap-1"
                      >
                        <Star className="h-3 w-3" />
                        Primary
                      </Badge>
                    )}
                  </CardTitle>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Uploaded{" "}
                    {resume.uploadDate
                      ? new Date(resume.uploadDate).toLocaleDateString()
                      : "Unknown"}
                  </div>
                </div>
              </div>
              <Button asChild>
                <Link href={`/resumes/${resume.id}`}>
                  <File />
                  View
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {resume.resumeData && (
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    {resume.resumeData.name && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {resume.resumeData.name}
                        </span>
                      </div>
                    )}
                    {resume.resumeData.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{resume.resumeData.email}</span>
                      </div>
                    )}
                  </div>
                  {resume.resumeData.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{resume.resumeData.phone}</span>
                    </div>
                  )}
                  {resume.resumeData.summary && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Summary</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {resume.resumeData.summary}
                      </p>
                    </div>
                  )}
                  {resume.resumeData.skills &&
                    resume.resumeData.skills.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Skills</p>
                        <div className="flex flex-wrap gap-1">
                          {resume.resumeData.skills
                            .slice(0, 5)
                            .map((skill, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="text-xs"
                              >
                                {skill}
                              </Badge>
                            ))}
                          {resume.resumeData.skills.length > 5 && (
                            <Badge variant="secondary" className="text-xs">
                              +{resume.resumeData.skills.length - 5} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
