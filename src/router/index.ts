import { extractResume, savePreferences } from "./onboarding/router";
import { jobSearch } from "./job-search/router";
import { getJobs } from "./jobs/router";

/**
 * Contains all orpc routes
 */
export const router = {
    onboarding: {
        save: savePreferences,
        extract: extractResume
    },
    jobsearch: { search: jobSearch },
    jobs: { get: getJobs }
}