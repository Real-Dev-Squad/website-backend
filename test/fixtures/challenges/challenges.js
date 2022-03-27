const timeUtils = require("../../../utils/time");

module.exports = () => {
  return [
    {
      title: "Sherlock and Anagrams",
      level: "Easy",
      start_at: Date.now(),
      end_at: Date.now() + timeUtils.convertDaysToMilliseconds(10),
    },
  ];
};
