import { requireOnboardingStep } from "@/lib/auth-helpers";
import { ResumeUploadForm } from "@/components/onboarding/resume-upload-form";

export default async function ResumePage() {
  await requireOnboardingStep("resume");

  return (
    <div className="flex justify-center min-h-svh items-center">
      <ResumeUploadForm />
    </div>
  );
}
