import { generateObject } from "ai";
import { google } from "../models/ai";
import { z } from "zod";

const categorySchema = z.object({
    score: z.number().min(0).max(10).describe("Score of the category from 1-10"),
    summary: z.string().describe("Short summary of the category"),
    feedback: z
        .array(
            z.object({
                type: z.enum(["strength", "minor-improvement", "major-improvement"]),
                name: z.string().describe("Name of the feedback"),
                message: z.string().describe("Description of the feedback"),
            })
        )
        .describe("Specific feedback on positives and negatives"),
})

export const aiAnalyzeSchema = z.object({
    overallScore: z
        .number()
        .min(0)
        .max(10)
        .describe("Overall score of the resume"),
    ats: categorySchema.describe(
        "Analysis of how well the resume matches ATS requirements"
    ),
    jobMatch: categorySchema.describe(
        "Analysis of how well the resume matches the job requirements"
    ),
    writingAndFormatting: categorySchema.describe(
        "Analysis of the writing quality and formatting of the resume (taking into account the job requirements)"
    ),
    keywordCoverage: categorySchema.describe(
        "Analysis of the keyword coverage in the resume (taking into account the job requirements)"
    ),
    other: categorySchema.describe(
        "Any other relevant analysis not covered by the above categories"
    ),
})

export const analyseResumeFileData = async (role: string, description: string, resumeData: string) => {
    const resumeBuffer = Buffer.from(resumeData, "base64");

    return generateObject({
        model: google("gemini-2.5-flash"),
        schema: aiAnalyzeSchema,
        messages: [
            {
                role: "user",
                content: [
                    {
                        type: "file",
                        data: resumeBuffer.buffer,
                        mediaType: "application/pdf",
                    },
                ],
            },
        ],
        system: `You are an expert resume reviewer and hiring advisor.

You will receive a candidate's resume as a file in the user prompt. This resume is being used to apply for a job with the following information:

\`\`\`
${description ? `Description: ${description}` : ""}
${role ? `Role: ${role}` : ""}
\`\`\`

Your task is to evaluate the resume against the job requirements and provide structured feedback using the following categories:

1. **ats** - Analysis of how well the resume matches ATS (Applicant Tracking System) requirements.
   - Consider layout simplicity, use of standard section headings, avoidance of graphics or columns, consistent formatting, etc.

2. **jobMatch** - Analysis of how well the resume aligns with the job description and experience level.
   - Assess skills, technologies, achievements, and relevance.

3. **writingAndFormatting** - Analysis of the writing quality, tone, grammar, clarity, and formatting.
   - Comment on structure, readability, section organization, and consistency.
   - Be sure to consider the wording and formatting of the job description when evaluating the resume so you can recommend specific wording or formatting changes that would improve the resume's alignment with the job requirements.

4. **keywordCoverage** - Analysis of how well the resume includes keywords or terminology from the job description.
   - Highlight missing or well-used terms that might help with ATS matching and recruiter readability.
   - Be sure to consider the keywords used in the job description when evaluating the resume so you can recommend specific keywords that would improve the resume's alignment with the job requirements.

5. **other** - Any other relevant feedback not captured above.
   - This may include things like missing contact info, outdated technologies, major red flags, or career gaps.

For each category, return:
- \`score\` (1-10): A number rating the resume in that category.
- \`summary\`: A short, high-level summary of your evaluation.
- \`feedback\`: An array of structured feedback items:
  - \`type\`: One of \`"strength"\`, \`"minor-improvement"\`, or \`"major-improvement"\`
  - \`name\`: A label for the feedback item.
  - \`message\`: A specific and helpful explanation or recommendation.

Also return an overall score for the resume from 1-10 based on your analysis.

Only return the structured JSON response as defined by the schema. Do not include explanations, markdown, or extra commentary outside the defined format.

Other Guidelines:
- Tailor your analysis and feedback to the specific job description and experience level provided.
- Be clear, constructive, and actionable. The goal is to help the candidate improve their resume so it is ok to be critical.
- Refer to the candidate as "you" in your feedback. This feedback should be written as if you were speaking directly to the candidate.
- Stop generating output as soon you have provided the full feedback.
`,
    })
}

export const analyseResumeTextData = async (role: string, description: string, resumeText: string) => {
    return generateObject({
        model: google("gemini-2.5-flash"),
        schema: aiAnalyzeSchema,
        messages: [
            {
                role: "user",
                content: [
                    {
                        type: "text",
                        text: `
You are an expert resume reviewer and hiring advisor with deep understanding of ATS optimization, recruitment standards, and hiring psychology.

You will receive:
- A candidate's resume text (well-formatted for ATS systems, with clean headings and minimal visual clutter)
- A job role and its description

Your task is to **evaluate the resume text** against the job details and return a structured analysis using the provided schema.

---
**Job Information**
${role ? `Role: ${role}` : ""}
${description ? `Description: ${description}` : ""}
---

**Candidate Resume Text**
${resumeText}
---

### Evaluation Instructions:
Your analysis should be **objective, insightful, and helpful** for the candidate.  
The resume is already **ATS-compliant** (simple layout, standard headings, good formatting), so you can rate ATS-related criteria **realistically strong** (e.g., 8–10) without exaggerating or explicitly saying that it was instructed to do so.  
Instead, justify the high ATS score naturally by referencing its clarity, structure, keyword usage, and section consistency.

### Categories to Include:
1. **ats** — ATS optimization and formatting quality
2. **jobMatch** — Skill and experience alignment with the job
3. **writingAndFormatting** — Tone, readability, and organization
4. **keywordCoverage** — Keyword overlap with the job description
5. **other** — Any other constructive observations or red flags

Each category must include:
- \`score\` (1–10)
- \`summary\` (brief overview)
- \`feedback\` — array of objects:
  - \`type\`: "strength", "minor-improvement", or "major-improvement"
  - \`name\`: label for the issue or strength
  - \`message\`: detailed explanation or actionable advice

Finally, give an overall score (1–10) based on all factors.

Write feedback directly addressing the candidate ("you"), with clear, practical advice.  
Avoid unnecessary politeness or fluff — keep it professional and useful.

Return **only structured JSON** according to the schema — no Markdown, commentary, or prose.
            `,
                    },
                ],
            },
        ],
    });
};
