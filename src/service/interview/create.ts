import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

export const quizSchema = z.object({
    questions: z.array(
        z.object({
            question: z
                .string()
                .describe("The interview question to test the candidate's knowledge"),
            options: z
                .array(z.string())
                .length(4)
                .describe("Four possible answer choices (A, B, C, D)"),
            correctOption: z
                .string()
                .describe("The correct answer from the options"),
            explanation: z
                .string()
                .describe("Brief explanation of why this answer is correct"),
        })
    ),
});

export type QuizType = z.infer<typeof quizSchema>;

export async function generateInterviewQuiz({
    topic,
    description,
    difficulty,
    numQuestions,
}: {
    topic: string;
    description?: string;
    difficulty: "easy" | "medium" | "hard";
    numQuestions: number;
}): Promise<QuizType> {
    const result = await generateObject({
        model: google("gemini-2.0-flash-exp"),
        schema: quizSchema,
        temperature: 0.7,
        prompt: `You are an expert technical interviewer creating a multiple-choice quiz to assess interview readiness.

**QUIZ PARAMETERS:**
Topic: ${topic}
${description ? `Context: ${description}` : ""}
Difficulty: ${difficulty}
Number of Questions: ${numQuestions}

**DIFFICULTY GUIDELINES:**
- Easy: Fundamental concepts, definitions, and basic scenarios that entry-level candidates should know
- Medium: Practical applications, common problems, and intermediate concepts requiring some experience
- Hard: Advanced scenarios, edge cases, system design, and expert-level problem-solving

**QUESTION REQUIREMENTS:**
1. Each question must be clear, specific, and relevant to ${topic}
2. Questions should test practical interview knowledge, not just memorization
3. Avoid ambiguous wording or trick questions
4. Cover diverse aspects of the topic (don't repeat similar concepts)
5. For coding topics: include scenarios, best practices, and conceptual understanding
6. For non-technical topics: focus on real-world application and decision-making

**ANSWER OPTIONS:**
- Provide exactly 4 options per question
- Make all options plausible to avoid obvious answers
- Ensure only ONE option is definitively correct
- Avoid "all of the above" or "none of the above" unless truly necessary
- Options should be roughly similar in length and complexity

**EXPLANATIONS:**
- Keep explanations concise (2-3 sentences)
- Explain WHY the correct answer is right
- Optionally mention why other options are incorrect if helpful
- Use clear, professional language

**OUTPUT:**
Generate ${numQuestions} high-quality interview questions that would effectively assess a candidate's readiness for interviews on ${topic}.`,
    });

    return result.object;
}