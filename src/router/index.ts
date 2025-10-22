import { extractResume, savePreferences } from "./onboarding/router";
import { jobSearch } from "./job-search/router";

/**
 * Contains all orpc routes
 */
export const router = {
    onboarding: {
        savePreferences,
        extractResume
    },
    jobsearch: { jobSearch }
}