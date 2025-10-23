import { extractResume, savePreferences } from "./onboarding/router";
import { jobSearch } from "./job-search/router";
import { getJobs } from "./jobs/router";
import { getResumes, updateResumeData, getResume, analyseResumeFromFile, optimizeResumeFromFile, getResumeAnalyses, analyseResumeFromText, optimizeResumeFromText, optimizeResumeAnalysisBased, createResume } from "./resumes/router";

/**
 * Contains all orpc routes
 */
export const router = {
    onboarding: {
        save: savePreferences,
        extract: extractResume
    },
    jobsearch: {
        search: jobSearch
    },
    jobs: {
        get: getJobs
    },
    resumes: {
        get: getResumes,
        update: updateResumeData,
        getOne: getResume,
        analyse: analyseResumeFromFile,
        analyseText: analyseResumeFromText,
        optimize: optimizeResumeFromFile,
        optimizeText: optimizeResumeFromText,
        optimizeAnalysisBased: optimizeResumeAnalysisBased,
        create: createResume,
        getAnalyses: getResumeAnalyses
    }
}