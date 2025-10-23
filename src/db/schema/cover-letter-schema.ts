import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { relations } from "drizzle-orm";

export const coverLetters = pgTable("cover_letters", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").references(() => user.id).notNull(),

    title: text("title").notNull(),
    content: text("content").notNull(),

    // Recipient information
    recipientCompany: text("recipient_company"),
    recipientPosition: text("recipient_position"),
    recipientName: text("recipient_name"),

    // Job information
    jobDescription: text("job_description"),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const coverLettersRelations = relations(coverLetters, ({ one }) => ({
    user: one(user, { fields: [coverLetters.userId], references: [user.id] }),
}));
