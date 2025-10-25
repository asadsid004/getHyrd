import { z } from "zod";

export type Profile = z.infer<typeof ProfileSchema>;

export const ProfileSchema = z.object({
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