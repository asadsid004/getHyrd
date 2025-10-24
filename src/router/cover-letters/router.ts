import { db } from "@/db/drizzle";
import { coverLetterAnalyses, coverLetters, userProfiles } from "@/db/schema";
import { authed } from "@/middlewares/auth";
import { aiCoverLetterAnalyzeSchema, AnalyseCoverLetterFileData, analyseCoverLetterFileData, analyseCoverLetterText } from "@/service/cover-letter/analyse";
import { CoverLetter } from "@/service/cover-letter/create";
import { CoverLetterSchema, optimizeCoverLetterAnalysisBased, optimizeCoverLetterFromFile, optimizeCoverLetterTextData } from "@/service/cover-letter/optimize";
import { eq } from "drizzle-orm";
import { z } from "zod";

type LetterDetails = {
    recipientName: string;
    recipientPosition: string;
    company: string;
    senderName: string;
    senderEmail: string;
    senderPhone: string;
    salutation: string;
    subject: string;
    content: string;
    closingStatement: string;
};


export const getCoverLetters = authed
    .route({
        method: "GET",
        path: "/cover-letters",
        summary: "Get all user cover letters",
        tags: ["cover-letters"]
    })
    .output(z.array(z.object({
        id: z.string(),
        title: z.string(),
        content: z.string(),
        recipientCompany: z.string().nullable(),
        recipientPosition: z.string().nullable(),
        recipientName: z.string().nullable(),
        jobDescription: z.string().nullable(),
        subject: z.string().nullable(),
        salutation: z.string().nullable(),
        closingStatement: z.string().nullable(),
        senderName: z.string().nullable(),
        score: z.number().nullable(),
        createdAt: z.date(),
        updatedAt: z.date(),
    })))
    .handler(async ({ context }) => {
        const rawData = await db
            .select({
                id: coverLetters.id,
                title: coverLetters.title,
                content: coverLetters.content,
                recipientCompany: coverLetters.recipientCompany,
                recipientPosition: coverLetters.recipientPosition,
                recipientName: coverLetters.recipientName,
                subject: coverLetters.subject,
                salutation: coverLetters.salutation,
                closingStatement: coverLetters.closingStatement,
                senderName: coverLetters.senderName,
                score: coverLetters.score,
                createdAt: coverLetters.createdAt,
                updatedAt: coverLetters.updatedAt,
            })
            .from(coverLetters)
            .where(eq(coverLetters.userId, context.user.id))
            .orderBy(coverLetters.createdAt);

        return rawData.map(coverLetter => ({
            id: coverLetter.id,
            title: coverLetter.title,
            content: coverLetter.content,
            recipientCompany: coverLetter.recipientCompany,
            recipientPosition: coverLetter.recipientPosition,
            recipientName: coverLetter.recipientName,
            jobDescription: null,
            subject: coverLetter.subject,
            salutation: coverLetter.salutation,
            closingStatement: coverLetter.closingStatement,
            senderName: coverLetter.senderName,
            score: coverLetter.score,
            createdAt: coverLetter.createdAt ?? new Date(),
            updatedAt: coverLetter.updatedAt ?? new Date(),
        }));
    });

export const getCoverLetter = authed
    .route({
        method: "GET",
        path: "/cover-letters/:id",
        summary: "Get cover letter by id",
        tags: ["cover-letters"]
    })
    .input(z.object({
        id: z.string(),
    }))
    .output(z.object({
        id: z.string(),
        title: z.string(),
        content: z.string(),
        recipientCompany: z.string().nullable(),
        recipientPosition: z.string().nullable(),
        recipientName: z.string().nullable(),
        jobDescription: z.string().nullable(),
        subject: z.string().nullable(),
        salutation: z.string().nullable(),
        closingStatement: z.string().nullable(),
        senderName: z.string().nullable(),
        senderEmail: z.string().nullable(),
        senderPhone: z.string().nullable(),
        createdAt: z.date(),
        updatedAt: z.date(),
    }))
    .handler(async ({ input, context }) => {
        const { id } = input;

        const coverLetter = await db
            .select({
                id: coverLetters.id,
                userId: coverLetters.userId,
                title: coverLetters.title,
                content: coverLetters.content,
                recipientCompany: coverLetters.recipientCompany,
                recipientPosition: coverLetters.recipientPosition,
                recipientName: coverLetters.recipientName,
                subject: coverLetters.subject,
                salutation: coverLetters.salutation,
                closingStatement: coverLetters.closingStatement,
                senderName: coverLetters.senderName,
                senderEmail: coverLetters.senderEmail,
                senderPhone: coverLetters.senderPhone,
                createdAt: coverLetters.createdAt,
                updatedAt: coverLetters.updatedAt,
            })
            .from(coverLetters)
            .where(eq(coverLetters.id, id))
            .limit(1);

        if (!coverLetter.length) {
            throw new Error("Cover letter not found");
        }

        // Verify ownership
        if (coverLetter[0].userId !== context.user.id) {
            throw new Error("Unauthorized");
        }

        return {
            id: coverLetter[0].id,
            title: coverLetter[0].title,
            content: coverLetter[0].content,
            recipientCompany: coverLetter[0].recipientCompany,
            recipientPosition: coverLetter[0].recipientPosition,
            recipientName: coverLetter[0].recipientName,
            jobDescription: null,
            subject: coverLetter[0].subject,
            salutation: coverLetter[0].salutation,
            closingStatement: coverLetter[0].closingStatement,
            senderName: coverLetter[0].senderName,
            senderEmail: coverLetter[0].senderEmail,
            senderPhone: coverLetter[0].senderPhone,
            createdAt: coverLetter[0].createdAt ?? new Date(),
            updatedAt: coverLetter[0].updatedAt ?? new Date(),
        };
    });

