import { integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { relations } from "drizzle-orm";
import { aiCoverLetterAnalyzeSchema } from "../../service/cover-letter/analyse";
import { z } from "zod";

export const coverLetters = pgTable("cover_letters", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").references(() => user.id).notNull(),

    title: text("title").notNull(),
    content: text("content").notNull(),

    // Recipient information
    recipientCompany: text("recipient_company"),
    recipientPosition: text("recipient_position"),
    recipientName: text("recipient_name"),

    // Additional cover letter fields
    subject: text("subject"),
    salutation: text("salutation"),
    closingStatement: text("closing_statement"),

    senderName: text("sender_name"),
    senderEmail: text("sender_email"),
    senderPhone: text("sender_phone"),

    score: integer("score"),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const coverLetterAnalyses = pgTable("cover_letter_analyses", {
    id: uuid("id").defaultRandom().primaryKey(),

    coverLetterId: uuid("cover_letter_id")
        .references(() => coverLetters.id)
        .notNull(),

    role: text("role").notNull(),
    description: text("description").notNull(),

    analysis: jsonb("analysis")
        .$type<z.infer<typeof aiCoverLetterAnalyzeSchema>>()
        .notNull(),

    createdAt: timestamp("created_at").defaultNow(),
});


export const coverLettersRelations = relations(coverLetters, ({ one }) => ({
    user: one(user, { fields: [coverLetters.userId], references: [user.id] }),
    analyses: one(coverLetterAnalyses, {
        fields: [coverLetters.id],
        references: [coverLetterAnalyses.coverLetterId],
    }),
}));
