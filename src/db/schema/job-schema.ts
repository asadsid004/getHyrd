import { pgTable, text, varchar, integer, boolean, timestamp, jsonb, uuid } from "drizzle-orm/pg-core";
import { jobTypeEnum, jobModeEnum } from "./preferences-schema";
import { user } from "./auth-schema";

export const jobs = pgTable("jobs", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").references(() => user.id).notNull(),

    // Basic Info
    title: text("title").notNull(),
    company: text("company").notNull(),
    location: text("location").notNull(),
    type: jobTypeEnum("type").notNull(),
    mode: jobModeEnum("mode").notNull(),

    // Requirements & Description
    description: text("description").notNull(),
    responsibilities: jsonb("responsibilities").$type<string[]>(),
    requirements: jsonb("requirements").$type<string[]>(),
    skills: jsonb("skills").$type<string[]>(),

    // Salary and Experience
    minSalary: integer("min_salary"),
    maxSalary: integer("max_salary"),
    salaryCurrency: varchar("salary_currency", { length: 10 }).default("USD"),
    experienceLevel: varchar("experience_level", { length: 50 }).default("mid"), // junior, mid, senior

    // Meta Info
    industry: varchar("industry", { length: 100 }),
    postedAt: timestamp("posted_at").defaultNow(),
    deadline: timestamp("deadline"),
    isActive: boolean("is_active").default(true),
    source: varchar("source", { length: 100 }).default("internal"), // internal, LinkedIn, etc.
    url: text("url"), // external link to job posting

    // Tags & AI Context
    keywords: jsonb("keywords").$type<string[]>(),
});
