const { fetchMultiplePageResults } = require("./fetchMultiplePageResults");
const { getDateTimeRangeForPRs } = require("./helper");
const githubService = require("../services/githubService");

const getFilteredPRsOrIssues = async (qualifiers) => {
  let allPRs = [];
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

    allPRs = await fetchMultiplePageResults(githubService.fetchOpenPRs, {
      searchParams,
      resultOptions,
    });
  }
  if (filterBy === "MERGED_PRS") {
    if (dateTime) {
      searchParams.merged = dateTime;
    }

    allPRs = await fetchMultiplePageResults(githubService.fetchMergedPRs, {
      searchParams,
      resultOptions,
    });
  }

  if (filterBy === "OPEN_ISSUES") {
    if (dateTime) {
      searchParams.created = dateTime;
    }

    allPRs = await fetchMultiplePageResults(githubService.fetchOpenIssues, {
      searchParams,
      resultOptions,
    });
  }

  if (filterBy === "CLOSED_ISSUES") {
    if (dateTime) {
      searchParams.closed = dateTime;
    }

    allPRs = await fetchMultiplePageResults(githubService.fetchClosedIssues, {
      searchParams,
      resultOptions,
    });
  }

  return allPRs;
};

const ORDER_TYPE = {
  ASC: "asc",
  DESC: "desc",
};

module.exports = {
  getFilteredPRsOrIssues,
  ORDER_TYPE,
};
