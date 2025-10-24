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
                name: z.string().describe("Name or title of the feedback"),
                message: z.string().describe("Description or actionable advice"),
            })
        )
        .describe("Detailed feedback for this category"),
});

export const aiCoverLetterAnalyzeSchema = z.object({
    overallScore: z
        .number()
        .min(0)
        .max(10)
        .describe("Overall score of the cover letter"),
    relevance: categorySchema.describe(
        "Analysis of how well the cover letter aligns with the job description and company"
    ),
    toneAndLanguage: categorySchema.describe(
        "Evaluation of the tone, professionalism, grammar, clarity, and word choice"
    ),
    structureAndFlow: categorySchema.describe(
        "Evaluation of how well the cover letter is organized and flows logically"
    ),
    personalization: categorySchema.describe(
        "Assessment of how effectively the cover letter is tailored to the company, recruiter, and job role"
    ),
    other: categorySchema.describe(
        "Any other observations or feedback not covered in the main categories"
    ),
});

export const aiCoverLetterFileAnalyzeSchema = z.object({
    ...aiCoverLetterAnalyzeSchema.shape,
    extractedSections: z.object({
        recipientName: z
            .string()
            .optional()
            .describe("Full name of the person the cover letter is addressed to (e.g., 'John Doe')."),
        recipientPosition: z
            .string()
            .optional()
            .describe("Job title or position of the recipient (e.g., 'Hiring Manager', 'HR Manager')."),
        company: z
            .string()
            .optional()
            .describe("Company name the candidate is applying to (e.g., 'Google', 'OpenAI')."),
        sender: z
            .string()
            .optional()
            .describe("Full name of the candidate sending the cover letter."),
        email: z
            .string()
            .optional()
            .describe("Email of the candidate sending the cover letter. Must remain unchanged."),
        phone: z
            .string()
            .optional()
            .describe("Phone number of the candidate sending the cover letter. Must remain unchanged."),
        salutation: z
            .string()
            .optional()
            .describe("Greeting or opening line of the cover letter (e.g., 'Dear Mr. Doe,' or 'Dear Hiring Manager,')."),
        subject: z
            .string()
            .optional()
            .describe("Subject line of the letter (e.g., 'Application for Software Engineer Role')."),
        content: z
            .string()
            .optional()
            .describe("The main body paragraphs of the cover letter excluding greeting and closing."),
        closingStatement: z
            .string()
            .optional()
            .describe("Final paragraph or sentence before the signature, expressing gratitude or interest."),
    }),
});

export type AnalyseCoverLetterTextData = z.infer<typeof aiCoverLetterAnalyzeSchema>;

export type AnalyseCoverLetterFileData = z.infer<typeof aiCoverLetterFileAnalyzeSchema>;

export const analyseCoverLetterText = async (
    role: string,
    description: string,
    coverLetterText: string,
) => {
    const prompt = `
You are an expert hiring manager and communication analyst who evaluates **cover letters** for job applications.

You will receive:
- The job role and description.
- The candidate's cover letter text.

Your goal is to **analyze the quality and effectiveness of the cover letter** based on hiring best practices.

---

### Job Information
${role ? `Role: ${role}` : ""}
${description ? `Description: ${description}` : ""}

### Candidate Cover Letter
${coverLetterText}

---

### Evaluation Categories

1. **relevance**
   - Does the letter clearly align with the job description and company’s values?
   - Does it highlight experiences or skills that fit the job well?

2. **toneAndLanguage**
   - Is the tone professional yet human?
   - Are grammar, clarity, and engagement strong?

3. **structureAndFlow**
   - Are paragraphs logically connected and easy to follow?
   - Does it have a strong opening, middle, and closing?

4. **personalization**
   - Does it feel genuinely written for this company and recruiter?
   - Are there references to the company or role that show research and intent?

5. **other**
   - Any additional improvement ideas, such as formatting, missing impact, or redundant phrasing.

---

### Output Format

For each category, provide:
- **score (1–10)**  
- **summary** — short overview  
- **feedback** — array of items:
  - **type:** "strength", "minor-improvement", or "major-improvement"
  - **name:** short label
  - **message:** specific, actionable feedback written as if addressing the candidate directly (“You could improve…”)

Finally, return:
- **overallScore (1–10)** summarizing the total quality.

- Don't judge the cover letter based on any dates included inside it.

The feedback should be:
- **Professional, helpful, and detailed**
- **Tailored to the given job**
- **Written as if speaking to the candidate**

Return **only structured JSON** according to the schema.
`;

    return generateObject({
        model: google("gemini-2.5-flash"),
        schema: aiCoverLetterAnalyzeSchema,
        prompt: prompt,
    });
};

