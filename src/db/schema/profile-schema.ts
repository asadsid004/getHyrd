import { pgTable, jsonb, text, timestamp, uuid, numeric } from "drizzle-orm/pg-core";

import { user } from "./auth-schema";
import { relations } from "drizzle-orm";
import { resumes } from "./resume-schema";

export const userProfiles = pgTable('user_profiles', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }).unique(),

    phone: text('phone'),
    address: text('address'),
    linkedin: text('linkedin'),
    github: text('github'),
    portfolio: text('portfolio'),

    // Professional summary
    summary: text('summary'),

    // Array fields stored as JSONB
    skills: jsonb('skills').$type<string[]>().default([]),
    certifications: jsonb('certifications').$type<string[]>().default([]),
    achievements: jsonb('achievements').$type<string[]>().default([]),
    languages: jsonb('languages').$type<string[]>().default([]),

    // Complex nested data
    experience: jsonb('experience').$type<Array<{
        company?: string | null;
        position?: string | null;
        startDate?: string | null;
        endDate?: string | null;
        description?: string | null;
        achievements?: string[] | null;
    }>>().default([]),

    projects: jsonb('projects').$type<Array<{
        title?: string | null;
        description?: string | null;
        technologiesUsed?: string[] | null;
        highlights?: string[] | null;
        link?: string | null;
    }>>().default([]),

    education: jsonb('education').$type<Array<{
        school?: string | null;
        degree?: string | null;
        startDate?: string | null;
        endDate?: string | null;
        cgpaOrPercentage?: string | null;
    }>>().default([]),

    yearsOfExperience: numeric("years_of_experience", { precision: 4, scale: 1 })
        .default("0.0")
        .notNull(),

    primaryResumeId: uuid("primary_resume_id"),

    // Track which resume last updated this profile
    //   lastUpdatedFromResumeId: uuid('last_updated_from_resume_id'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}
    // , (table) => [
    //     index('user_profiles_user_id_idx').on(table.userId),
    //     index('user_profiles_primary_resume_id_idx').on(table.primaryResumeId),
    // ]
);

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
    user: one(user, { fields: [userProfiles.userId], references: [user.id] }),
    primaryResume: one(resumes, {
        fields: [userProfiles.primaryResumeId],
        references: [resumes.id],
    }),
}));

export type UserProfile = typeof userProfiles.$inferSelect;