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

module.exports = {
  minutesToMilliseconds,
  hoursToMilliseconds,
  daysToMilliseconds,
  timeInSecondsAfter,
};
