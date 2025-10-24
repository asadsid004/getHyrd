import { db } from "@/db/drizzle";
import { coverLetters, userProfiles } from "@/db/schema";
import { authed } from "@/middlewares/auth";
import { CoverLetter } from "@/service/cover-letter/create";
import { eq } from "drizzle-orm";
import { z } from "zod";

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
        subject: z.string().nullable(),
        salutation: z.string().nullable(),
        closingStatement: z.string().nullable(),
        senderName: z.string().nullable(),
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
            subject: coverLetter.subject,
            salutation: coverLetter.salutation,
            closingStatement: coverLetter.closingStatement,
            senderName: coverLetter.senderName,
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
        subject: z.string().nullable(),
        salutation: z.string().nullable(),
        closingStatement: z.string().nullable(),
        senderName: z.string().nullable(),
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
            subject: coverLetter[0].subject,
            salutation: coverLetter[0].salutation,
            closingStatement: coverLetter[0].closingStatement,
            senderName: coverLetter[0].senderName,
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
