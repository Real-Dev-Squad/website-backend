const { TASK_SIZE } = require("../constants/tasks");

/**
 * Returns an object containing key value pairs of qualifiers with their values
 * @param query {string}
 * example
 * @input "filterBy:OPEN_PRS sortBy:RECENT_FIRST"
 * @output {
 * filterBy: "OPEN_PRS",
 * sortBy: "RECENT_FIRST"
 * }d
 */
const getQualifiers = (query) => {
  const combinations = query.split(" "); // split the query string by white-space
  const qualifiers = {};

  combinations.forEach((combination) => {
    const [qualifier, value] = combination.split(":");
    // eslint-disable-next-line security/detect-object-injection
    qualifiers[qualifier] = value;
  });

  return qualifiers;
};

/**
 * Returns the date-time range value used for searching PRs and Issues
 * @param startDate {string}
 * @param endDate {string}
 */
const getDateTimeRangeForPRs = (startDate, endDate) => {
  // if startDate and endDate both are received in the params then we specify the range separated by ..
  if (startDate && endDate) {
    return `${startDate}..${endDate}`;
  }

  // if only startDate is received in the params then we return results starting from the given start date
  if (startDate) {
    return `>=${startDate}`;
  }

  // if only endDate is received in the params then we return results until the given end date
  if (endDate) {
    return `<=${endDate}`;
  }
  return "";
};

const getPaginatedLink = ({
  endpoint = "/",
  query = {},
  paramsToExclude = ["page", "next", "prev"],
  cursorKey,
  docId,
}) => {
  let paginatedLink = endpoint + "?";

  Object.entries(query).forEach(([key, value]) => {
    if (!paramsToExclude.includes(key) && value) paginatedLink += `${key}=${value}&`;
  });

  if (!query.size) {
    paginatedLink += `size=${TASK_SIZE}&`;
  }

  paginatedLink += `${cursorKey}=${docId}`;
  return paginatedLink;
};

/**
 * Finds and returns a Set of group IDs for which a given Discord ID is a member.
 *
 * @param {string} discordId - The Discord ID of the user.
 * @param {Array<object>} groupToMemberMappings - Array of group-to-member mappings.
 * @returns {Set<string>} - A Set of group IDs.
 */
function findMemberGroupIds(discordId, groupToMemberMappings = []) {
  return groupToMemberMappings.reduce((memberGroupIds, group) => {
    if (group.userid === discordId) {
      memberGroupIds.add(group.roleid);
    }
    return memberGroupIds;
  }, new Set());
}
module.exports = {
  getQualifiers,
  getDateTimeRangeForPRs,
  getPaginatedLink,
  findMemberGroupIds,
};
