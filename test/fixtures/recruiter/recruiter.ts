/* Import fixtures
 *
 * Recruiter info for unit testing
 *
 * @return {Object}
 */

// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = () => {
  return [
    {
      company: 'Test-feature',
      first_name: 'Ankita',
      last_name: 'Bannore',
      designation: 'Learner',
      reason: 'Test',
      email: 'abc@gmail.com',
      currency: '$',
      package: 100000
    }
  ]
}
