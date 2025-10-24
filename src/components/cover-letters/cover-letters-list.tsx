"use client";

import { orpc } from "@/lib/orpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar,
  FileText,
  Mail,
  Building,
  User,
  SortAsc,
  SortDesc,
  Trash2,
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
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { getQueryClient } from "@/lib/query/hydration";
import { Spinner } from "../ui/spinner";

type SortType = "newest" | "oldest" | "name";

interface CoverLetter {
  id: string;
  title: string;
  content: string;
  recipientCompany: string | null;
  recipientPosition: string | null;
  recipientName: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export function CoverLettersList() {
  const {
    data: coverLetters,
    isLoading,
    error,
  } = useSuspenseQuery(orpc.coverLetters.get.queryOptions());

  const [sort, setSort] = useState<SortType>("newest");
  const [search, setSearch] = useState("");

  const queryClient = getQueryClient();

  const deleteMutation = useMutation(
    orpc.coverLetters.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(orpc.coverLetters.get.queryOptions());
        toast.success("Cover letter deleted successfully");
      },
      onError: (error) => {
        toast.error("Failed to delete cover letter");
        console.error("Delete error:", error);
      },
    })
  );

  // Filter and sort cover letters
  const filteredAndSortedCoverLetters = useMemo(() => {
    if (!coverLetters) return [];

    const filtered = coverLetters.filter((coverLetter) => {
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesSearch =
          coverLetter.title.toLowerCase().includes(searchLower) ||
          coverLetter.content.toLowerCase().includes(searchLower) ||
          coverLetter.recipientCompany?.toLowerCase().includes(searchLower) ||
          coverLetter.recipientPosition?.toLowerCase().includes(searchLower) ||
          coverLetter.recipientName?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }
      return true;
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
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [coverLetters, sort, search]);

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
            Failed to load cover letters. Please try again.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!coverLetters || coverLetters.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">No cover letters found.</p>
            <p className="text-sm text-muted-foreground">
              Create your first cover letter to get started.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 mb-8">
      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search cover letters by title, content, company, position..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <div className="flex gap-2">
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
                  : "Title"}
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
                Title
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredAndSortedCoverLetters.length} of{" "}
        {coverLetters?.length || 0} cover letters
      </div>

      {/* Cover Letters List */}
      <div className="space-y-4">
        {filteredAndSortedCoverLetters.map(
          (coverLetter: Omit<CoverLetter, "jobDescription">) => (
            <Card key={coverLetter.id}>
              <CardHeader className="flex items-center justify-between">
                <div className="flex flex-col items-start gap-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      {coverLetter.title}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Created{" "}
                        {new Date(coverLetter.createdAt).toLocaleDateString(
                          "en-GB"
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Updated{" "}
                        {new Date(coverLetter.updatedAt).toLocaleDateString(
                          "en-GB"
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/cover-letter/${coverLetter.id}`}>
                      <FileText className="h-4 w-4 mr-2" />
                      View
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer"
                    onClick={() => {
                      deleteMutation.mutate({ id: coverLetter.id });
                    }}
                    disabled={deleteMutation.isPending}
                  >
                    {deleteMutation.isPending ? (
                      <Spinner />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {coverLetter.recipientCompany && (
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {coverLetter.recipientCompany}
                        </span>
                      </div>
                    )}
                    {coverLetter.recipientPosition && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{coverLetter.recipientPosition}</span>
                      </div>
                    )}
                    {coverLetter.recipientName && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{coverLetter.recipientName}</span>
                      </div>
                    )}
                  </div>
                  {coverLetter.content && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Content Preview</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {coverLetter.content.substring(0, 200)}...
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        )}
      </div>
    </div>
  );
}
