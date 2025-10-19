import { authed } from "@/middlewares/auth";
import { PreferencesSchema, VoidSchema } from "./schema";
import { db } from "@/db/drizzle";
import { jobPreferences, user } from "@/db/schema";
import { eq } from "drizzle-orm";

export const savePreferences = authed
    .route({
        method: "POST",
        path: "/onboarding",
        summary: "save job preferences",
        tags: ["onboarding"],
    })
    .input(PreferencesSchema)
    .output(VoidSchema)
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