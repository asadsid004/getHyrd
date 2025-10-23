import { boolean, integer, jsonb, pgTable, serial, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { relations } from "drizzle-orm";
import { z } from "zod";
import { aiAnalyzeSchema } from "../../service/resume/analyse";

export const resumes = pgTable("resumes", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").references(() => user.id).notNull(),

    fileName: text("file_name").notNull(),
    mimeType: text("mime_type").notNull(),
    uploadDate: timestamp("upload_date").defaultNow(),

    resumeDataId: serial("resume_data_id").references(() => resumeData.id),

    score: integer("score"),

    isPrimary: boolean("is_primary").default(false),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});


export const resumeData = pgTable("resume_data", {
    id: serial("id").primaryKey(),
    userId: text("user_id").references(() => user.id).notNull(),

    fullData: jsonb("full_data").$type<{
        name?: string | null;
        email?: string | null;
        phone?: string | null;
        address?: string | null;
        linkedin?: string | null;
        github?: string | null;
        portfolio?: string | null;
        summary?: string | null;
        skills?: string[] | null;
        experience?: {
            company?: string | null;
            position?: string | null;
            startDate?: string | null;
            endDate?: string | null;
            description?: string | null;
            achievements?: string[] | null;
        }[] | null;
        projects?: {
            title?: string | null;
            description?: string | null;
            technologiesUsed?: string[] | null;
            highlights?: string[] | null;
            link?: string | null;
        }[] | null;
        education?: {
            school?: string | null;
            degree?: string | null;
            startDate?: string | null;
            endDate?: string | null;
            cgpaOrPercentage?: string | null;
        }[] | null;
        certifications?: string[] | null;
        achievements?: string[] | null;
        languages?: string[] | null;
    }>().notNull(),

    createdAt: timestamp("created_at").defaultNow(),
});


export const resumeAnalyses = pgTable("resume_analyses", {
    id: uuid("id").defaultRandom().primaryKey(),
    resumeId: uuid("resume_id").references(() => resumes.id).notNull(),

    role: text("role").notNull(),
    description: text("description").notNull(),

    analysis: jsonb("analysis").$type<z.infer<typeof aiAnalyzeSchema>>().notNull(),

    createdAt: timestamp("created_at").defaultNow(),
});


export const resumesRelations = relations(resumes, ({ one, many }) => ({
    user: one(user, { fields: [resumes.userId], references: [user.id] }),
    resumeData: one(resumeData, {
        fields: [resumes.resumeDataId],
        references: [resumeData.id],
    }),
    analyses: many(resumeAnalyses),
}));

export const resumeDataRelations = relations(resumeData, ({ one }) => ({
    resume: one(resumes, {
        fields: [resumeData.id],
        references: [resumes.resumeDataId],
    }),
}));

export const resumeAnalysesRelations = relations(resumeAnalyses, ({ one }) => ({
    resume: one(resumes, {
        fields: [resumeAnalyses.resumeId],
        references: [resumes.id],
    }),
}));