import { z } from "zod";
import { generateObject } from "ai";
import { google } from "../models/ai";
import { aiCoverLetterAnalyzeSchema } from "./analyse";
import { CoverLetterData } from "@/components/cover-letters/cover-letter-content-form";

// ✅ Updated schema with field descriptions
export const CoverLetterSchema = z.object({
    recipientName: z
        .string()
        .optional()
        .describe("Full name of the person the cover letter is addressed to (e.g., 'John Doe'). This should never be altered."),
    recipientPosition: z
        .string()
        .optional()
        .describe("Job title or position of the recipient (e.g., 'Hiring Manager', 'Recruiter'). Do not modify this."),
    company: z
        .string()
        .optional()
        .describe("Company name the candidate is applying to (e.g., 'Google'). Preserve exactly as provided."),
    senderName: z
        .string()
        .optional()
        .describe("Full name of the candidate sending the cover letter. Do not change."),
    senderEmail: z
        .string()
        .optional()
        .describe("Email of the candidate sending the cover letter. Must remain unchanged."),
    senderPhone: z
        .string()
        .optional()
        .describe("Phone number of the candidate sending the cover letter. Must remain unchanged."),
    salutation: z
        .string()
        .optional()
        .describe("Greeting line of the cover letter (e.g., 'Dear Mr. Doe,'). Should sound professional and relevant."),
    subject: z
        .string()
        .optional()
        .describe("Subject line of the cover letter (e.g., 'Application for Software Engineer Role'). Refine it for clarity and alignment with the job description."),
    content: z
        .string()
        .optional()
        .describe("Main body of the cover letter excluding greeting and closing. Optimize clarity, tone, and alignment with job requirements."),
    closingStatement: z
        .string()
        .optional()
        .describe("Final paragraph or closing sentence of the letter. Improve tone, confidence, and professionalism."),
});

const TCoverLetterSchema = z.object({
    recipientName: z
        .string()
        .describe("Full name of the person the cover letter is addressed to (e.g., 'John Doe'). This should never be altered."),
    recipientPosition: z
        .string()
        .describe("Job title or position of the recipient (e.g., 'Hiring Manager', 'Recruiter'). Do not modify this."),
    company: z
        .string()
        .describe("Company name the candidate is applying to (e.g., 'Google'). Preserve exactly as provided."),
    senderName: z
        .string()
        .describe("Full name of the candidate sending the cover letter. Do not change."),
    senderEmail: z
        .string()
        .describe("Email of the candidate sending the cover letter. Must remain unchanged."),
    senderPhone: z
        .string()
        .describe("Phone number of the candidate sending the cover letter. Must remain unchanged."),
    salutation: z
        .string()
        .describe("Greeting line of the cover letter (e.g., 'Dear Mr. Doe,'). Should sound professional and relevant."),
    subject: z
        .string()
        .describe("Subject line of the cover letter (e.g., 'Application for Software Engineer Role'). Refine it for clarity and alignment with the job description."),
    content: z
        .string()
        .describe("Main body of the cover letter excluding greeting and closing. Optimize clarity, tone, and alignment with job requirements."),
    closingStatement: z
        .string()
        .describe("Final paragraph or closing sentence of the letter. Improve tone, confidence, and professionalism."),
});

