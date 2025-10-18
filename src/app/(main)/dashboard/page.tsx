import { Logout } from "@/components/auth/logout-button";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Button } from "@/components/ui/button";
import { db } from "@/db/drizzle";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireOnboarding } from "@/lib/auth-helpers";

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
    <div className="flex flex-col items-center justify-center gap-6 p-10">
      <div className="flex items-center justify-between w-full">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Logout />
      </div>

      <div className="text-center">
        <p className="text-lg">
          Onboarding Status:{" "}
          {session.user.onboardingCompleted ? "✅ True" : "❌ False"}
        </p>
        <p className="text-sm text-gray-500">
          Current Step: {session.user.onboardingStep}
        </p>
      </div>

      <div className="flex gap-4">
        <form action={setOnboardingTrue}>
          <Button type="submit" variant="default">
            Set Onboarding TRUE
          </Button>
        </form>
        <form action={setOnboardingFalse}>
          <Button type="submit" variant="destructive">
            Set Onboarding FALSE
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Dashboard;
