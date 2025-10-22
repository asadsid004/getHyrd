import { authed } from "@/middlewares/auth";
import { db } from "@/db/drizzle";
import { jobPreferences, userProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const jobSearch = authed
    .route({
        method: "POST",
        path: "/job-search",
        summary: "save job preferences",
        tags: ["jobsearch"],
    })
    .output(z.object({
        message: z.string(),
    }))
    .handler(async ({ context }) => {
        const userId = context.user.id;


        console.log("Check 1");
        const userProfile = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);
        const userProfileData = userProfile[0] || userProfile; // assuming it's an array with one item
        if (!userProfileData) {
            throw new Error("User profile not found");
        }

        console.log("Check 2");
        const preferences = await db.select().from(jobPreferences).where(eq(jobPreferences.userId, userId)).limit(1);
        const preferencesData = preferences[0] || preferences; // assuming it's an array with one item
        if (!preferencesData) {
            throw new Error("Job preferences not found");
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id: _profileId, userId: _profileUserId, createdAt: _profileCreatedAt, updatedAt: _profileUpdatedAt, ...userProfileWithoutIds } = userProfileData;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id: _prefId, userId: _prefUserId, createdAt: _prefCreatedAt, updatedAt: _prefUpdatedAt, ...preferencesWithoutIds } = preferencesData;

        console.log("Check 3");
        const input = {
            name: context.user.name,
            email: context.user.email,
            ...userProfileWithoutIds,
            ...preferencesWithoutIds
        }

        console.log("Check 4");
        const res = await fetch(`${process.env.AI_SERVICE_URL}/job-search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(input),
        });

        console.log("Check 5");
        const { message } = await res.json();
        if (!res.ok) {
            throw new Error(message || "Failed to extract resume details");
        }

        console.log("Check 6");
        return {
            message: "Job search completed successfully",
        };
    });