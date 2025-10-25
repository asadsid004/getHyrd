import { db } from "@/db/drizzle";
import { interviewAttempts, questionResponses, interviews } from "@/db/schema/interview-schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { generateInterviewQuiz } from "@/service/interview/create";
import { saveInterviewWithQuestions, getInterviewWithQuestions } from "./helpers";
import { authed } from "@/middlewares/auth";
import { interviewSchema, interviewWithQuestionsSchema } from "./schema";


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

export const submitAttempt = authed
    .route({
        method: "POST",
        path: "/interview/submit",
        description: "Submit interview answers",
        tags: ["interview"],
    })
    .input(z.object({
        interviewId: z.string(),
        answers: z.record(z.string(), z.string()), // questionId -> selected option letter (A/B/C/D)
    }))
    .output(z.object({
        score: z.number(),
        total: z.number(),
        correctAnswers: z.number(),
        incorrectAnswers: z.number(),
        unanswered: z.number(),
    }))
    .handler(async ({ input, context }) => {
        const userId = context.user.id;
        const { interviewId, answers } = input;

        // Get interview with questions
        const interview = await getInterviewWithQuestions(interviewId);

        if (!interview) {
            throw new Error("Interview not found");
        }

        if (interview.userId !== userId) {
            throw new Error("Unauthorized: This interview belongs to another user");
        }

        if (interview.attempt) {
            throw new Error("Interview already attempted");
        }

        let correctCount = 0;
        let incorrectCount = 0;
        let unansweredCount = 0;
        const responses = [];

        console.log("=== Processing Answers ===");
        console.log("Answers received:", answers);

        for (const question of interview.questions) {
            const selectedOptionLetter = answers[question.id]; // "A", "B", "C", "D", or undefined

            // Handle unanswered questions
            if (!selectedOptionLetter || selectedOptionLetter.trim() === "") {
                console.log(`Question ${question.id}: UNANSWERED`);
                unansweredCount++;
                responses.push({
                    attemptId: "", // Will be filled after creating attempt
                    questionId: question.id,
                    selectedOption: "", // Empty string for unanswered
                    isCorrect: 0,
                });
                continue;
            }

            // Get the full text of the selected answer based on the letter
            const selectedAnswerText = question[`option${selectedOptionLetter}` as keyof typeof question] as string;

            // Handle case where selected option letter doesn't exist (invalid input)
            if (!selectedAnswerText) {
                console.warn(`Invalid option letter "${selectedOptionLetter}" for question ${question.id}`);
                incorrectCount++;
                responses.push({
                    attemptId: "",
                    questionId: question.id,
                    selectedOption: selectedOptionLetter,
                    isCorrect: 0,
                });
                continue;
            }

            // Compare the selected answer text with the correct answer text stored in DB
            const isCorrect = selectedAnswerText === question.correctOption;

            if (isCorrect) {
                correctCount++;
            } else {
                incorrectCount++;
            }

            console.log(`Question ${question.order}:`, {
                questionId: question.id,
                selectedOptionLetter,
                selectedAnswerText,
                correctOptionText: question.correctOption,
                isCorrect,
            });

            responses.push({
                attemptId: "",
                questionId: question.id,
                selectedOption: selectedOptionLetter, // Store the letter (A/B/C/D)
                isCorrect: isCorrect ? 1 : 0,
            });
        }

        console.log("=== Summary ===");
        console.log("Correct:", correctCount);
        console.log("Incorrect:", incorrectCount);
        console.log("Unanswered:", unansweredCount);
        console.log("Total:", interview.questions.length);

        // Create attempt record
        const [attempt] = await db
            .insert(interviewAttempts)
            .values({
                interviewId,
                userId,
                score: correctCount,
                totalQuestions: interview.questions.length,
                completedAt: new Date(),
            })
            .returning();

        // Insert all question responses with the attempt ID
        const responsesToInsert = responses.map(resp => ({
            ...resp,
            attemptId: attempt.id,
        }));

        if (responsesToInsert.length > 0) {
            await db.insert(questionResponses).values(responsesToInsert);
        }

        // Update interview as attempted
        await db
            .update(interviews)
            .set({
                isAttempted: true,
                score: correctCount,
                correctAnswers: correctCount,
            })
            .where(eq(interviews.id, interviewId));

        return {
            score: correctCount,
            total: interview.questions.length,
            correctAnswers: correctCount,
            incorrectAnswers: incorrectCount,
            unanswered: unansweredCount,
        };
    });