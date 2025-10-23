import { db } from "@/db/drizzle";
import { resumeData, resumes, resumeAnalyses, userProfiles } from "@/db/schema";
import { authed } from "@/middlewares/auth";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { ResumeSchema } from "../onboarding/schema";
import { aiAnalyzeSchema, analyseResumeFileData, analyseResumeTextData } from "@/service/resume/analyse";
import { optimizeResumeTextData, optimizeResumeAnalysisBasedData } from "@/service/resume/optimize";

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
        score: z.number().nullable(),
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
                score: resumes.score,
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
            score: resume.score,
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

export const analyseResumeFromFile = authed
    .route({
        method: "POST",
        path: "/resumes/:id/analyse",
        summary: "Analyse resume",
        tags: ["resumes"]
    })
    .input(z.object({
        role: z.string(),
        description: z.string(),
        resumeData: z.string(),
    }))
    .output(z.object({
        id: z.string(),
    }))
    .handler(async ({ input, context }) => {
        const { role, description, resumeData: resumeDataBase64 } = input;

        if (!role || !description || !resumeDataBase64) {
            throw new Error("Invalid input");
        }

        const apiInput = {
            fileName: "resume.pdf",
            mimeType: "application/pdf",
            data: resumeDataBase64
        }

        const extractResume = await fetch(`${process.env.AI_SERVICE_URL}/resume`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(apiInput),
        });

        const { message, result } = await extractResume.json();
        if (!extractResume.ok || !result) {
            throw new Error(message || "Failed to extract resume details");
        }

        console.log("Extracted resume", extractResume);

        // Analyse the resume data
        const analysedData = await analyseResumeFileData(role, description, resumeDataBase64);

        console.log("Analysed resume", analysedData);

        // Save analysis and update score in transaction
        return await db.transaction(async (tx) => {
            console.log("Transaction started");
            const userId = context.user.id;
            const updatedResult = {
                ...result,
                name: context.user.name,
                email: context.user.email,
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
                mimeType: 'application/pdf',
                isPrimary: false, // First resume during onboarding is always primary
                resumeDataId: rd.id as number,
            }).returning();

            console.log("Resume metadata created");


            // Save the analysis
            await tx.insert(resumeAnalyses).values({
                resumeId: resumeRecord.id,
                role,
                description,
                analysis: analysedData.object,
            });

            console.log("Analysis saved");

            // Update the resume score
            await tx
                .update(resumes)
                .set({
                    score: analysedData.object.overallScore,
                    updatedAt: new Date(),
                })
                .where(eq(resumes.id, resumeRecord.id));

            console.log("Resume score updated");

            return {
                id: resumeRecord.id,
            };
        });
    });

export const analyseResumeFromText = authed
    .route({
        method: "POST",
        path: "/resumes/:id/analyse-text",
        summary: "Analyse resume",
        tags: ["resumes"]
    })
    .input(z.object({
        resumeId: z.string(),
        role: z.string(),
        description: z.string(),
    }))
    .output(aiAnalyzeSchema)
    .handler(async ({ input }) => {
        const { role, description, resumeId } = input;

        if (!role || !description || !resumeId) {
            throw new Error("Invalid input");
        }

        const resume = await db.select().from(resumes).where(eq(resumes.id, resumeId)).limit(1);

        if (!resume.length) {
            throw new Error("Resume not found");
        }

        const resumeDataId = resume[0].resumeDataId;

        const resumeDataDB = await db.select().from(resumeData).where(eq(resumeData.id, resumeDataId)).limit(1);

        if (!resumeDataDB.length) {
            throw new Error("Resume data not found");
        }

        const resumeFullData = String(resumeDataDB[0].fullData);

        // Analyse the resume data
        const analysedData = await analyseResumeTextData(role, description, resumeFullData);

        console.log("Analysed resume", analysedData);

        // Save analysis and update score in transaction
        await db.transaction(async (tx) => {
            console.log("Transaction started");

            // Save the analysis
            await tx.insert(resumeAnalyses).values({
                resumeId: resumeId,
                role,
                description,
                analysis: analysedData.object,
            });

            console.log("Analysis saved");

            // Update the resume score
            await tx
                .update(resumes)
                .set({
                    score: analysedData.object.overallScore,
                    updatedAt: new Date(),
                })
                .where(eq(resumes.id, resumeId));

            console.log("Resume score updated");
        });

        return analysedData.object;
    });


export const getResumeAnalyses = authed
    .route({
        method: "GET",
        path: "/resumes/:id/analyses",
        summary: "Get analyses for a resume",
        tags: ["resumes"]
    })
    .input(z.object({
        id: z.string(),
    }))
    .output(z.array(z.object({
        id: z.string(),
        resumeId: z.string(),
        role: z.string(),
        description: z.string(),
        analysis: aiAnalyzeSchema,
        createdAt: z.date().nullable(),
    })))
    .handler(async ({ input, context }) => {
        const { id } = input;

        // Verify the resume belongs to the user
        const resume = await db
            .select({ id: resumes.id })
            .from(resumes)
            .where(and(eq(resumes.id, id), eq(resumes.userId, context.user.id)))
            .limit(1);

        if (!resume.length) {
            throw new Error("Resume not found");
        }

        const analyses = await db
            .select()
            .from(resumeAnalyses)
            .where(eq(resumeAnalyses.resumeId, id))
            .orderBy(resumeAnalyses.createdAt);

        return analyses;
    });

