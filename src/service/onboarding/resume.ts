import { google } from "../models/ai";
import { generateObject } from 'ai';
import { ResumeSchema, type Resume } from "../../router/onboarding/schema";
import { z } from "zod";

type ExperienceItem = {
  company?: string | null;
  position?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  description?: string | null;
  achievements?: string[] | null;
};

type Experience = ExperienceItem[];

export function calculateExperienceYears(experience: Experience | null | undefined): number | null {
  if (!experience || experience.length === 0) return null;

  const parseDate = (str?: string | null) => {
    if (!str) return null;
    const clean = str.toLowerCase().trim();
    if (clean.includes('present') || clean.includes('current')) return new Date();
    const date = new Date(clean);
    return isNaN(date.getTime()) ? null : date;
  };

  let totalMonths = 0;
  for (const exp of experience) {
    const start = parseDate(exp.startDate);
    const end = parseDate(exp.endDate) || new Date();
    if (start && end && end > start) {
      const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
      totalMonths += months;
    }
  }

  const years = +(totalMonths / 12).toFixed(1);
  return years > 0 ? years : null;
}

export async function extractResumeWithGemini(text: string): Promise<Resume> {

  const prompt = `
You are a professional resume parser AI. Your job is to extract and normalize every possible piece of relevant structured data from the resume text.

Formatting Rules:
- Remove unnecessary newlines (\\n), tabs, or extra spaces. Combine broken lines into full sentences.
- Do NOT include markdown, explanations, or commentary.
- Ensure values like summary, project descriptions, and experience descriptions are clean readable paragraphs.
- Always return only a valid JSON object (no text outside JSON).

The extracted JSON must strictly follow this structure:

{
  "name": "string",
  "email": "string",
  "phone": "string",
  "address": "string",
  "linkedin": "string",
  "github": "string",
  "portfolio": "string",
  "summary": "string",
  "skills": ["string"],
  "experience": [
    {
      "company": "string",
      "position": "string",
      "startDate": "string",
      "endDate": "string",
      "description": "string",
      "achievements": ["string"]
    }
  ],
  "projects": [
    {
      "title": "string",
      "description": "string",
      "technologiesUsed": ["string"],
      "highlights": ["string"],
      "link": "string"
    }
  ],
  "education": [
    {
      "school": "string",
      "degree": "string",
      "startDate": "string",
      "endDate": "string",
      "cgpaOrPercentage": "string"
    }
  ],
  "certifications": ["string"],
  "achievements": ["string"],
  "languages": ["string"]
}

Resume text:
${text}
`;

  const response = await generateObject({
    model: google('gemini-2.5-flash'),
    schema: ResumeSchema,
    prompt: prompt,
  });

  return response.object;
}

export async function extractResumeTextWithGemini(fileName: string, data: string, mimeType: string) {

  try {

    if (!mimeType.includes('pdf')) {
      throw new Error('Only PDF files are supported');
    }

    const fileBuffer = Buffer.from(data, 'base64')

    if (fileBuffer.length === 0) {
      throw new Error('Empty file received');
    }

    const uint8Array = new Uint8Array(fileBuffer)

    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse(uint8Array)
    const pdfData = await parser.getText();
    const text = pdfData.text.trim();

    if (!text) {
      throw new Error('Unable to extract text from PDF');
    }

    const result: z.infer<typeof ResumeSchema> = await extractResumeWithGemini(text);

    const yearsOfExperience = calculateExperienceYears(result.experience);
    result.yearsOfExperience = yearsOfExperience;

    return { message: 'Resume extracted successfully', result: result };

  } catch (error) {
    console.error('Error extracting text from PDF', error)
    throw new Error('Failed to extract text from PDF');
  }

}