export const optimizeCoverLetterAnalysisBased = async (
    coverLetterData: CoverLetterData & {
        senderEmail: string;
        senderPhone: string;
    },
    analysisData: z.infer<typeof aiCoverLetterAnalyzeSchema>
) => {
    const optimizableContent = `
CONTENT TO OPTIMIZE:

Salutation: ${coverLetterData.salutation || "No salutation provided"}

Recipient Name: ${coverLetterData.recipientName || "Not specified"}
Recipient Position: ${coverLetterData.recipientPosition || "Not specified"}
Company: ${coverLetterData.recipientCompany || "Not specified"}

Subject: ${coverLetterData.subject || "No subject provided"}

Content:
${coverLetterData.content || "No content provided"}

Closing Statement:
${coverLetterData.closingStatement || "No closing statement provided"}
`.trim();

    const result = await generateObject({
        model: google("gemini-2.5-flash"),
        schema: CoverLetterSchema,
        temperature: 0.25,
        prompt: `
You are an AI professional cover letter editor and career writing specialist.

Your task is to **refine and optimize** the given cover letter using the provided analysis and context.

The goal is to:
- Improve tone, fluency, and relevance to the company and role.
- Align with professional standards.
- Maintain all factual details and structure.
- Return valid JSON matching the given schema.

---

### CONTEXT & ANALYSIS
${JSON.stringify(analysisData, null, 2)}

---

### COVER LETTER INPUT
${optimizableContent}

---

### STRICT INSTRUCTIONS

1. **DO NOT CHANGE**:
   - Names (recipient, sender)
   - Recipient’s position
   - Company name
   - Applicant’s contact info (email, phone)
   - General structure (salutation → subject → body → closing)

2. **OPTIMIZE ONLY THESE FIELDS**:
   - salutation → Make it sound natural and properly formatted.
   - subject → Ensure clarity and relevance to the role.
   - content → Rewrite for impact, relevance, and flow using analysis insights.
   - closingStatement → Strengthen tone, confidence, and call to action.
   - Do not include names in subject section

3. **STYLE REQUIREMENTS**:
   - Maintain professional and confident tone.
   - Use active voice.
   - Naturally integrate key job-related terms and metrics (from analysisData).
   - Personalize slightly toward company and recipient role.
   - Avoid clichés and unnecessary fluff.

4. **OUTPUT RULES**:
   - Output a complete JSON strictly matching the schema.
   - Do not omit or rename fields.
   - Keep all non-optimized values exactly as they were if not updated.
   - No explanations or commentary — just valid structured JSON.

---

REFERENCE (ORIGINAL COVER LETTER DATA):
${JSON.stringify(coverLetterData, null, 2)}

Now return the optimized cover letter JSON maintaining structure, correctness, and tone.
`,
    });

    const optimized = result.object;

    // Preserve non-optimizable fields exactly
    const preserved = {
        senderName: coverLetterData.senderName,
        senderEmail: coverLetterData.senderEmail,
        senderPhone: coverLetterData.senderPhone,
        recipientName: coverLetterData.recipientName,
        recipientPosition: coverLetterData.recipientPosition,
        company: coverLetterData.recipientCompany,
        salutation: optimized.salutation ?? coverLetterData.salutation,
        subject: optimized.subject ?? coverLetterData.subject,
        content: optimized.content ?? coverLetterData.content,
        closingStatement: optimized.closingStatement ?? coverLetterData.closingStatement,
    };

    return { object: preserved };
};

export const optimizeCoverLetterTextData = async (
    appliedRole: string,
    jobDescription: string,
    coverLetterData: CoverLetterData & {
        senderEmail: string;
        senderPhone: string;
    }
) => {
    // Build the input content string
    const inputContent = `
Salutation: ${coverLetterData.salutation || "N/A"}
Subject: ${coverLetterData.subject || "N/A"}
Main Content:
${coverLetterData.content || "No content provided"}
Closing Statement:
${coverLetterData.closingStatement || "No closing statement provided"}
`.trim();

    const result = await generateObject({
        model: google("gemini-2.5-flash"),
        schema: CoverLetterSchema,
        temperature: 0.25,
        prompt: `You are an expert career communication specialist. Your task is to optimize the language and tone of a cover letter to better align with a specific job role.

**CRITICAL: DO NOT modify or return these fields** (they will be preserved from the original):
- recipientName: ${coverLetterData.recipientName || "N/A"}
- recipientPosition: ${coverLetterData.recipientPosition || "N/A"}
- company: ${coverLetterData.recipientCompany || "N/A"}
- senderName: ${coverLetterData.senderName || "N/A"}
- senderEmail: ${coverLetterData.senderEmail || "N/A"}
- senderPhone: ${coverLetterData.senderPhone || "N/A"}

**TARGET JOB ROLE:** ${appliedRole || "Not specified"}

**JOB DESCRIPTION:**
${jobDescription || "No description provided"}

**CURRENT COVER LETTER CONTENT:**
${inputContent}

**YOUR TASK:**
Optimize ONLY the following fields by rewriting them to be more professional, confident, and aligned with the job requirements:

1. **salutation** - Make it professional and appropriately formal
2. **subject** - Create a clear, compelling subject line that references the role
3. **content** - Rewrite the main body to:
   - Sound more confident and professional
   - Highlight relevant skills from the job description
   - Use active voice and specific examples
   - Remove filler words and generic phrases
   - Maintain similar length (±10%)
   - Keep the same factual information (don't invent new experiences)
4. **closingStatement** - Strengthen the closing with confidence and clear next steps
5. Do not include names in subject section

**STYLE REQUIREMENTS:**
- Professional, confident, and concise tone
- Use active voice and first-person perspective
- Incorporate relevant keywords from the job description naturally
- Avoid clichés like "team player" or "think outside the box"
- Be specific rather than generic
- Maintain authenticity while enhancing impact

**OUTPUT FORMAT:**
Return ONLY these four optimized fields in JSON format:
{
  "salutation": "optimized greeting",
  "subject": "optimized subject line",
  "content": "optimized main body text",
  "closingStatement": "optimized closing paragraph"
}

Do not include any other commentary, markdown formatting, or fields. Return only valid JSON.`,
    });

    // Preserve all original fields and merge optimized ones
    const optimized = result.object;

    return {
        object: {
            // Preserved fields (never modified)
            recipientName: coverLetterData.recipientName,
            recipientPosition: coverLetterData.recipientPosition,
            company: coverLetterData.recipientCompany,
            senderName: coverLetterData.senderName,
            senderEmail: coverLetterData.senderEmail,
            senderPhone: coverLetterData.senderPhone,

            // Optimized fields (fallback to original if optimization fails)
            salutation: optimized.salutation || coverLetterData.salutation,
            subject: optimized.subject || coverLetterData.subject,
            content: optimized.content || coverLetterData.content,
            closingStatement: optimized.closingStatement || coverLetterData.closingStatement,
        }
    };
};

