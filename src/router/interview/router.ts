import { authed } from "@/middlewares/auth";
import { z } from "zod";
import { generateInterviewQuiz } from "@/service/interview/create";
import { saveInterviewWithQuestions, getInterviewWithQuestions } from "./helpers";
import { interviewSchema, interviewWithQuestionsSchema } from "./schema";
import { db } from "@/db/drizzle";


export const createInterview = authed
    .route({
        method: "POST",
        path: "/interview/create",
        description: "Create a new interview",
        tags: ["interview"],
    })
    .input(z.object({
        topic: z.string().min(1, "Topic is required"),
        description: z.string().optional(),
        difficulty: z.enum(["easy", "medium", "hard"]),
        numQuestions: z.number().min(1).max(50),
        timeLimit: z.number().min(1), // in minutes
    }))
    .output(z.object({
        id: z.string(),
        message: z.string(),
    }))
    .handler(async ({ input, context }) => {
        const { topic, description, difficulty, numQuestions, timeLimit } = input;
        const userId = context.user.id; // Get user ID from authenticated context

        // Generate quiz using AI
        const quiz = await generateInterviewQuiz({
            topic,
            description,
            difficulty,
            numQuestions
        });

        if (!quiz) {
            throw new Error("Failed to generate quiz");
        }

        let genDesc = input.description ?? "";
        if (quiz.generalDescription && quiz.generalDescription !== "" && quiz.generalDescription !== null) {
            genDesc = quiz.generalDescription;
        }

        console.log("Quiz generated with", quiz.questions.length, "questions");
        console.log("General description:", genDesc);

        // Save interview to database
        const interview = await saveInterviewWithQuestions(
            userId,
            {
                topic,
                description,
                difficulty,
                numQuestions,
                timeLimit,
                genDesc,
            },
            quiz
        );

        console.log("Interview saved with ID:", interview.id);

        return {
            id: interview.id,
            message: `Interview created successfully with ${quiz.questions.length} questions`,
        };
    });

export const getInterviews = authed
    .route({
        method: "GET",
        path: "/interviews",
        description: "Get all interviews",
        tags: ["interview"],
    })
    .output(z.array(interviewSchema))
    .handler(async ({ context }) => {
        const userId = context.user.id;
        const interviews = await db.query.interviews.findMany({
            where: (interviews, { eq }) => eq(interviews.userId, userId),
        });
        return interviews;
    });

export const getInterview = authed
    .route({
        method: "GET",
        path: "/interview/:id",
        description: "Get an interview with questions",
        tags: ["interview"],
    })
    .input(z.object({
        id: z.string(),
    }))
    .output(interviewWithQuestionsSchema.nullable())
    .handler(async ({ input }) => {
        const { id } = input;
        const interview = await getInterviewWithQuestions(id);
        return interview ?? null;
    });