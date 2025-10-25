import { authed } from "@/middlewares/auth";
import { ProfileSchema } from "./schema";
import { db } from "@/db/drizzle";
import { userProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";

// In src/router/profile/router.ts
export const getProfile = authed
    .route({
        method: "GET",
        path: "/profile",
        summary: "Get profile",
        tags: ["profile"]
    })
    .output(ProfileSchema)
    .handler(async ({ context }) => {
        const [profile] = await db
            .select()
            .from(userProfiles)
            .where(eq(userProfiles.userId, context.user.id))
            .limit(1);

        if (!profile) {
            throw new Error("Profile not found");
        }

        // Transform the database response to match the expected schema
        return {
            ...profile,
            yearsOfExperience: profile.yearsOfExperience ? Number(profile.yearsOfExperience) : null,
        };
    });

export const updateProfile = authed
    .route({
        method: "PUT",
        path: "/profile",
        summary: "Update profile",
        tags: ["profile"]
    })
    .input(ProfileSchema)
    .handler(async ({ context, input }) => {
        const [profile] = await db
            .select()
            .from(userProfiles)
            .where(eq(userProfiles.userId, context.user.id))
            .limit(1);

        if (!profile) {
            throw new Error("Profile not found");
        }

        await db
            .update(userProfiles)
            .set({
                phone: input.phone,
                address: input.address,
                linkedin: input.linkedin,
                github: input.github,
                portfolio: input.portfolio,
                summary: input.summary,
                skills: input.skills,
                experience: input.experience,
                projects: input.projects,
                education: input.education,
                certifications: input.certifications,
                achievements: input.achievements,
                languages: input.languages,
                yearsOfExperience: (input.yearsOfExperience || 0).toFixed(1),
            })
            .where(eq(userProfiles.userId, context.user.id));
    });