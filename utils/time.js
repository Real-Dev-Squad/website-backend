/**
 * Converts minutes to milliseconds
 * @param minutes {integer} : to be converted
 * @returns {integer} : in milliseconds
 */
const convertMinutesToMilliseconds = (minutes) => {
  return minutes * 60 * 1000;
};

/**
 * Converts hours to milliseconds
 * @param hours {integer} : to be converted
 * @returns {integer} : in milliseconds
 */
const convertHoursToMilliseconds = (hours) => {
  return hours * 60 * 60 * 1000;
};

/**
 * Converts days to milliseconds
 * @param days {integer} : to be converted
 * @returns {integer} : in milliseconds
 */
const convertDaysToMilliseconds = (days) => {
  return days * 24 * 60 * 60 * 1000;
};
/**
 * Converts milliseconds to seconds
 * @param milliseconds {number} : to be converted
 * @returns {number} : seconds
 */
const convertMillisToSeconds = (milliseconds) => {
  if (typeof milliseconds !== "number") throw Error("Not a number");
  return Math.round(milliseconds / 1000);
};
/**
 * Returns time in seconds of timestamp after given duration
 * @param timestamp {integer} : base time in milliseconds
 * @param days {integer} : after days
 * @param hours {integer} : after hours
 * @param minutes {integer} : after minutes
 * @returns {integer} : in seconds
 */
const getTimeInSecondAfter = ({ timestamp = Date.now(), days = 0, hours = 0, minutes = 0 }) => {
  const timeInMilliseconds =
    timestamp +
    convertDaysToMilliseconds(days) +
    convertHoursToMilliseconds(hours) +
    convertMinutesToMilliseconds(minutes);

  return parseInt(timeInMilliseconds / 1000);
};

/**
 * Returns time in terms of firestore timestamp before given duration
 * @param timestamp {integer} : base time in milliseconds
 * @param hours {integer} : before hours
 * @returns {integer} : in seconds
 */
const getBeforeHourTime = (timestamp, hours = 0) => {
  const currentTime = timestamp;
  currentTime._seconds -= hours * 60 * 60;
  return currentTime;
};

/**
 * Converts a timestamp to either the start or end of a day in UTC time.
 *
 * @param {number} timestamp - The timestamp to be converted.
 * @param {boolean} isEndOfDay - A flag indicating whether to convert to the end of the day (true) or the start of the day (false).
 * @returns {number} The converted timestamp.
 */
const convertTimestampToUTCStartOrEndOfDay = (timestamp, isEndOfDay = false) => {
  if (isNaN(timestamp)) {
    return null;
  }
  const currTime = new Date(timestamp);
  if (isEndOfDay) {
    currTime.setUTCHours(23, 59, 59, 999);
  } else {
    currTime.setUTCHours(0, 0, 0, 0);
  }
  return currTime.getTime();
};

module.exports = {
  convertDaysToMilliseconds,
  convertHoursToMilliseconds,
  convertMinutesToMilliseconds,
  getTimeInSecondAfter,
  getBeforeHourTime,
  convertTimestampToUTCStartOrEndOfDay,
  convertMillisToSeconds,
};
