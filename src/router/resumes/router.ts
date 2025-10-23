import { db } from "@/db/drizzle";
import { resumeData, resumes } from "@/db/schema";
import { authed } from "@/middlewares/auth";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { ResumeSchema } from "../onboarding/schema";

export const getResumes = authed
    .route({
        method: "GET",
        path: "/resumes",
        summary: "Get all user resumes",
        tags: ["resumes"]
    })
    .output(z.array(z.object({
        id: z.string(),
        fileName: z.string(),
        mimeType: z.string(),
        uploadDate: z.date().nullable(),
        isPrimary: z.boolean(),
        createdAt: z.date(),
        updatedAt: z.date(),
        resumeData: z.object({
            name: z.string().nullable(),
            email: z.string().nullable(),
            phone: z.string().nullable(),
            summary: z.string().nullable(),
            skills: z.array(z.string()).nullable(),
        }).nullable(),
    })))
    .handler(async ({ context }) => {
        const rawData = await db
            .select({
                id: resumes.id,
                fileName: resumes.fileName,
                mimeType: resumes.mimeType,
                uploadDate: resumes.uploadDate,
                isPrimary: resumes.isPrimary,
                createdAt: resumes.createdAt,
                updatedAt: resumes.updatedAt,
                fullData: resumeData.fullData,
            })
            .from(resumes)
            .leftJoin(resumeData, eq(resumes.resumeDataId, resumeData.id))
            .where(eq(resumes.userId, context.user.id))
            .orderBy(resumes.createdAt);

        return rawData.map(resume => ({
            id: resume.id,
            fileName: resume.fileName,
            mimeType: resume.mimeType,
            uploadDate: resume.uploadDate,
            isPrimary: resume.isPrimary ?? false,
            createdAt: resume.createdAt ?? new Date(),
            updatedAt: resume.updatedAt ?? new Date(),
            resumeData: resume.fullData ? {
                name: resume.fullData.name || null,
                email: resume.fullData.email || null,
                phone: resume.fullData.phone || null,
                summary: resume.fullData.summary || null,
                skills: resume.fullData.skills || null,
            } : null,
        }));
    });

export const getResume = authed
    .route({
        method: "GET",
        path: "/resumes/:id",
        summary: "Get resume by id",
        tags: ["resumes"]
    })
    .input(z.object({
        id: z.string(),
    }))
    .output(ResumeSchema)
    .handler(async ({ input }) => {
        const { id } = input;

        const resume = await db
            .select({
                resumeDataId: resumes.resumeDataId
            })
            .from(resumes)
            .where(eq(resumes.id, id))
            .limit(1);

        if (!resume.length) {
            throw new Error("Resume not found");
        }

        const resumeFullData = await db
            .select(
                { fullData: resumeData.fullData }
            )
            .from(resumeData)
            .where(eq(resumeData.id, resume[0].resumeDataId!))
            .limit(1);

        if (!resumeFullData.length) {
            throw new Error("Resume data not found");
        }

        return resumeFullData[0].fullData;
    });


export const updateResumeData = authed
    .route({
        method: "PATCH",
        path: "/resumes/update",
        summary: "Update resume data",
        tags: ["resumes"]
    })
    .input(z.object({
        resumeId: z.string(),
        resumeData: z.object({
            name: z.string().nullable(),
            email: z.string().nullable(),
            phone: z.string().nullable(),
            address: z.string().nullable(),
            linkedin: z.string().nullable(),
            github: z.string().nullable(),
            portfolio: z.string().nullable(),
            summary: z.string().nullable(),
            skills: z.array(z.string()).nullable(),
            experience: z.array(z.object({
                company: z.string().nullable(),
                position: z.string().nullable(),
                startDate: z.string().nullable(),
                endDate: z.string().nullable(),
                description: z.string().nullable(),
                achievements: z.array(z.string()).nullable(),
            })).nullable(),
            projects: z.array(z.object({
                title: z.string().nullable(),
                description: z.string().nullable(),
                technologiesUsed: z.array(z.string()).nullable(),
                highlights: z.array(z.string()).nullable(),
                link: z.string().nullable(),
            })).nullable(),
            education: z.array(z.object({
                school: z.string().nullable(),
                degree: z.string().nullable(),
                startDate: z.string().nullable(),
                endDate: z.string().nullable(),
                cgpaOrPercentage: z.string().nullable(),
            })).nullable(),
            certifications: z.array(z.string()).nullable(),
            achievements: z.array(z.string()).nullable(),
            languages: z.array(z.string()).nullable(),
        })
    }))
    .handler(async ({ input }) => {
        const { resumeId, resumeData: fullData } = input;

        // First, get the resume to find the resumeDataId
        const resume = await db
            .select({ resumeDataId: resumes.resumeDataId })
            .from(resumes)
            .where(eq(resumes.id, resumeId))
            .limit(1);

        if (!resume.length) {
            throw new Error("Resume not found");
        }

        // Update the resume data
        await db
            .update(resumeData)
            .set({
                fullData: fullData,
            })
            .where(eq(resumeData.id, resume[0].resumeDataId!));

        return { success: true };
    });