import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Button } from "@/components/ui/button";
import { db } from "@/db/drizzle";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireOnboarding } from "@/lib/auth-helpers";
import { JobSearchForm } from "@/components/jobs/job-search-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

const Dashboard = async () => {
  const session = await requireOnboarding();

  async function setOnboardingTrue() {
    "use server";

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) return;

    await db
      .update(user)
      .set({
        onboardingCompleted: true,
        onboardingStep: "completed",
      })
      .where(eq(user.id, session.user.id));

    revalidatePath("/dashboard");
  }

  async function setOnboardingFalse() {
    "use server";

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) return;

    await db
      .update(user)
      .set({
        onboardingCompleted: false,
        onboardingStep: "preferences",
      })
      .where(eq(user.id, session.user.id));

    revalidatePath("/dashboard");
  }

  return (
    <div className="space-y-8 py-6">
      {/* Welcome Section */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-semibold tracking-tight">
          Welcome back, {session.user.name}
        </h1>
        <p className="text-lg text-muted-foreground">
          Ready to advance your career? Let&apos;s get started.
        </p>
      </div>

      {/* Quick Stats/Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="gap-4">
          <CardHeader className="gap-1 pb-3">
            <CardTitle className="text-base">Jobs Applied</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">No applications yet</p>
          </CardContent>
        </Card>
        <Card className="gap-4">
          <CardHeader className="gap-1 pb-3">
            <CardTitle className="text-base">Resumes Created</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Start building your resume
            </p>
          </CardContent>
        </Card>
        <Card className="gap-4">
          <CardHeader className="gap-1 pb-3">
            <CardTitle className="text-base">Interviews Scheduled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">No interviews yet</p>
          </CardContent>
        </Card>
        <Card className="gap-4">
          <CardHeader className="gap-1 pb-3">
            <CardTitle className="text-base">Profile Complete</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {session.user.onboardingCompleted ? "100%" : "75%"}
            </div>
            <p className="text-xs text-muted-foreground">
              {session.user.onboardingCompleted
                ? "All set!"
                : "Complete your profile"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="gap-4">
          <CardHeader className="gap-1 pb-3">
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>Access your main features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild className="w-full justify-start">
              <Link href="/jobs">Browse Jobs</Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/resumes">Manage Resumes</Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/interview">Interview Prep</Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/resource">Resources</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="gap-4">
          <CardHeader className="gap-1 pb-3">
            <CardTitle className="text-lg">Onboarding Status</CardTitle>
            <CardDescription>Your profile setup progress</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium">
                Status:{" "}
                {session.user.onboardingCompleted
                  ? "✅ Completed"
                  : "⏳ In Progress"}
              </p>
              <p className="text-sm text-muted-foreground">
                Current Step: {session.user.onboardingStep}
              </p>
            </div>
            <div className="flex gap-2">
              <form action={setOnboardingTrue}>
                <Button type="submit" variant="default" size="sm">
                  Mark Complete
                </Button>
              </form>
              <form action={setOnboardingFalse}>
                <Button type="submit" variant="destructive" size="sm">
                  Reset
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Job Search */}
      <Card className="gap-4">
        <CardHeader className="gap-1 pb-3">
          <CardTitle className="text-lg">Job Search</CardTitle>
          <CardDescription>Find your next opportunity</CardDescription>
        </CardHeader>
        <CardContent>
          <JobSearchForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
