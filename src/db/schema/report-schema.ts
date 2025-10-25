import { pgTable, text, timestamp, uuid, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { interviews } from "./interview-schema";

// Interview Reports Table
export const interviewReports = pgTable("interview_reports", {
    id: uuid("id").defaultRandom().primaryKey(),
    interviewId: uuid("interview_id")
        .notNull()
        .references(() => interviews.id, { onDelete: "cascade" })
        .unique(), // One report per interview
    userId: text("user_id").notNull(),

    // Simple Analysis
    overallAnalysis: text("overall_analysis").notNull(),
    strengthsAnalysis: text("strengths_analysis").notNull(),
    weaknessesAnalysis: text("weaknesses_analysis").notNull(),
    improvementSuggestions: text("improvement_suggestions").notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Learning Resources Table
export const learningResources = pgTable("learning_resources", {
    id: uuid("id").defaultRandom().primaryKey(),
    reportId: uuid("report_id")
        .notNull()
        .references(() => interviewReports.id, { onDelete: "cascade" }),

    // Resource Details
    title: text("title").notNull(),
    description: text("description").notNull(),
    resourceType: text("resource_type").notNull(), // "video", "article", "pdf", "documentation", "course"
    url: text("url").notNull(),

    // Context
    topicCovered: text("topic_covered").notNull(), // What concept this resource teaches
    difficultyLevel: text("difficulty_level").notNull(), // "beginner", "intermediate", "advanced"
    estimatedTime: text("estimated_time"), // e.g., "15 minutes", "2 hours"

    // Ordering
    priority: integer("priority").notNull().default(0), // Higher priority = more important

    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const interviewReportsRelations = relations(interviewReports, ({ one, many }) => ({
    interview: one(interviews, {
        fields: [interviewReports.interviewId],
        references: [interviews.id],
    }),
    resources: many(learningResources),
}));

export const learningResourcesRelations = relations(learningResources, ({ one }) => ({
    report: one(interviewReports, {
        fields: [learningResources.reportId],
        references: [interviewReports.id],
    }),
}));

// Type exports
export type InterviewReport = typeof interviewReports.$inferSelect;
export type NewInterviewReport = typeof interviewReports.$inferInsert;
export type LearningResource = typeof learningResources.$inferSelect;
export type NewLearningResource = typeof learningResources.$inferInsert;