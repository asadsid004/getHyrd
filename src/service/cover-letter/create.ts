import { ResumeSchema } from "@/router/onboarding/schema";
import { z } from "zod";
import { generateText } from "ai";
import { google } from "../models/ai";


export const CoverLetter = async (input: {
    title: string;
    recipientCompany?: string;
    recipientPosition?: string;
    recipientName?: string;
    jobDescription?: string;
    resumeData: z.infer<typeof ResumeSchema>;
}) => {
    const { title, recipientCompany, recipientPosition, recipientName, jobDescription, resumeData } = input;

    if (!title) throw new Error("Title is required");

    return await generateText({
        model: google("gemini-2.5-flash"),
        prompt: `You are an expert professional writer and hiring advisor specializing in resume-based personalization.

Your task is to write the **main body content** of a professional, compelling cover letter tailored to both the candidate's resume and the target job.

⚠️ DO NOT include greetings ("Dear ...") or closings ("Sincerely", "Best regards", or the candidate’s name).

---

### OUTPUT REQUIREMENTS
- Generate **only the body content** (3–5 short paragraphs, ~150–250 words).
- Use a confident, sincere, and natural tone.
- Avoid generic filler phrases and clichés.
- Do not restate basic information like the candidate’s name, email, etc.
- Focus on *fit, achievements, motivation,* and *relevance to the job*.
- Reference specific skills, experience, or projects from the resume that are relevant to the given role and description.
- Flow smoothly between paragraphs — make it feel human-written.
- Ensure it aligns well with the **job description** while reflecting the candidate’s authentic background.
- The result should feel written *by the candidate*, not about them.

---

### INPUT DATA

**Job Details**
- Title: ${title}
- Company: ${recipientCompany || "N/A"}
- Hiring Position: ${recipientPosition || "N/A"}
- Recruiter Name: ${recipientName || "N/A"}
- Job Description:
${jobDescription || "N/A"}

**Candidate Resume Summary**
${JSON.stringify(resumeData, null, 2)}

---

Now generate only the main content paragraphs of a polished, professional, personalized cover letter.`,
    });
};
