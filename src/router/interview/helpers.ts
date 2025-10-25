import { db } from "@/db/drizzle"; // Your Drizzle instance
import type { QuizType } from "@/service/interview/create";
import { eq } from "drizzle-orm";
import { interviews, interviewQuestions, interviewAttempts, questionResponses } from "@/db/schema";

export async function saveInterviewWithQuestions(
    userId: string,
    interviewData: {
        topic: string;
        description?: string;
        difficulty: "easy" | "medium" | "hard";
        numQuestions: number;
        timeLimit: number;
        genDesc: string
    },
    quiz: QuizType
) {
    // Insert interview
    const [interview] = await db
        .insert(interviews)
        .values({
            userId,
            topic: interviewData.topic,
            description: interviewData.description,
            difficulty: interviewData.difficulty,
            numQuestions: interviewData.numQuestions,
            timeLimit: interviewData.timeLimit,
            genDesc: interviewData.genDesc,
            score: 0,
            correctAnswers: 0,
        })
        .returning();

    // Insert questions
    const questionsToInsert = quiz.questions.map((q, index) => ({
        interviewId: interview.id,
        question: q.question,
        optionA: q.options[0],
        optionB: q.options[1],
        optionC: q.options[2],
        optionD: q.options[3],
        correctOption: q.correctOption,
        explanation: q.explanation,
        order: index + 1,
    }));

    await db.insert(interviewQuestions).values(questionsToInsert);

    return interview;
}

// Get interview with all questions
export async function getInterviewWithQuestions(interviewId: string) {
    return await db.query.interviews.findFirst({
        where: (interviews, { eq }) => eq(interviews.id, interviewId),
        with: {
            questions: {
                orderBy: (questions, { asc }) => [asc(questions.order)],
            },
            attempt: true,
        },
    });
}

// Start an attempt
export async function startInterviewAttempt(
    userId: string,
    interviewId: string,
    totalQuestions: number
) {
    const [attempt] = await db
        .insert(interviewAttempts)
        .values({
            userId,
            interviewId,
            totalQuestions,
        })
        .returning();

    return attempt;
}

// Submit a question response
export async function submitQuestionResponse(
    attemptId: string,
    questionId: string,
    selectedOption: string,
    correctOption: string
) {
    const isCorrect = selectedOption === correctOption ? 1 : 0;

    await db.insert(questionResponses).values({
        attemptId,
        questionId,
        selectedOption,
        isCorrect,
    });

    return isCorrect;
}

// Complete an attempt
export async function completeInterviewAttempt(
    attemptId: string,
    score: number,
    timeTaken: number
) {
    await db
        .update(interviewAttempts)
        .set({
            completedAt: new Date(),
            score,
            timeTaken,
        })
        .where(eq(interviewAttempts.id, attemptId));
}