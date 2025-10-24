import { ResumeSchema } from "@/router/onboarding/schema";
import { z } from "zod";
import { generateObject } from "ai";
import { google } from "../models/ai";

export const CoverLetter = async (input: {
    title: string;
    recipientCompany?: string;
    recipientPosition?: string;
    recipientName?: string;
    jobDescription?: string;
    resumeData: z.infer<typeof ResumeSchema>;
}) => {
    const {
        title,
        recipientCompany,
        recipientPosition,
        recipientName,
        jobDescription,
        resumeData,
    } = input;

    if (!title) throw new Error("Title is required");

    return await generateObject({
        model: google("gemini-2.5-flash"),
        schema: z.object({
            subject: z
                .string()
                .describe("Concise subject line (e.g., 'Application for Frontend Developer Role')"),
            content: z
                .string()
                .describe("Main body of the cover letter (3–5 paragraphs, no greetings or closings)"),
            closingStatement: z
                .string()
                .describe(
                    "A short 1–2 sentence closing remark expressing enthusiasm and openness to further discussion."
                ),
        }),
        prompt: `You are a professional HR writing assistant who crafts tailored cover letters that align perfectly with both the candidate’s experience and the target role.

Generate a structured JSON output containing:
- A strong **subject line** (clear, concise, aligned with the job title).
- Do not include the candidate name inside subject, content, closing statement.
- A **main body content** with 3–5 cohesive paragraphs (no greetings or closings) that reflect:
  - Motivation for the role and company.
  - Alignment of the candidate’s skills with the job description.
  - Key accomplishments or projects relevant to the position.
  - Professional tone, human flow, and authenticity.
- A **short closing statement** (e.g., “I’d welcome the opportunity to contribute to your team’s success.”)

Avoid filler phrases, exaggerated language, or repetition. Make it feel like the candidate genuinely wrote it, using their resume and the job description as context.

---

### Job Details
- **Title:** ${title}
- **Company:** ${recipientCompany || "N/A"}
- **Hiring Position:** ${recipientPosition || "N/A"}
- **Recruiter Name:** ${recipientName || "N/A"}
- **Job Description:** ${jobDescription || "N/A"}

### Candidate Resume Summary
${JSON.stringify(resumeData, null, 2)}

---

Respond **only** with the structured JSON object: { subject, content, closingStatement }`,
    });
};
