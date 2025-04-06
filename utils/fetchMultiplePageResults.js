import { extractPRdetails } from "../services/githubService.js";

const fetchMultiplePageResults = async (callbackFn, params) => {
  let page = 1;
  const allPRs = [];

  do {
    const { data } = await callbackFn({ page, ...params });
    const currentPRs = extractPRdetails(data);
    allPRs.push(...currentPRs);
    page++;
  } while (allPRs.length === 100 && allPRs.length > 0);

  return allPRs;
};

export { fetchMultiplePageResults };