export const analyseCoverLetterFileData = async (
    appliedRole: string,
    jobDescription: string,
    coverLetterData: string
) => {
    const coverLetterBuffer = Buffer.from(coverLetterData, "base64");

    return generateObject({
        model: google("gemini-2.5-flash"),
        schema: aiCoverLetterFileAnalyzeSchema,
        messages: [
            {
                role: "user",
                content: [
                    {
                        type: "file",
                        data: coverLetterBuffer.buffer,
                        mediaType: "application/pdf",
                    },
                ],
            },
        ],
        system: `
You are an expert hiring advisor and professional communication analyst.

You will receive a **cover letter** file written by a candidate applying for a job.  
Below is the job context provided for reference:

\`\`\`
Role: ${appliedRole || "N/A"}
Description: ${jobDescription || "N/A"}
\`\`\`

---

### 🧩 PART 1 — Extract Cover Letter Information

Carefully extract the following details from the letter:

- **recipientName** → The name of the recipient (e.g., "John Doe").
- **recipientPosition** → The job title or position of the recipient (e.g., "Hiring Manager", "Recruiter").
- **company** → The company name mentioned in the letter (e.g., "Google", "TechCorp").
- **sender** → The full name of the candidate sending the letter (usually found in the signature).
- **email** → The email of the candidate sending the letter (usually found in the signature).
- **phone** → The phone number of the candidate sending the letter (usually found in the signature).
- **salutation** → The greeting at the start (e.g., "Dear Mr. Doe," or "Dear Hiring Manager,").
- **subject** → The subject or heading line (e.g., "Application for Software Engineer Role").
- **content** → The main body paragraphs (between greeting and closing).
- **closingStatement** → The final paragraph or sentence before the signature.

If any detail is not explicitly mentioned, leave it blank or null.

---

### 🧠 PART 2 — Analyze the Cover Letter

Assess the cover letter across the following categories:

1. **professionalism**
   - Tone, grammar, politeness, and confidence.

2. **jobRelevance**
   - How well the content aligns with the provided job description and applied role.

3. **structureAndFlow**
   - Clarity, paragraph organization, transitions, and logical flow.

4. **personalization**
   - How specifically the letter is tailored to the company and recipient rather than generic.

5. **keywordAlignment**
   - Presence or absence of important role-specific terms.
   - Recommend missing keywords to improve recruiter or ATS alignment.

6. **other**
   - Any additional useful feedback (e.g., contact info missing, formatting issues, tone mismatches).

Each category must include:
- **score** (1–10)
- **summary** (short explanation)
- **feedback[]** (list of structured points with: type, name, message)

Finally, return:
- **overallScore** (1–10)
- **extractedSections** (the extracted metadata above)

- Don't judge the cover letter based on any dates included inside it.

---

### 🧾 Formatting & Tone Rules
- Return **only** a JSON object conforming to \`aiCoverLetterFileAnalyzeSchema\`.
- Do **not** include markdown, comments, or prose outside JSON.
- Write feedback as if directly addressing the candidate (“you”).
- Be specific, constructive, and concise.
- Stop as soon as the full structured JSON is complete.

`,
    });
};
