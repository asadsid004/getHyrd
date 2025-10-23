import { z } from "zod";

export type Preferences = z.infer<typeof PreferencesSchema>;

export type Resume = z.infer<typeof ResumeSchema>;

export const normalizeString = (str: string) =>
    str.trim().toLowerCase().replace(/\s+/g, " ");

export const VoidSchema = z.void();

export const ResumeUploadSchema = z.object({
    fileName: z.string(),
    mimeType: z.string(),
    data: z.string(),
});

export const ResumeSchema = z.object({
    name: z.string().optional().nullable(),
    email: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    linkedin: z.string().optional().nullable(),
    github: z.string().optional().nullable(),
    portfolio: z.string().optional().nullable(),
    summary: z.string().optional().nullable(),
    skills: z.array(z.string()).optional().nullable(),
    experience: z.array(
        z.object({
            company: z.string().optional().nullable(),
            position: z.string().optional().nullable(),
            startDate: z.string().optional().nullable(),
            endDate: z.string().optional().nullable(),
            description: z.string().optional().nullable(),
            achievements: z.array(z.string()).optional().nullable(),
        })
    ).optional().nullable(),
    projects: z.array(
        z.object({
            title: z.string().optional().nullable(),
            description: z.string().optional().nullable(),
            technologiesUsed: z.array(z.string()).optional().nullable(),
            highlights: z.array(z.string()).optional().nullable(),
            link: z.string().optional().nullable(),
        })
    ).optional().nullable(),
    education: z.array(
        z.object({
            school: z.string().optional().nullable(),
            degree: z.string().optional().nullable(),
            startDate: z.string().optional().nullable(),
            endDate: z.string().optional().nullable(),
            cgpaOrPercentage: z.string().optional().nullable(),
        })
    ).optional().nullable(),
    certifications: z.array(z.string()).optional().nullable(),
    achievements: z.array(z.string()).optional().nullable(),
    languages: z.array(z.string()).optional().nullable(),
    yearsOfExperience: z.number().optional().nullable(),
});


export const ResumeExtractResponseSchema = z.object({
    message: z.string(),
    result: ResumeSchema,
});

export const PreferencesSchema = z
    .object({
        roles: z
            .array(z.string().min(1, "Role cannot be empty"))
            .min(1, "Add at least one job role")
            .max(10, "You can add up to 10 roles")
            .transform((arr) => {
                const filtered = arr.filter((role) => role.trim().length > 0);
                const lowerCaseMap = new Map<string, string>();
                filtered.forEach((role) => {
                    const trimmed = role.trim();
                    const key = normalizeString(trimmed);
                    if (!lowerCaseMap.has(key)) {
                        lowerCaseMap.set(key, trimmed);
                    }
                });

                return Array.from(lowerCaseMap.values());
            }),
        type: z
            .array(z.enum(["full-time", "part-time", "contract", "internship"]))
            .min(1, "Select at least one type")
            .transform((arr) => Array.from(new Set(arr))),
        mode: z
            .array(z.enum(["on-site", "remote", "hybrid"]))
            .min(1, "Select at least one mode")
            .transform((arr) => Array.from(new Set(arr))),
        location: z.array(z.string()).max(5, "You can add up to five locations"),
    })
    .refine(
        (data) => {
            // Only require locations if on-site or hybrid is selected AND remote is NOT the only option
            const hasOnSiteOrHybrid =
                data.mode.includes("on-site") || data.mode.includes("hybrid");
            const hasRemoteOnly =
                data.mode.length === 1 && data.mode.includes("remote");

            if (hasRemoteOnly) {
                return true; // No location required for remote-only
            }

            if (hasOnSiteOrHybrid) {
                return data.location && data.location.length > 0;
            }
            return true;
        },
        {
            message: "Add at least one location for On-site or Hybrid mode",
            path: ["location"],
        }
    );