export const createCoverLetter = authed
    .route({
        method: "POST",
        path: "/cover-letters",
        summary: "Create cover letter",
        tags: ["cover-letters"]
    })
    .input(z.object({
        title: z.string(),
        recipientCompany: z.string().optional(),
        recipientPosition: z.string().optional(),
        recipientName: z.string().optional(),
        jobDescription: z.string().optional(),
        salutation: z.string().optional(),
        senderName: z.string().optional(),
    }))
    .output(z.object({
        id: z.string(),
    }))
    .handler(async ({ input, context }) => {
        const { title, recipientCompany, recipientPosition, recipientName, jobDescription, salutation, senderName } = input;

        if (!title) {
            throw new Error("Title is required");
        }

        const userData = await db.select().from(userProfiles).where(eq(userProfiles.userId, context.user.id))

        const inputData = {
            ...userData,
            name: context.user.name,
            email: context.user.email
        }

        const { subject, content, closingStatement } = (await CoverLetter({
            title,
            recipientCompany,
            recipientPosition,
            recipientName,
            jobDescription,
            resumeData: inputData,
        })).object;

        const [coverLetter] = await db.insert(coverLetters).values({
            userId: context.user.id,
            title,
            content,
            recipientCompany: recipientCompany || null,
            recipientPosition: recipientPosition || null,
            recipientName: recipientName || null,
            subject: subject || null,
            salutation: salutation || null,
            closingStatement: closingStatement || null,
            senderName: senderName || null,
            senderEmail: context.user.email
        }).returning();

        return { id: coverLetter.id };
    });

export const updateCoverLetter = authed
    .route({
        method: "PATCH",
        path: "/cover-letters/:id",
        summary: "Update cover letter",
        tags: ["cover-letters"]
    })
    .input(z.object({
        id: z.string(),
        title: z.string().optional(),
        content: z.string().optional(),
        recipientCompany: z.string().nullable().optional(),
        recipientPosition: z.string().nullable().optional(),
        recipientName: z.string().nullable().optional(),
        subject: z.string().nullable().optional(),
        salutation: z.string().nullable().optional(),
        closingStatement: z.string().nullable().optional(),
        senderName: z.string().nullable().optional(),
        senderEmail: z.string().nullable().optional(),
        senderPhone: z.string().nullable().optional(),
    }))
    .handler(async ({ input, context }) => {
        const { id, ...updates } = input;

        // Verify ownership
        const existing = await db
            .select({ userId: coverLetters.userId })
            .from(coverLetters)
            .where(eq(coverLetters.id, id))
            .limit(1);

        if (!existing.length || existing[0].userId !== context.user.id) {
            throw new Error("Cover letter not found or unauthorized");
        }

        await db
            .update(coverLetters)
            .set({
                ...updates,
                updatedAt: new Date(),
            })
            .where(eq(coverLetters.id, id));

        return { success: true };
    });

export const deleteCoverLetter = authed
    .route({
        method: "DELETE",
        path: "/cover-letters/:id",
        summary: "Delete cover letter",
        tags: ["cover-letters"]
    })
    .input(z.object({
        id: z.string(),
    }))
    .handler(async ({ input, context }) => {
        const { id } = input;

        // Verify ownership
        const existing = await db
            .select({ userId: coverLetters.userId })
            .from(coverLetters)
            .where(eq(coverLetters.id, id))
            .limit(1);

        if (!existing.length || existing[0].userId !== context.user.id) {
            throw new Error("Cover letter not found or unauthorized");
        }

        await db
            .delete(coverLetters)
            .where(eq(coverLetters.id, id));

        return { success: true };
    });

