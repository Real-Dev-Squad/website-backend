/* Import fixtures
 *
 * Recruiter info for unit testing
 *
 * @return {Object}
 */

const recruiterDataArray = [
  {
    company: "Test-feature",
    first_name: "Ankita",
    last_name: "Bannore",
    designation: "Learner",
    reason: "Test",
    email: "abc@gmail.com",
    currency: "$",
    package: 100000,
  },
];

const recruiterWithIdKeys = [
  "company",
  "first_name",
  "last_name",
  "designation",
  "reason",
  "email",
  "currency",
  "package",
  "timestamp",
  "id",
  "username",
];

module.exports = { recruiterDataArray, recruiterWithIdKeys };
