import { db } from "@/db/drizzle";
import { jobs } from "@/db/schema";
import { authed } from "@/middlewares/auth";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const getJobs = authed
    .route({
        method: "GET",
        path: "/jobs",
        summary: "Get all active jobs",
        tags: ["jobs"]
    })
    .output(z.array(z.object({
        id: z.string(),
        title: z.string(),
        company: z.string(),
        location: z.string(),
        type: z.string(),
        mode: z.string(),
        description: z.string(),
        minSalary: z.number().nullable(),
        maxSalary: z.number().nullable(),
        salaryCurrency: z.string().nullable(),
        experienceLevel: z.string().nullable(),
        industry: z.string().nullable(),
        postedAt: z.date().nullable(),
        deadline: z.date().nullable(),
        skills: z.any().transform(val => val || []),
    })))
    .handler(async () => {
        const jobsData = await db
            .select({
                id: jobs.id,
                title: jobs.title,
                company: jobs.company,
                location: jobs.location,
                type: jobs.type,
                mode: jobs.mode,
                description: jobs.description,
                minSalary: jobs.minSalary,
                maxSalary: jobs.maxSalary,
                salaryCurrency: jobs.salaryCurrency,
                experienceLevel: jobs.experienceLevel,
                industry: jobs.industry,
                postedAt: jobs.postedAt,
                deadline: jobs.deadline,
                skills: jobs.skills,
            })
            .from(jobs)
            .where(eq(jobs.isActive, true))
            .orderBy(jobs.postedAt);

        return jobsData;
    });
