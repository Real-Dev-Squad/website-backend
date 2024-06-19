const timeUtils = require("../../../utils/time");

module.exports = () => {
  return [
    {
      title: "Sherlock and Anagrams",
      level: "Easy",
      start_date: timeUtils.getTimeInSecondAfter({}),
      end_date: timeUtils.getTimeInSecondAfter({ days: 10 }),
    },
  ];
};
