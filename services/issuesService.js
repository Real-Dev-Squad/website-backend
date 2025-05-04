import { fetchIssues, fetchOpenIssues } from "./githubService.js";

/**
 * Get the contributions of the user
 * @param {string} username
 */
const getOrgIssues = async () => {
  const data = await fetchIssues();
  return data;
};

const searchOrgIssues = async (searchString) => {
  const data = await fetchOpenIssues({
    searchString,
  });

  return data;
};

export { getOrgIssues, searchOrgIssues };
