"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { orpc } from "@/lib/orpc";
import { useMutation } from "@tanstack/react-query";

export function JobSearchForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const jobSearchMutation = useMutation(
    orpc.jobsearch.jobSearch.mutationOptions({
      onSuccess: (data) => {
        setMessage(data.message);
      },
      onError: (error) => {
        setError(error.message);
      },
    })
  );
  const isLoading = jobSearchMutation.isPending;

  const handleJobSearch = () => {
    jobSearchMutation.mutate({});
  };

  return (
    <div className="flex flex-col gap-4 items-center">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleJobSearch();
        }}
      >
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Spinner className="mr-2 h-4 w-4" />}
          {isLoading ? "Searching..." : "Start Job Search"}
        </Button>
      </form>

      {message && <div className="text-green-600 text-center">{message}</div>}

      {error && <div className="text-red-600 text-center">Error: {error}</div>}
    </div>
  );
}