export const analyseCoverLetterFromFile = authed
    .route({
        method: "POST",
        path: "/cover-letters/:id/analyse-file",
        summary: "Analyse cover letter from file",
        tags: ["cover-letters"]
    })
    .input(z.object({
        role: z.string(),
        description: z.string(),
        coverLetterData: z.string(),
    }))
    .output(z.object({
        id: z.string(),
    }))
    .handler(async ({ input, context }) => {
        const { role, description, coverLetterData } = input;

        if (!role || !description || !coverLetterData) {
            throw new Error("Invalid input");
        }

        const analysedData = await analyseCoverLetterFileData(role, description, coverLetterData);

        const { extractedSections, ...rest } = analysedData.object as AnalyseCoverLetterFileData;

        console.log("Analysed cover letter", analysedData.object);

        return await db.transaction(async (tx) => {
            const [coverLetter] = await tx
                .insert(coverLetters)
                .values({
                    userId: context.user.id,
                    title: "Analysed cover letter",
                    content: JSON.stringify(rest),
                    recipientCompany: extractedSections.company,
                    recipientPosition: extractedSections.recipientPosition,
                    recipientName: extractedSections.recipientName,
                    subject: extractedSections.subject,
                    salutation: extractedSections.salutation,
                    closingStatement: extractedSections.closingStatement,
                    senderName: extractedSections.sender,
                    score: rest.overallScore
                })
                .returning();

            await tx.insert(coverLetterAnalyses)
                .values({
                    coverLetterId: coverLetter.id,
                    role,
                    description,
                    analysis: rest
                })
                .returning()

            return {
                id: coverLetter.id,
            };
        });
    });

export const analyseCoverLetterFromText = authed
    .route({
        method: "POST",
        path: "/cover-letters/:id/analyse-text",
        summary: "Analyse cover letter from text",
        tags: ["cover-letters"]
    })
    .input(z.object({
        role: z.string(),
        description: z.string(),
        coverLetterId: z.string(),
    }))
    .handler(async ({ input }) => {
        const { role, description, coverLetterId } = input;

        if (!role || !description || !coverLetterId) {
            throw new Error("Invalid input");
        }

        const coverLetter = await db.select().from(coverLetters).where(eq(coverLetters.id, coverLetterId)).limit(1);

        if (!coverLetter.length) {
            throw new Error("Cover letter not found");
        }

        const analysedData = await analyseCoverLetterText(role, description, coverLetter[0].content);

        const analysis = analysedData.object as AnalyseCoverLetterFileData;

        console.log("Analysed cover letter", analysedData.object);

        await db.insert(coverLetterAnalyses)
            .values({
                coverLetterId,
                role,
                description,
                analysis
            })

        await db.update(coverLetters)
            .set({
                score: analysis.overallScore
            })
            .where(eq(coverLetters.id, coverLetterId));
    });

export const getCoverLetterAnalyses = authed
    .route({
        method: "GET",
        path: "/cover-letters/:id/analyses",
        summary: "Get analyses for a cover letter",
        tags: ["cover-letters"]
    })
    .input(z.object({
        id: z.string(),
    }))
    .output(z.object({
        role: z.string(),
        analysis: aiCoverLetterAnalyzeSchema,
        createdAt: z.date().nullable()
    }).nullable())
    .handler(async ({ input }) => {
        const { id } = input;

        const analyses = await db
            .select()
            .from(coverLetterAnalyses)
            .where(eq(coverLetterAnalyses.coverLetterId, id))
            .orderBy(coverLetterAnalyses.createdAt)
            .limit(1)

        if (!analyses.length) {
            return null;
        }

        const data = {
            role: analyses[0].role,
            analysis: analyses[0].analysis as AnalyseCoverLetterFileData,
            createdAt: analyses[0].createdAt as Date
        }

        return data;
    });

export const optimizeCoverLetterFromFileData = authed
    .route({
        method: "POST",
        path: "/cover-letters/:id/optimize-file",
        summary: "Optimize cover letter from file",
        tags: ["cover-letters"]
    })
    .input(z.object({
        role: z.string(),
        description: z.string(),
        coverLetterData: z.string(),
    }))
    .output(z.object({
        id: z.string(),
    }))
    .handler(async ({ input, context }) => {
        const { role, description, coverLetterData } = input;

        if (!role || !description || !coverLetterData) {
            throw new Error("Invalid input");
        }

        const optimizedData = await optimizeCoverLetterFromFile(role, description, coverLetterData);

        const rest = optimizedData.object as LetterDetails;

        console.log("Optimized cover letter", rest);


        const [coverLetter] = await db
            .insert(coverLetters)
            .values({
                userId: context.user.id,
                title: input.role,
                content: rest.content,
                recipientCompany: rest.company,
                recipientPosition: rest.recipientPosition,
                recipientName: rest.recipientName,
                subject: rest.subject,
                salutation: rest.salutation,
                closingStatement: rest.closingStatement,
                senderName: rest.senderName,
                senderEmail: rest.senderEmail,
                senderPhone: rest.senderPhone,
            })
            .returning();

        return {
            id: coverLetter.id,
        };
    });

