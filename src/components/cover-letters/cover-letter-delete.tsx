"use client";

import { getQueryClient } from "@/lib/query/hydration";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { orpc } from "@/lib/orpc";
import { Button } from "../ui/button";
import { Trash2 } from "lucide-react";
import { Spinner } from "../ui/spinner";

export const CoverLetterDelete = ({
  id,
  size,
}: {
  id: string;
  size?: "sm" | "lg";
}) => {
  const queryClient = getQueryClient();

  const deleteMutation = useMutation(
    orpc.coverLetters.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.coverLetters.get.queryKey(),
        });
        toast.success("Cover letter deleted successfully");
      },
      onError: (error: unknown) => {
        toast.error("Failed to delete cover letter");
        console.error("Delete error:", error);
      },
    })
  );

  return (
    <Button
      variant="outline"
      className="cursor-pointer"
      onClick={() => {
        deleteMutation.mutate({ id });
      }}
      disabled={deleteMutation.isPending}
      size={size ?? "default"}
    >
      {deleteMutation.isPending ? <Spinner /> : <Trash2 />}
    </Button>
  );
};