export const optimizeResumeFromFile = authed
    .route({
        method: "POST",
        path: "/resumes/:id/optimize",
        summary: "Optimize resume",
        tags: ["resumes"]
    })
    .input(z.object({
        role: z.string(),
        description: z.string(),
        resumeData: z.string(),
    }))
    .output(z.object({
        id: z.string(),
    }))
    .handler(async ({ input, context }) => {
        const { role, description, resumeData: resumeDataBase64 } = input;

        if (!role || !description || !resumeDataBase64) {
            throw new Error("Invalid input");
        }

        const apiInput = {
            fileName: "resume.pdf",
            mimeType: "application/pdf",
            data: resumeDataBase64
        }


        const extractResume = await fetch(`${process.env.AI_SERVICE_URL}/resume`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(apiInput),
        });

        const { message, result } = await extractResume.json();
        if (!extractResume.ok || !result) {
            throw new Error(message || "Failed to extract resume details");
        }

        console.log("Extracted resume", extractResume);

        // Analyse the resume data
        const optimizedResume = await optimizeResumeTextData(role, description, result);

        console.log("Analysed resume", optimizedResume);

        // Save analysis and update score in transaction
        return await db.transaction(async (tx) => {
            console.log("Transaction started");
            const userId = context.user.id;
            const updatedResult = {
                ...optimizedResume.object,
                name: context.user.name,
                email: context.user.email,
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
                mimeType: 'application/pdf',
                isPrimary: false, // First resume during onboarding is always primary
                resumeDataId: rd.id as number,
            }).returning();

            console.log("Resume metadata created");

            return { id: resumeRecord.id };
        });
    });

export const optimizeResumeFromText = authed
    .route({
        method: "POST",
        path: "/resumes/:id/optimize-text",
        summary: "Optimize resume from text",
        tags: ["resumes"]
    })
    .input(z.object({
        role: z.string(),
        description: z.string(),
        resumeId: z.string(),
    }))
    .handler(async ({ input, context }) => {
        const { role, description, resumeId } = input;

        if (!role || !description || !resumeId) {
            throw new Error("Invalid input");
        }

        const resume = await db.select().from(resumes).where(eq(resumes.id, resumeId)).limit(1);

        if (!resume.length) {
            throw new Error("Resume not found");
        }

        const resumeDataId = resume[0].resumeDataId;

        const resumeDataDB = await db.select().from(resumeData).where(eq(resumeData.id, resumeDataId)).limit(1);

        if (!resumeDataDB.length) {
            throw new Error("Resume data not found");
        }

        // Analyse the resume data
        const optimizedResume = await optimizeResumeTextData(role, description, resumeDataDB[0].fullData);

        console.log("Analysed resume", optimizedResume);

        // Save analysis and update score in transaction
        await db.transaction(async (tx) => {
            console.log("Transaction started");
            const updatedResult = {
                ...optimizedResume.object,
                name: context.user.name,
                email: context.user.email,
            }

            console.log("Updated result:", updatedResult);

            // Step 2: Save parsed resume data
            await tx.update(resumeData).set({
                fullData: updatedResult,
            }).where(eq(resumeData.id, resumeDataId)).returning();

            console.log("Resume data saved");

            console.log("Resume metadata created");
        });
    })

export const optimizeResumeAnalysisBased = authed
    .route({
        method: "POST",
        path: "/resumes/:id/optimize-text",
        summary: "Optimize resume from text",
        tags: ["resumes"]
    })
    .input(z.object({
        resumeId: z.string(),
        resumeData: ResumeSchema,
        analysisData: aiAnalyzeSchema,
    }))
    .handler(async ({ input }) => {
        const { resumeId, resumeData: resumeDataDB, analysisData } = input;

        if (!resumeDataDB || !analysisData) {
            throw new Error("Invalid input");
        }

        // Analyse the resume data
        const optimizedResume = await optimizeResumeAnalysisBasedData(resumeDataDB, analysisData);

        console.log("Analysed resume", optimizedResume);

        // Save analysis and update score in transaction
        await db.transaction(async (tx) => {
            console.log("Transaction started");

            // First, get the resume to find the resumeDataId
            const resume = await tx
                .select({ resumeDataId: resumes.resumeDataId })
                .from(resumes)
                .where(eq(resumes.id, resumeId))
                .limit(1);

            if (!resume.length) {
                throw new Error("Resume not found");
            }

            console.log("Updated result:", optimizedResume.object);

            // Step 2: Save parsed resume data
            await tx.update(resumeData).set({
                fullData: optimizedResume.object,
            }).where(eq(resumeData.id, resume[0].resumeDataId!)).returning();

            console.log("Resume data saved");

            console.log("Resume metadata created");
        });
    })

export const createResume = authed
    .route({
        method: "POST",
        path: "/resumes",
        summary: "Create resume",
        tags: ["resumes"]
    })
    .input(z.object({
        role: z.string(),
        description: z.string(),
    }))
    .output(z.object({
        id: z.string(),
    }))
    .handler(async ({ input, context }) => {
        const { role, description } = input;

        if (!role || !description) {
            throw new Error("Invalid input");
        }

        const userProfile = await db.select().from(userProfiles).where(eq(userProfiles.userId, context.user.id))

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id: id, userId: userId, ...remainingProfile } = userProfile[0]

        const inputProfile = {
            ...remainingProfile,
            yearsOfExperience: Number(remainingProfile.yearsOfExperience)
        }

        const optimizedResume = await optimizeResumeTextData(role, description, inputProfile);


        return await db.transaction(async (tx) => {
            console.log("Transaction started");
            const userId = context.user.id;
            const updatedResult = {
                ...optimizedResume.object,
                name: context.user.name,
                email: context.user.email,
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
                mimeType: 'application/pdf',
                isPrimary: false, // First resume during onboarding is always primary
                resumeDataId: rd.id as number,
            }).returning();

            console.log("Resume metadata created");

            return { id: resumeRecord.id };
        })
    })