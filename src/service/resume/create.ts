import { z } from "zod";
import { generateObject } from "ai";
import { google } from "../models/ai";

const ResumeSchema = z.object({
    name: z.string().optional().nullable(),
    email: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    linkedin: z.string().optional().nullable(),
    github: z.string().optional().nullable(),
    portfolio: z.string().optional().nullable(),
    summary: z.string().optional().nullable(),
    skills: z.array(z.string()).optional().nullable(),
    experience: z.array(
        z.object({
            company: z.string().optional().nullable(),
            position: z.string().optional().nullable(),
            startDate: z.string().optional().nullable(),
            endDate: z.string().optional().nullable(),
            description: z.string().optional().nullable(),
            achievements: z.array(z.string()).optional().nullable(),
        })
    ).optional().nullable(),
    projects: z.array(
        z.object({
            title: z.string().optional().nullable(),
            description: z.string().optional().nullable(),
            technologiesUsed: z.array(z.string()).optional().nullable(),
            highlights: z.array(z.string()).optional().nullable(),
            link: z.string().optional().nullable(),
        })
    ).optional().nullable(),
    education: z.array(
        z.object({
            school: z.string().optional().nullable(),
            degree: z.string().optional().nullable(),
            startDate: z.string().optional().nullable(),
            endDate: z.string().optional().nullable(),
            cgpaOrPercentage: z.string().optional().nullable(),
        })
    ).optional().nullable(),
    certifications: z.array(z.string()).optional().nullable(),
    achievements: z.array(z.string()).optional().nullable(),
    languages: z.array(z.string()).optional().nullable(),
    yearsOfExperience: z.number().optional().nullable(),
});

export const createResumeFromUserProfile = async (
    role: string,
    description: string,
    resumeData: z.infer<typeof ResumeSchema>
) => {
    // Create a clean summary focusing ONLY on content that should be optimized
    const optimizableContent = `
CONTENT TO OPTIMIZE:

Summary: ${resumeData.summary || "No summary provided"}

Experience Descriptions:
${resumeData.experience?.map((exp, i) => `
Position ${i + 1}: ${exp.position} at ${exp.company}
Current Description: ${exp.description || "No description"}
Current Achievements: ${exp.achievements?.join("; ") || "None listed"}
`).join("") || "No experience listed"}

Project Descriptions:
${resumeData.projects?.map((proj, i) => `
Project ${i + 1}: ${proj.title}
Current Description: ${proj.description || "No description"}
Current Highlights: ${proj.highlights?.join("; ") || "None"}
`).join("") || "No projects listed"}

Current Skills: ${resumeData.skills?.join(", ") || "Not listed"}
`.trim();

    const result = await generateObject({
        model: google("gemini-2.5-flash"),
        schema: ResumeSchema,
        temperature: 0.2, // Lower temperature for consistency
        prompt: `You are an expert resume optimizer. Optimize ONLY the text content for this ${role} role.

TARGET JOB:
Role: ${role}
Description: ${description}

${optimizableContent}

CRITICAL RULES - READ CAREFULLY:

1. YOU MUST PRESERVE EXACTLY AS-IS (DO NOT MODIFY):
   - All dates (startDate, endDate) - copy them EXACTLY
   - All names (person name, company names, school names) - copy EXACTLY
   - All contact information (email, phone, address, linkedin, github, portfolio) - copy EXACTLY
   - All degree names and titles - copy EXACTLY
   - All project links - copy EXACTLY
   - Array lengths - keep same number of items
   - Field structure - all fields must be present

2. WHAT YOU SHOULD OPTIMIZE (ONLY THESE):
   - summary: Rewrite to align with ${role}
   - experience[].description: Rewrite with action verbs and metrics
   - experience[].achievements: Rewrite to be more impactful
   - projects[].description: Rewrite to emphasize relevant tech
   - projects[].highlights: Rewrite to show impact
   - projects[].technologiesUsed: Reorder/add relevant technologies
   - skills: Reorder and add 2-3 relevant skills if needed

3. OPTIMIZATION GUIDELINES:
   - Use action verbs: Led, Developed, Implemented, Architected, Optimized
   - Add quantifiable metrics where possible (e.g., "40% improvement")
   - Match keywords from job description naturally
   - Keep descriptions concise but impactful
   - Focus on ${role} relevant achievements

4. OUTPUT FORMAT:
   - Return complete JSON with ALL fields from original resume
   - Even if a field is null/empty in original, include it as null
   - Maintain exact array lengths
   - No explanations, just the JSON

ORIGINAL RESUME DATA (USE THIS TO PRESERVE ALL NON-OPTIMIZABLE FIELDS):
${JSON.stringify(resumeData, null, 2)}

Now return the optimized resume maintaining ALL original structure and non-text fields.`,
    });

    // Post-processing: Force preservation of critical fields
    const optimized = result.object;

    // Force preserve all non-optimizable fields
    const preserved = {
        // Contact info - NEVER change
        name: resumeData.name,
        email: resumeData.email,
        phone: resumeData.phone,
        address: resumeData.address,
        linkedin: resumeData.linkedin,
        github: resumeData.github,
        portfolio: resumeData.portfolio,

        // Optimizable fields
        summary: optimized.summary ?? resumeData.summary,
        skills: optimized.skills ?? resumeData.skills,

        // Experience - preserve structure and dates
        experience: resumeData.experience?.map((origExp, idx) => {
            const optExp = optimized.experience?.[idx];
            return {
                company: origExp.company, // PRESERVE
                position: origExp.position, // PRESERVE
                startDate: origExp.startDate, // PRESERVE
                endDate: origExp.endDate, // PRESERVE
                description: optExp?.description || origExp.description, // OPTIMIZE
                achievements: optExp?.achievements || origExp.achievements, // OPTIMIZE
            };
        }) || null,

        // Projects - preserve structure and links
        projects: resumeData.projects?.map((origProj, idx) => {
            const optProj = optimized.projects?.[idx];
            return {
                title: origProj.title, // PRESERVE
                link: origProj.link, // PRESERVE
                description: optProj?.description || origProj.description, // OPTIMIZE
                technologiesUsed: optProj?.technologiesUsed || origProj.technologiesUsed, // OPTIMIZE
                highlights: optProj?.highlights || origProj.highlights, // OPTIMIZE
            };
        }) || null,

        // Education - preserve everything
        education: resumeData.education?.map((origEdu) => {
            return {
                school: origEdu.school, // PRESERVE
                degree: origEdu.degree, // PRESERVE
                startDate: origEdu.startDate, // PRESERVE
                endDate: origEdu.endDate, // PRESERVE
                cgpaOrPercentage: origEdu.cgpaOrPercentage, // PRESERVE
            };
        }) || null,

        // Other fields - preserve
        certifications: optimized.certifications || resumeData.certifications,
        achievements: optimized.achievements || resumeData.achievements,
        languages: optimized.languages || resumeData.languages,
        yearsOfExperience: resumeData.yearsOfExperience, // PRESERVE
    };

    return { object: preserved };
};