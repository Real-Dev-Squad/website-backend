const utils = require("../utils/fetch");
const { fetchUser } = require("../models/users");

/**
 * Extracts only the necessary details required from the object returned by Github API
 * @param data {Object} - Object returned by Github API
 */

const extractPRdetails = (data) => {
  const allPRs = [];
  data.items.forEach(
    ({
      title,
      user,
      html_url: url,
      state,
      created_at: createdAt,
      updated_at: updatedAt,
      repository_url: repositoryUrl,
      labels,
      assignees,
    }) => {
      const allAssignees = assignees.map((object) => object.login);
      const allLabels = labels.map((object) => object.name);
      const repositoryUrlSplit = repositoryUrl.split("/");
      const repository = repositoryUrlSplit[repositoryUrlSplit.length - 1];
      allPRs.push({
        title,
        username: user.login,
        state,
        createdAt,
        updatedAt,
        repository,
        url,
        labels: allLabels,
        assignees: allAssignees,
      });
    }
  );
  return allPRs;
};

/**
 * Creates the custom API URL with the required params in the format
 * expected by Github
 * https://docs.github.com/en/free-pro-team@latest/rest/reference/search
 * @access private
 * @param searchParams {Object} - List of params to create github API URL
 * @param resultsOptions {Object} - Ordering and pagination of results
 */
const getGithubURL = (searchParams, resultsOptions = {}, searchString) => {
  const baseURL = config.get("githubApi.baseUrl");
  const issuesAndPRsPath = "/search/issues";

  const urlObj = new URL(baseURL);
  urlObj.pathname = issuesAndPRsPath;

  const defaultParams = {
    org: config.get("githubApi.org"),
  };

  const finalSearchParams = Object.assign({}, defaultParams, searchParams);

  const paramsObjArr = Object.entries(finalSearchParams);
  const paramsStrArr = paramsObjArr.map(([key, value]) => `${key}:${value}`);

  // The string that can be entrered as text on Github website for simple search
  let prsSearchText = paramsStrArr.join(" ");

  if (searchString) {
    prsSearchText = `${searchString} ${prsSearchText}`;
  }

  urlObj.searchParams.append("q", prsSearchText);

  // Manipulate returned results
  // e.g number of results, pagination, etc
  Object.entries(resultsOptions).forEach(([key, value]) => {
    urlObj.searchParams.append(key, value);
  });

  const createdURL = urlObj.href;
  return createdURL;
};

/** Create the fetch object to call on github url
 * @access private
 * @param url {string} - URL on github to call
 */
function getFetch(url) {
  return utils.fetch(url, "get", null, null, null, {
    auth: {
      username: config.get("githubOauth.clientId"),
      password: config.get("githubOauth.clientSecret"),
    },
  });
}

/**
 * Create fetch call for GitHub APIs as an authenticated user
 * @param {*} url - url to fetch from
 * @param {*} params - query params to pass
 * @param {*} headers - requested headers
 * @returns response object
 */
function getFetchWithAuthToken(url, params = null, headers = null) {
  return utils.fetch(url, "get", params, null, headers);
}
/**
 * Fetches the pull requests in Real-Dev-Squad by user using GitHub API
 * @param username {string} - Username String
 */

const fetchPRsByUser = async (username) => {
  try {
    const { user } = await fetchUser({ username });
    const url = getGithubURL({
      author: user.github_id,
      type: "pr",
    });
    return getFetch(url);
  } catch (err) {
    logger.error(`Error while fetching pull requests: ${err}`);
    throw err;
  }
};

/**
 * Fetches the latest `per_page` open PRs
 *
 * Order by default is desc, which will fetch latest open PRs,
 * to fetch stale PRs just change pass order as asc
 *
 */
const fetchOpenPRs = async (params = {}) => {
  const { perPage = 100, page = 1, searchParams = {}, resultOptions = {} } = params;

  try {
    const url = getGithubURL(
      {
        type: "pr",
        is: "open",
        ...searchParams,
      },
      {
        sort: "created",
        ...resultOptions,
        per_page: perPage,
        page,
      }
    );
    return getFetch(url);
  } catch (err) {
    logger.error(`Error while fetching open pull requests: ${err}`);
    throw err;
  }
};

const fetchMergedPRs = async (params = {}) => {
  const { perPage = 100, page = 1, searchParams = {}, resultOptions = {} } = params;

  try {
    const url = getGithubURL(
      {
        type: "pr",
        is: "merged",
        ...searchParams,
      },
      {
        sort: "updated",
        ...resultOptions,
        per_page: perPage,
        page,
      }
    );

    return getFetch(url);
  } catch (err) {
    logger.error(`Error while fetching closed pull requests: ${err}`);
    throw err;
  }
};

