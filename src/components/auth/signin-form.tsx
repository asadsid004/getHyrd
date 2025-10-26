"use client";

import { Button } from "@/components/ui/button";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from "@/components/ui/revola";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function SignInDialog() {
  const [isLoading, setIsLoading] = useState(false);
  const { data: session, error } = authClient.useSession();
  const router = useRouter();

  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      });
    } catch (error) {
      const err = error as Error;
      console.error("Sign in error:", err.message);
      toast.error(err.message || "Unable to sign in. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    toast.error(error.message || "Login failed. Please try again.");
  }

  if (session) {
    return (
      <Button onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
    );
  }

  return (
    <ResponsiveDialog>
      <ResponsiveDialogTrigger asChild>
        <Button>Start Search</Button>
      </ResponsiveDialogTrigger>
      <ResponsiveDialogContent className="sm:max-w-sm">
        <div className="space-y-4 overflow-y-auto p-6">
          <ResponsiveDialogHeader className="sm:text-center">
            <ResponsiveDialogTitle>Sign In</ResponsiveDialogTitle>
            <ResponsiveDialogDescription>
              to continue to platform
            </ResponsiveDialogDescription>
          </ResponsiveDialogHeader>

          <Button
            variant="outline"
            className="w-full"
            type="button"
            onClick={signInWithGoogle}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg
                  className="mr-2 h-4 w-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Signing in...
              </>
            ) : (
              <>
                <svg
                  className="mr-2 h-5 w-5"
                  viewBox="-3 0 262 262"
                  xmlns="http://www.w3.org/2000/svg"
                  preserveAspectRatio="xMidYMid"
                  fill="#000000"
                >
                  <path
                    d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
                    fill="#4285F4"
                  ></path>
                  <path
                    d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
                    fill="#34A853"
                  ></path>
                  <path
                    d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"
                    fill="#FBBC05"
                  ></path>
                  <path
                    d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
                    fill="#EB4335"
                  ></path>
                </svg>
                Continue with Google
              </>
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            By signing up you agree to our{" "}
            <a className="underline hover:no-underline" href="#">
              Terms
            </a>
            .
          </p>
        </div>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
