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

module.exports = {
  getQualifiers,
  getDateTimeRangeForPRs,
};
