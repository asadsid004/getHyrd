"use client";

import { getQueryClient } from "@/lib/query/hydration";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { orpc } from "@/lib/orpc";
import { Button } from "../ui/button";
import { Trash2 } from "lucide-react";
import { Spinner } from "../ui/spinner";

export const InterviewDelete = ({
  id,
  size,
  title,
}: {
  id: string;
  size?: "sm" | "lg";
  title?: boolean;
}) => {
  const queryClient = getQueryClient();

  const deleteMutation = useMutation(
    orpc.interview.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.interview.get.queryKey(),
        });
        toast.success("Interview deleted successfully");
      },
      onError: (error: unknown) => {
        toast.error("Failed to delete interview");
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
      {title &&
        `${deleteMutation.isPending ? "Deleting..." : "Delete Interview"}`}
    </Button>
  );
};
