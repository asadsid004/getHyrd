import { authed } from "@/middlewares/auth";
import { z } from "zod";
import { generateInterviewQuiz } from "@/service/interview/create";
import { saveInterviewWithQuestions } from "./helpers";

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

        console.log("Quiz generated with", quiz.questions.length, "questions");

        // Save interview to database
        const interview = await saveInterviewWithQuestions(
            userId,
            {
                topic,
                description,
                difficulty,
                numQuestions,
                timeLimit,
            },
            quiz
        );

        console.log("Interview saved with ID:", interview.id);

        return {
            id: interview.id,
            message: `Interview created successfully with ${quiz.questions.length} questions`,
        };
    });