import { fetchMultiplePageResults } from "./fetchMultiplePageResults.js";
import { getDateTimeRangeForPRs } from "./helper.js";
import * as githubService from "../services/githubService.js";

const ORDER_TYPE = {
  ASC: "asc",
  DESC: "desc",
};

const getFilteredPRsOrIssues = async (qualifiers) => {
  let allPRs = [];
  let githubServiceCallback = () => {};
  const { sortBy = "RECENT_FIRST", filterBy } = qualifiers;
  const order = sortBy === "RECENT_FIRST" ? ORDER_TYPE.DESC : ORDER_TYPE.ASC;

  const startDate = qualifiers?.startDate;
  const endDate = qualifiers?.endDate;
  const dateTime = getDateTimeRangeForPRs(startDate, endDate);

  const searchParams = {}; // searchParams used to create list of params to create github API URL
  const resultOptions = { order }; // resultOptions is used for ordering, searching within date-time range and pagination of results

  if (filterBy === "OPEN_PRS") {
    if (dateTime) {
      searchParams.created = dateTime;
    }

    githubServiceCallback = githubService.fetchOpenPRs;
  }
  if (filterBy === "MERGED_PRS") {
    if (dateTime) {
      searchParams.merged = dateTime;
    }

    githubServiceCallback = githubService.fetchMergedPRs;
  }

  if (filterBy === "OPEN_ISSUES") {
    if (dateTime) {
      searchParams.created = dateTime;
    }

    githubServiceCallback = githubService.fetchOpenIssues;
  }

  if (filterBy === "CLOSED_ISSUES") {
    if (dateTime) {
      searchParams.closed = dateTime;
    }

    githubServiceCallback = githubService.fetchClosedIssues;
  }

  allPRs = await fetchMultiplePageResults(githubServiceCallback, {
    searchParams,
    resultOptions,
  });

  return allPRs;
};

export { getFilteredPRsOrIssues, ORDER_TYPE };
