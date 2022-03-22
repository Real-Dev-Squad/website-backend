const { convertToSeconds } = require("../../../constants/time");

module.exports = () => {
  return [
    {
      title: "Sherlock and Anagrams",
      level: "Easy",
      start_date: parseInt(Date.now() / 1000),
      end_date: parseInt(Date.now() / 1000) + convertToSeconds.DAYS_10, // After 10 days
    },
  ];
};
