import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db/drizzle";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireOnboardingStep } from "@/lib/auth-helpers";

export default async function ResumePage() {
  await requireOnboardingStep("resume");

  async function updateStep() {
    "use server";

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new Error("Not authenticated");
    }

    // Update the onboarding step in DB
    await db
      .update(user)
      .set({
        onboardingStep: "completed",
        onboardingCompleted: true,
        onboardingCompletedAt: new Date(),
      })
      .where(eq(user.id, session.user.id));

    // Redirect to resume page
    redirect("/dashboard");
  }

  return (
    <form action={updateStep}>
      <Button type="submit">Onboarded</Button>
    </form>
  );
}