export const optimizeCoverLetterFromText = authed
    .route({
        method: "POST",
        path: "/cover-letters/:id/optimize-text",
        summary: "Optimize cover letter from text",
        tags: ["cover-letters"]
    })
    .input(z.object({
        role: z.string(),
        description: z.string(),
        coverLetterId: z.string(),
    }))
    .handler(async ({ input, context }) => {
        const { role, description, coverLetterId } = input;

        if (!role || !description || !coverLetterId) {
            throw new Error("Invalid input");
        }

        const coverLetter = await db.select().from(coverLetters).where(eq(coverLetters.id, coverLetterId)).limit(1);

        if (!coverLetter.length) {
            throw new Error("Cover letter not found");
        }

        const coverLetterData = {
            id: coverLetter[0].id,
            title: coverLetter[0].title,
            content: coverLetter[0].content,
            recipientCompany: coverLetter[0].recipientCompany,
            recipientPosition: coverLetter[0].recipientPosition,
            recipientName: coverLetter[0].recipientName,
            jobDescription: null,
            subject: coverLetter[0].subject,
            salutation: coverLetter[0].salutation,
            closingStatement: coverLetter[0].closingStatement,
            senderName: coverLetter[0].senderName,
            senderEmail: coverLetter[0].senderEmail as string,
            senderPhone: coverLetter[0].senderPhone as string,
            createdAt: coverLetter[0].createdAt || new Date(),
            updatedAt: coverLetter[0].updatedAt || new Date(),
        };

        const optimizedData = await optimizeCoverLetterTextData(role, description, coverLetterData);

        const rest = optimizedData.object as LetterDetails;

        console.log("Optimized cover letter", optimizedData.object);

        await db
            .update(coverLetters)
            .set({
                userId: context.user.id,
                title: input.role,
                content: rest.content,
                recipientCompany: rest.company,
                recipientPosition: rest.recipientPosition,
                recipientName: rest.recipientName,
                subject: rest.subject,
                salutation: rest.salutation,
                closingStatement: rest.closingStatement,
                senderName: rest.senderName,
                senderEmail: rest.senderEmail,
                senderPhone: rest.senderPhone,
            })
    });

export const optimizeCoverLetterBasedonAnalysis = authed
    .route({
        method: "POST",
        path: "/cover-letters/:id/optimize-analysis",
        summary: "Optimize cover letter based on analysis",
        tags: ["cover-letters"]
    })
    .input(z.object({
        coverLetterId: z.string(),
        analysisData: aiCoverLetterAnalyzeSchema,
        coverLetterData: z.object({
            ...CoverLetterSchema.shape,
            title: z.string(),
            id: z.string(),
            content: z.string(), // Override to make required
            recipientCompany: z.string().nullable(),
            recipientPosition: z.string().nullable(),
            recipientName: z.string().nullable(),
            subject: z.string().nullable(),
            salutation: z.string().nullable(),
            closingStatement: z.string().nullable(),
            senderName: z.string().nullable(),
            jobDescription: z.string().nullable(),
            senderEmail: z.string(),
            senderPhone: z.string(),
            createdAt: z.date(),
            updatedAt: z.date(),
        }),
    }))
    .handler(async ({ input, context }) => {
        const { coverLetterId, analysisData, coverLetterData } = input;

        if (!coverLetterId || !analysisData || !coverLetterData) {
            throw new Error("Invalid input");
        }

        const optimizedData = await optimizeCoverLetterAnalysisBased(coverLetterData, analysisData);

        const rest = optimizedData.object as LetterDetails;

        console.log("Optimized cover letter", optimizedData.object);

        await db
            .update(coverLetters)
            .set({
                userId: context.user.id,
                title: coverLetterData.title,
                content: rest.content,
                recipientCompany: rest.company,
                recipientPosition: rest.recipientPosition,
                recipientName: rest.recipientName,
                subject: rest.subject,
                salutation: rest.salutation,
                closingStatement: rest.closingStatement,
                senderName: rest.senderName,
                senderEmail: rest.senderEmail,
                senderPhone: rest.senderPhone,
            })
    });