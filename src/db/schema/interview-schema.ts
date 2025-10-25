import { pgTable, text, timestamp, integer, uuid, pgEnum, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./auth-schema";

// Enum for difficulty levels
export const difficultyEnum = pgEnum("difficulty", ["easy", "medium", "hard"]);

// Main interviews table
export const interviews = pgTable("interviews", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").references(() => user.id).notNull(),
    topic: text("topic").notNull(),
    description: text("description"),
    difficulty: difficultyEnum("difficulty").notNull().default("medium"),
    numQuestions: integer("num_questions").notNull(),
    timeLimit: integer("time_limit").notNull(), // in minutes
    genDesc: text("gen_desc").notNull(),
    score: integer("score").notNull().default(0),
    correctAnswers: integer("correct_answers").notNull().default(0),
    isAttempted: boolean("is_attempted").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Questions table (linked to interviews)
export const interviewQuestions = pgTable("interview_questions", {
    id: uuid("id").defaultRandom().primaryKey(),
    interviewId: uuid("interview_id")
        .notNull()
        .references(() => interviews.id, { onDelete: "cascade" }),
    question: text("question").notNull(),
    optionA: text("option_a").notNull(),
    optionB: text("option_b").notNull(),
    optionC: text("option_c").notNull(),
    optionD: text("option_d").notNull(),
    correctOption: text("correct_option").notNull(), // Store "A", "B", "C", or "D"
    explanation: text("explanation").notNull(),
    order: integer("order").notNull(), // For maintaining question order
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Optional: Store user attempts/results
export const interviewAttempts = pgTable("interview_attempts", {
    id: uuid("id").defaultRandom().primaryKey(),
    interviewId: uuid("interview_id")
        .notNull()
        .references(() => interviews.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    startedAt: timestamp("started_at").defaultNow().notNull(),
    completedAt: timestamp("completed_at"),
    score: integer("score"), // Number of correct answers
    totalQuestions: integer("total_questions").notNull(),
    timeTaken: integer("time_taken"), // in seconds
});

// Optional: Store individual question responses
export const questionResponses = pgTable("question_responses", {
    id: uuid("id").defaultRandom().primaryKey(),
    attemptId: uuid("attempt_id")
        .notNull()
        .references(() => interviewAttempts.id, { onDelete: "cascade" }),
    questionId: uuid("question_id")
        .notNull()
        .references(() => interviewQuestions.id, { onDelete: "cascade" }),
    selectedOption: text("selected_option").notNull(), // "A", "B", "C", or "D"
    isCorrect: integer("is_correct").notNull(), // 1 for correct, 0 for incorrect (using integer as boolean)
});

// Relations
export const interviewsRelations = relations(interviews, ({ one, many }) => ({
    questions: many(interviewQuestions),
    attempt: one(interviewAttempts),
}));

export const interviewQuestionsRelations = relations(interviewQuestions, ({ one, many }) => ({
    interview: one(interviews, {
        fields: [interviewQuestions.interviewId],
        references: [interviews.id],
    }),
    responses: many(questionResponses),
}));

export const interviewAttemptsRelations = relations(interviewAttempts, ({ one, many }) => ({
    interview: one(interviews, {
        fields: [interviewAttempts.interviewId],
        references: [interviews.id],
    }),
    responses: many(questionResponses),
}));

export const questionResponsesRelations = relations(questionResponses, ({ one }) => ({
    attempt: one(interviewAttempts, {
        fields: [questionResponses.attemptId],
        references: [interviewAttempts.id],
    }),
    question: one(interviewQuestions, {
        fields: [questionResponses.questionId],
        references: [interviewQuestions.id],
    }),
}));

// Type exports for TypeScript
export type Interview = typeof interviews.$inferSelect;
export type NewInterview = typeof interviews.$inferInsert;
export type InterviewQuestion = typeof interviewQuestions.$inferSelect;
export type NewInterviewQuestion = typeof interviewQuestions.$inferInsert;
export type InterviewAttempt = typeof interviewAttempts.$inferSelect;
export type NewInterviewAttempt = typeof interviewAttempts.$inferInsert;
export type QuestionResponse = typeof questionResponses.$inferSelect;
export type NewQuestionResponse = typeof questionResponses.$inferInsert;