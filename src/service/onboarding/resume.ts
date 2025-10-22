import { google } from "../models/ai";
import { generateObject } from 'ai';
import { ResumeSchema, type Resume } from "../../router/onboarding/schema";

type ExperienceItem = {
  company?: string | null;
  position?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  description?: string | null;
  achievements?: string[] | null;
};

type Experience = ExperienceItem[];

export function calculateExperienceYears(experience: Experience | undefined): number | null {
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

export function cleanResumeOutput(data: unknown): Resume {
  const cleanText = (value: unknown): unknown => {
    if (typeof value === "string") {
      return value.replace(/\s*\n\s*/g, " ").replace(/\s{2,}/g, " ").trim();
    }
    return value;
  };

  const recursiveClean = (obj: unknown): unknown => {
    if (Array.isArray(obj)) return obj.map(recursiveClean);
    if (typeof obj === "object" && obj !== null) {
      const cleaned: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(obj)) {
        cleaned[key] = recursiveClean(val);
      }
      return cleaned;
    }
    return cleanText(obj);
  };

  return recursiveClean(data) as Resume;
}

export async function extractResumeWithGemini(resumeFileName: string, resumeFileData: ArrayBuffer, resumeFileMimeType: string): Promise<Resume> {

  const prompt = `
You are a professional resume parser AI. Your job is to extract and normalize every possible piece of relevant structured data from the resume file.

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
`;

  console.log('Resume file received', { file: resumeFileName })

  const response = await generateObject({
    model: google('gemini-2.0-flash-lite'),
    messages: [
      {
        role: "user",
        content: [
          {
            type: "file",
            data: resumeFileData,
            mediaType: resumeFileMimeType,
          },
        ],
      },
    ],
    system: prompt,
    schema: ResumeSchema,
  });

  return response.object;
}


