const admin = require("firebase-admin");

const minutesToMilliseconds = [
  {
    param: 60,
    result: 3600000,
  },
  {
    param: 10000000000,
    result: 600000000000000,
  },
];

const hoursToMilliseconds = [
  {
    param: 60,
    result: 216000000,
  },
  {
    param: 10000000000,
    result: 36000000000000000,
  },
];

const daysToMilliseconds = [
  {
    param: 60,
    result: 5184000000,
  },
  {
    param: 10000000000,
    result: 864000000000000000,
  },
];

const timeInSecondsAfter = [
  {
    param: {
      timestamp: 1648370545193,
    },
    result: 1648370545,
  },
  {
    param: {
      timestamp: 1648370545193,
      days: 20,
    },
    result: 1648370545 + 1728000,
  },
];

const timeBeforeHour = [
  {
    param: {
      timestamp: admin.firestore.Timestamp.fromDate(new Date(1671820200 * 1000)),
      hours: 24,
    },
    result: admin.firestore.Timestamp.fromDate(new Date(1671733800 * 1000))._seconds,
  },
  {
    param: {
      timestamp: admin.firestore.Timestamp.fromDate(new Date()),
    },
    result: admin.firestore.Timestamp.fromDate(new Date())._seconds,
  },
];

module.exports = {
  minutesToMilliseconds,
  hoursToMilliseconds,
  daysToMilliseconds,
  timeInSecondsAfter,
  timeBeforeHour,
};
