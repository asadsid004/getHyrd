import { requireOnboardingStep } from "@/lib/auth-helpers";
import { PreferencesForm } from "@/components/onboarding/preferences-form";

export default async function PreferencesPage() {
  await requireOnboardingStep("preferences");

  return (
    <div className="flex justify-center min-h-svh items-center">
      <PreferencesForm />
    </div>
  );
}