const fetchOpenIssues = async (params = {}) => {
  const { perPage = 100, page = 1, searchParams = {}, resultOptions = {}, searchString = "" } = params;

  try {
    const url = getGithubURL(
      {
        type: "issue",
        is: "open",
        ...searchParams,
      },
      {
        sort: "created",
        ...resultOptions,
        per_page: perPage,
        page,
      },
      searchString
    );
    return getFetch(url);
  } catch (err) {
    logger.error(`Error while fetching open issues: ${err}`);
    throw err;
  }
};

const fetchClosedIssues = async (params = {}) => {
  const { perPage = 100, page = 1, searchParams = {}, resultOptions = {} } = params;

  try {
    const url = getGithubURL(
      {
        type: "issue",
        is: "closed",
        ...searchParams,
      },
      {
        sort: "updated",
        ...resultOptions,
        per_page: perPage,
        page,
      }
    );
    return getFetch(url);
  } catch (err) {
    logger.error(`Error while fetching closed issues: ${err}`);
    throw err;
  }
};

/**
 * Fetches issues across all repositories in the ORG
 */
const fetchIssues = async () => {
  try {
    const baseURL = config.get("githubApi.baseUrl");
    const issues = "/issues";
    const urlObj = new URL(baseURL);
    urlObj.pathname = "orgs" + "/" + config.get("githubApi.org") + issues;
    const createdURL = urlObj.href;
    const res = await getFetchWithAuthToken(
      createdURL,
      {
        filter: "all",
        state: "open",
      },
      {
        Accept: "application/vnd.github+json",
        // TODO: replace <AUTH-TOKEN> with RDS org PAT
        Authorization: `Bearer <AUTH-TOKEN>`,
        org: config.get("githubApi.org"),
      }
    );
    return res;
  } catch (err) {
    logger.error(`Error while fetching issues: ${err}`);
    throw err;
  }
};

/**
 * Fetches issues for given repository and id
 * @param repositoryName {string} - Github repository name where the issue is created.
 * @param issueId {string} - Github issue id to be found.
 * @returns {Object | null} - Object containing Issue details or null if no issue is found.
 */
const fetchIssuesById = async (repositoryName, issueId) => {
  try {
    const baseURL = config.get("githubApi.baseUrl");
    const org = config.get("githubApi.org");
    const url = `${baseURL}/repos/${org}/${repositoryName}/issues/${issueId}`;
    const headers = {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${config.get("githubAccessToken")}`,
      org: org,
    };
    const res = await fetch(url, { headers });
    if (!res.ok) {
      logger.error(`GitHub API request failed. Status: ${res.status}, URL: ${url}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    logger.error(`Error while fetching issues: ${err}`);
    throw err;
  }
};

/**
 * Fetches the last merged PR by a user
 * @param username {string} - Username String
 * @returns {Object} - Object containing the last merged PR
 **/
const fetchLastMergedPR = async (username) => {
  try {
    const searchParams = {
      type: "pr",
      is: "merged",
      author: username,
    };
    const createdURL = getGithubURL(searchParams, { sort: "merged", order: "desc", per_page: "1" });

    const headers = {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${config.get("githubAccessToken")}`,
      org: config.get("githubApi.org"),
    };

    const res = await fetch(createdURL, { headers });

    if (!res.ok) {
      logger.error(`GitHub API request failed. Status: ${res.status}, URL: ${createdURL}`);
      return null;
    }

    const data = await res.json();

    if (!data || !data.items || !data.items.length) {
      logger.error(`No merged PRs found for user ${username}`);
      return null;
    }

    return data;
  } catch (err) {
    logger.error(`Error while fetching merged PRs: ${err}`);
    throw err;
  }
};
/**
 * Checks if the last PR merged by a user is within the last `days` days
 * @param username {string} - Username String
 * @param days {number} - Number of days
 * @returns {boolean} - True if last PR merged is within the last `days` days else false
 **/
const isLastPRMergedWithinDays = async (username, days) => {
  try {
    const res = await fetchLastMergedPR(username);
    if (!res) {
      return false;
    }
    const mergedAt = res.items[0].pull_request.merged_at;
    const lastPRMergedDate = new Date(mergedAt);
    const currentDate = new Date();

    const timeDifferenceInMilliseconds = currentDate - lastPRMergedDate;
    const timeDifferenceInDays = timeDifferenceInMilliseconds / (1000 * 60 * 60 * 24);

    return timeDifferenceInDays <= days;
  } catch (err) {
    logger.error(`Error while checking last PR merged: ${err}`);
    throw err;
  }
};

module.exports = {
  fetchPRsByUser,
  fetchOpenPRs,
  fetchMergedPRs,
  getFetch,
  extractPRdetails,
  fetchIssues,
  fetchOpenIssues,
  fetchClosedIssues,
  fetchLastMergedPR,
  isLastPRMergedWithinDays,
  fetchIssuesById,
};
