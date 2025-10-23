import { authed } from "@/middlewares/auth";
import { PreferencesSchema, ResumeUploadSchema, ResumeExtractResponseSchema } from "./schema";
import { db } from "@/db/drizzle";
import { jobPreferences, user, resumes, resumeData, userProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export const savePreferences = authed
    .route({
        method: "POST",
        path: "/onboarding",
        summary: "save job preferences",
        tags: ["onboarding"],
    })
    .input(PreferencesSchema)
    .handler(async ({ input, context }) => {
        const userId = context.user.id;

        // Use a transaction to ensure both operations succeed or fail together
        await db.transaction(async (tx) => {

            // Check if preferences already exist for this user
            const existingPreferences = await tx
                .select()
                .from(jobPreferences)
                .where(eq(jobPreferences.userId, userId))
                .limit(1);

            if (existingPreferences.length > 0) {
                // Update existing preferences
                await tx
                    .update(jobPreferences)
                    .set({
                        roles: input.roles,
                        type: input.type,
                        mode: input.mode,
                        location: input.location,
                        updatedAt: new Date(),
                    })
                    .where(eq(jobPreferences.userId, userId));
            } else {
                // Insert new preferences
                await tx.insert(jobPreferences).values({
                    userId,
                    roles: input.roles,
                    type: input.type,
                    mode: input.mode,
                    location: input.location,
                });
            }

            await tx
                .update(user)
                .set({
                    onboardingStep: "resume",
                    updatedAt: new Date(),
                })
                .where(eq(user.id, userId));
        });
    });

export const extractResume = authed
    .route({
        method: "POST",
        path: "/onboarding",
        summary: "Extract resume details and save to database",
        tags: ["onboarding"],
    })
    .input(ResumeUploadSchema)
    .output(ResumeExtractResponseSchema)
    .handler(async ({ input, context }) => {
        const userId = context.user.id;

        console.log('Extract resume input:', { input }); // Debug input

        const userRow = await db.select().from(user).where(eq(user.id, userId)).limit(1);
        if (userRow.length === 0) {
            throw new Error("User not found in database. Ensure the user is created before uploading a resume.");
        }

        if (context.user.onboardingCompleted) {
            throw new Error("Onboarding already completed. Use the update resume endpoint instead.");
        }

        if (context.user.onboardingStep !== "resume") {
            throw new Error("User is not in the resume step. Ensure the user is in the resume step before uploading a resume.");
        }

        console.log('Resume file received', { file: input.fileName })

        const res = await fetch(`${process.env.AI_SERVICE_URL}/resume`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(input),
        });

        const { message, result } = await res.json();
        if (!res.ok || !result) {
            throw new Error(message || "Failed to extract resume details");
        }

        // Step 1: Transaction to ensure atomic updates
        try {
            await db.transaction(async (tx) => {
                console.log("Transaction started");

                const updatedResult = {
                    ...result,
                    name: userRow[0].name || result.name,
                    email: userRow[0].email || result.email,
                }

                console.log("Updated result:", updatedResult);

                // Step 2: Save parsed resume data
                const [rd] = await tx.insert(resumeData).values({
                    userId,
                    fullData: updatedResult,
                }).returning();

                console.log("Resume data saved");

                // Step 3: Create resume metadata record (first resume = primary)
                const [resumeRecord] = await tx.insert(resumes).values({
                    userId,
                    fileName: 'resume.pdf',
                    mimeType: input.mimeType || 'application/pdf',
                    isPrimary: true, // First resume during onboarding is always primary
                    resumeDataId: rd.id,
                }).returning();

                console.log("Resume metadata created");

                // Step 4: Create user profile with primary resume ID
                await tx.insert(userProfiles).values({
                    userId,
                    primaryResumeId: resumeRecord.id, // Link to primary resume
                    phone: result.phone,
                    address: result.address,
                    linkedin: result.linkedin,
                    github: result.github,
                    portfolio: result.portfolio,
                    summary: result.summary,
                    skills: result.skills || [],
                    certifications: result.certifications || [],
                    achievements: result.achievements || [],
                    languages: result.languages || [],
                    experience: result.experience || [],
                    projects: result.projects || [],
                    education: result.education || [],
                    yearsOfExperience: (result.yearsOfExperience || 0).toFixed(1),
                });

                console.log("User profile created");

                // Step 5: Mark onboarding as completed
                await tx
                    .update(user)
                    .set({
                        onboardingStep: "completed",
                        onboardingCompleted: true,
                        onboardingCompletedAt: new Date(),
                        updatedAt: new Date(),
                    })
                    .where(eq(user.id, userId));

                console.log("Onboarding completed");
            });
        } catch (error) {
            console.error("Transaction failed:", error);
            throw error;
        }

        return {
            message: "Resume processed successfully",
            result,
        };
    });