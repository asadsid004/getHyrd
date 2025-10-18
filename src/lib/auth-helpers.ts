import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function getSession() {
    return await auth.api.getSession({
        headers: await headers(),
    });
}

export async function requireAuth() {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    return session;
}

export async function requireOnboarding() {
    const session = await requireAuth();

    if (!session.user.onboardingCompleted) {
        redirect(`/onboarding/${session.user.onboardingStep}`);
    }

    return session;
}

export async function requireOnboardingStep(step: "preferences" | "resume") {
    const session = await requireAuth();

    if (session.user.onboardingCompleted) {
        redirect("/dashboard");
    }

    if (session.user.onboardingStep !== step) {
        redirect(`/onboarding/${session.user.onboardingStep}`);
    }

    return session;
}