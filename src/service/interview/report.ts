import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

const reportSchema = z.object({
    overallAnalysis: z.string().describe("Brief overall performance summary (2-3 sentences)"),
    strengthsAnalysis: z.string().describe("What the user did well (2-3 sentences)"),
    weaknessesAnalysis: z.string().describe("Areas that need improvement (2-3 sentences)"),
    improvementSuggestions: z.string().describe("3-4 specific actionable tips formatted as bullet points"),

    learningResources: z.array(z.object({
        title: z.string(),
        description: z.string().describe("Brief description of what this resource covers"),
        resourceType: z.enum(["video", "article", "pdf", "documentation", "course"]),
        url: z.string(),
        topicCovered: z.string().describe("Main topic/concept this resource teaches"),
        difficultyLevel: z.enum(["beginner", "intermediate", "advanced"]),
        estimatedTime: z.string().optional(),
        priority: z.number().min(1).max(10).describe("1-10, higher = more important to learn first"),
    })).min(4).max(8).describe("4-8 curated learning resources"),
});

export type GeneratedReport = z.infer<typeof reportSchema>;

export async function generateInterviewReport({
    topic,
    difficulty,
    totalQuestions,
    correctAnswers,
    incorrectQuestions,
}: {
    topic: string;
    difficulty: string;
    totalQuestions: number;
    correctAnswers: number;
    incorrectQuestions: Array<{
        question: string;
        correctAnswer: string;
        explanation: string;
    }>;
}) {
    const scorePercentage = Math.round((correctAnswers / totalQuestions) * 100);

    const result = await generateObject({
        model: google("gemini-2.0-flash-exp"),
        schema: reportSchema,
        temperature: 0.7,
        prompt: `You are an expert educator creating a personalized interview performance report.

**INTERVIEW DETAILS:**
- Topic: ${topic}
- Difficulty: ${difficulty}
- Score: ${correctAnswers}/${totalQuestions} (${scorePercentage}%)

**QUESTIONS MISSED:**
${incorrectQuestions.length > 0 ? incorrectQuestions.map((q, i) => `
${i + 1}. ${q.question}
   Correct Answer: ${q.correctAnswer}
   Explanation: ${q.explanation}
`).join('\n') : 'All questions answered correctly!'}

**YOUR TASK:**

1. **Overall Analysis** (2-3 sentences): Brief assessment of their performance considering the score and difficulty level. Be encouraging yet honest.

2. **Strengths Analysis** (2-3 sentences): What concepts they understood well based on their correct answers. Be specific about topics they mastered.

3. **Weaknesses Analysis** (2-3 sentences): Knowledge gaps based on incorrect answers. Focus on underlying concepts they're missing, not just listing wrong answers.

4. **Improvement Suggestions**: Give 3-4 specific, actionable tips. Format as bullet points. Make them concrete (e.g., "Practice implementing linked lists" not "Study more").

5. **Learning Resources**: Curate 4-8 high-quality resources that target the concepts they struggled with:
   
   **IMPORTANT - Resource Requirements:**
   - MUST be real, existing resources with valid URLs
   - Focus on the specific concepts they got wrong
   - Mix resource types: at least one video, one article, one hands-on resource
   - Prefer: YouTube (official channels, freeCodeCamp), MDN Web Docs, W3Schools, GeeksforGeeks, official documentation
   - Include difficulty level (beginner for fundamentals, intermediate/advanced for deeper topics)
   - Add estimated completion time
   - Set priority 1-10 (10 = most critical for their weak areas)
   
   **For topic "${topic}":**
   - Suggest practical, well-known resources
   - Focus on concepts they missed: ${incorrectQuestions.map(q => q.correctAnswer).join(', ')}

**TONE:** Professional, concise, encouraging. Focus on actionable next steps.

Return a JSON object following the schema.`,
    });

    return result.object;
}