export const optimizeCoverLetterFromFile = async (
    appliedRole: string,
    jobDescription: string,
    coverLetterData: string
) => {
    const coverLetterBuffer = Buffer.from(coverLetterData, "base64");

    return generateObject({
        model: google("gemini-2.5-flash"),
        schema: TCoverLetterSchema,
        temperature: 0.25,
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
        system: `You are an expert career communication specialist. Your task is to extract information from a cover letter PDF and optimize its language to better align with a specific job role.

**TARGET JOB CONTEXT:**
Role: ${appliedRole || "Not specified"}
Description: ${jobDescription || "No description provided"}

---

### 📋 STEP 1: Extract Cover Letter Information

Read the PDF and extract these fields EXACTLY as they appear (do not modify):

- **recipientName** → Full name of the person addressed (e.g., "John Doe")
- **recipientPosition** → Job title of recipient (e.g., "Hiring Manager", "Senior Recruiter")
- **company** → Company name mentioned in the letter
- **sender** → Full name of the candidate (from signature or header)
- **email** → Candidate's email address
- **phone** → Candidate's phone number
- **salutation** → Opening greeting (e.g., "Dear Mr. Doe"), do not include ending ',' in it.
- **subject** → Subject line or heading (e.g., "Application for Software Engineer")
- **content** → Main body paragraphs (excluding greeting and closing)
- **closingStatement** → Final paragraph before signature

If any field is not present in the document, set it to null.
**NOTE: CLEARLY CHECK THE DOCUMENTS YOU HAVE MISSED MANY FIELDS MANY TIMES, INCLUDE ALL PRESENT FIELDS**
**YOU MISS ESPECIALLY WHEN THE DOCUMENT HAS LARGE AMOUNT OF TEXT**
**Especially check for content field, it is the most important field**
---

### ✍️ STEP 2: Optimize the Writing

After extraction, optimize ONLY these fields to improve alignment with the job:

**Fields to PRESERVE exactly (copy as-is):**
- recipientName
- recipientPosition  
- company
- sender
- email
- phone

**Fields to OPTIMIZE:**

1. **salutation**
   - Make it professional and appropriately formal
   - Use proper title if recipient name is known
   - Default to "Dear Hiring Manager," if no name

2. **subject**
   - Create a clear, specific subject line
   - Reference the exact role: "${appliedRole}"
   - Make it compelling and professional
   - Do not include names in subject section
   
3. **content**
   - Rewrite to sound more confident and professional
   - Strengthen alignment with the job description
   - Incorporate relevant keywords naturally from the job posting
   - Use active voice and specific examples
   - Remove filler words, clichés, and generic phrases
   - Maintain similar length (±15% of original)
   - Keep all factual information (don't invent experiences)
   - Structure clearly with strong opening, body, and transition to closing

4. **closingStatement**
   - Strengthen with confidence and clear call-to-action
   - Express enthusiasm for next steps
   - Remain professional and courteous

---

### 🎯 OPTIMIZATION GUIDELINES:

**Tone & Style:**
- Professional, confident, and concise
- First-person perspective with active voice
- Specific rather than generic
- Authentic while impactful

**Content Improvements:**
- Highlight skills/experiences relevant to the job description
- Use concrete examples and achievements
- Remove redundant phrases like "I am writing to apply..."
- Avoid clichés: "team player", "hit the ground running", "think outside the box"
- Match industry terminology from the job description
- Show enthusiasm without being overly casual

**What NOT to do:**
- Don't invent new qualifications or experiences
- Don't change factual statements about past roles
- Don't alter names, companies, or contact information
- Don't make the letter significantly longer
- Don't remove important details from the original

---

### 📤 OUTPUT FORMAT:

Return a valid JSON object with all fields:

{
  "recipientName": "exact name from PDF or null",
  "recipientPosition": "exact position from PDF or null",
  "company": "exact company from PDF or null",
  "sender": "exact sender name from PDF or null",
  "email": "exact email from PDF or null",
  "phone": "exact phone from PDF or null",
  "salutation": "optimized greeting",
  "subject": "optimized subject line",
  "content": "optimized main body - complete rewritten text",
  "closingStatement": "optimized closing paragraph"
}

Return ONLY the JSON object with no additional commentary, markdown, or explanations.`,
    });
};