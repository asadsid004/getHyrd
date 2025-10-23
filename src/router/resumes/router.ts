import { db } from "@/db/drizzle";
import { resumes, resumeData } from "@/db/schema";
import { authed } from "@/middlewares/auth";
import { eq } from "drizzle-orm";
import { z } from "zod";

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
