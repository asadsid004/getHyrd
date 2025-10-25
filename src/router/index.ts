import { extractResume, savePreferences } from "./onboarding/router";
import { jobSearch } from "./job-search/router";
import { getJobs } from "./jobs/router";
import { getResumes, updateResumeData, getResume, analyseResumeFromFile, optimizeResumeFromFile, getResumeAnalyses, analyseResumeFromText, optimizeResumeFromText, optimizeResumeAnalysisBased, createResume, deleteResume } from "./resumes/router";
import { getCoverLetters, getCoverLetter, createCoverLetter, updateCoverLetter, deleteCoverLetter, analyseCoverLetterFromFile, analyseCoverLetterFromText, getCoverLetterAnalyses, optimizeCoverLetterFromText, optimizeCoverLetterFromFileData, optimizeCoverLetterBasedonAnalysis } from "./cover-letters/router";
import { createInterview, getInterview, getInterviews, submitAttempt, getReport, deleteInterview } from "./interview/router";
import { getProfile, updateProfile } from "./profile/router";

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
        delete: deleteResume,
        getAnalyses: getResumeAnalyses
    },
    coverLetters: {
        get: getCoverLetters,
        getOne: getCoverLetter,
        create: createCoverLetter,
        update: updateCoverLetter,
        delete: deleteCoverLetter,
        analyse: analyseCoverLetterFromFile,
        analyseText: analyseCoverLetterFromText,
        getAnalyses: getCoverLetterAnalyses,
        optimize: optimizeCoverLetterFromFileData,
        optimizeText: optimizeCoverLetterFromText,
        optimizeAnalysisBased: optimizeCoverLetterBasedonAnalysis
    },
    interview: {
        create: createInterview,
        get: getInterviews,
        getOne: getInterview,
        submitAttempt: submitAttempt,
        getReport: getReport,
        delete: deleteInterview
    },
    profile: {
        get: getProfile,
        update: updateProfile,
    }
}