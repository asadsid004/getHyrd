import { pgTable, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const jobTypeEnum = pgEnum("job_type", [
    "full-time",
    "part-time",
    "contract",
    "internship",
]);

export const jobModeEnum = pgEnum("job_mode", ["on-site", "remote", "hybrid"]);

export const jobPreferences = pgTable("job_preferences", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
        .notNull()
        .unique()
        .references(() => user.id, { onDelete: "cascade" }),
    roles: text("roles").array().notNull(),
    type: jobTypeEnum("type").array().notNull(),
    mode: jobModeEnum("mode").array().notNull(),
    location: text("location").array().notNull().default([]),
    // To be used for sorting or filtering jobs
    // postedAt: timestamp("posted_at").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
});

export type JobPreferences = typeof jobPreferences.$inferSelect;
export type NewJobPreferences = typeof jobPreferences.$inferInsert;