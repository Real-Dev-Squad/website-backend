/**
 * Sample search values for tests
 * @return  {object}
 */

module.exports = () => {
  return [
    { desc: "Happy case: should return users successfully", value: "an" },
    { desc: "Should return users successfully converting search param value to small case", value: "AN" },
    { desc: "If search param is a number, should search for string value of number in username prefix", value: 23 },
    { desc: "Should return all users for empty value of search param", value: "" },
    { desc: "Should return no users are present", value: "mu" },
  ];
};
