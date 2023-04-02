const getQualifiers = (query) => {
  const combinations = query.split(" "); // split the query string by white-space
  const qualifiers = {};

  combinations.forEach((combination) => {
    const [qualifier, value] = combination.split(":");
    qualifiers[qualifier] = value;
  });

  return qualifiers;
};

/**
 * Returns the date-time range value used for searching PRs and Issues
 * @param startDate, endDate
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
