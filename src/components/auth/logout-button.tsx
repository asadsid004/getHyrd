"use client";

import { authClient } from "@/lib/auth-client";
import { Button } from "../ui/button";
import { LogOut, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function Logout() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      setIsLoading(true);

      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            toast.success("Logged out successfully", {
              description: "You have been signed out of your account.",
            });
            router.push("/");
          },
          onError: (ctx) => {
            toast.error("Logout failed", {
              description:
                ctx.error.message || "Unable to log out. Please try again.",
            });
          },
        },
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Something went wrong", {
        description: "Please try again later.",
      });
      setIsLoading(false);
    }
  };

  return (
    <Button variant="outline" onClick={handleLogout} disabled={isLoading}>
      {isLoading ? (
        <>
          Logging out... <Loader2 className="size-4 animate-spin" />
        </>
      ) : (
        <>
          Logout <LogOut className="size-4" />
        </>
      )}
    </Button>
  );
}
