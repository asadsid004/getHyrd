import { z } from "zod";

export const interviewSchema = z.object({
    id: z.string(),
    userId: z.string(),
    topic: z.string(),
    description: z.string().nullable(),
    difficulty: z.enum(["easy", "medium", "hard"]),
    numQuestions: z.number().int(),
    timeLimit: z.number().int(),
    genDesc: z.string(),
    score: z.number().int(),
    correctAnswers: z.number().int(),
    isAttempted: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export const interviewQuestionSchema = z.object({
    id: z.string(),
    interviewId: z.string(),
    question: z.string(),
    optionA: z.string(),
    optionB: z.string(),
    optionC: z.string(),
    optionD: z.string(),
    correctOption: z.string(),
    explanation: z.string(),
    order: z.number().int(),
    createdAt: z.date(),
});

export const interviewAttemptSchema = z.object({
    id: z.string(),
    interviewId: z.string(),
    userId: z.string(),
    startedAt: z.date(),
    completedAt: z.date().nullable(),
    score: z.number().int().nullable(),
    totalQuestions: z.number().int(),
    timeTaken: z.number().int().nullable(),
});

export const interviewWithQuestionsSchema = interviewSchema.extend({
    questions: z.array(interviewQuestionSchema),
    attempt: interviewAttemptSchema.nullable(),
});