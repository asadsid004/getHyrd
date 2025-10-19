import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db/drizzle";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireOnboardingStep } from "@/lib/auth-helpers";
import { PreferencesForm } from "@/components/onboarding/preferences-form";

export default async function PreferencesPage() {
  await requireOnboardingStep("preferences");

  async function updateStep() {
    "use server";

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new Error("Not authenticated");
    }

    await db
      .update(user)
      .set({ onboardingStep: "resume" })
      .where(eq(user.id, session.user.id));

    redirect("/onboarding/resume");
  }

  return (
    // <form action={updateStep}>
    //   <Button type="submit">Change</Button>
    // </form>
    <div className="flex justify-center min-h-svh items-center">
      <PreferencesForm />
    </div>
  );
}
