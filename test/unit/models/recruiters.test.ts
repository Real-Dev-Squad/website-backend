/**
 * This eslint rule is disabled because of https://github.com/nodesecurity/eslint-plugin-security/issues/21
 * It gives linting errors in testing the DB data with keys from fixtures
 */
/* eslint-disable security/detect-object-injection */
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'chai'.
const chai = require('chai')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'expect'.
const { expect } = chai

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'cleanDb'.
const cleanDb = require('../../utils/cleanDb')
// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const recruiters = require('../../../models/recruiters')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'firestore'... Remove this comment to see the full error message
const firestore = require('../../../utils/firestore')
const recruiterModel = firestore.collection('recruiters')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'recruiterD... Remove this comment to see the full error message
const recruiterDataArray = require('../../fixtures/recruiter/recruiter')()
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'userDataAr... Remove this comment to see the full error message
const userDataArray = require('../../fixtures/user/user')()
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'addUser'.
const addUser = require('../../utils/addUser')

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Recruiters', function () {
  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'beforeEach'.
  beforeEach(async function () {
    await addUser()
  })
  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'after'.
  after(async function () {
    await cleanDb()
  })
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('addRecruiterInfo', function () {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should add the recruiter data', async function () {
      const recruiterData = recruiterDataArray[0]
      recruiterData.timestamp = Date.now()
      const username = userDataArray[0].username
      // Add recruiter data
      const {
        recruiterId,
        recruiterName,
        userInfo,
        timestamp
      } = await recruiters.addRecruiterInfo(recruiterData, username)
      const data = (await recruiterModel.doc(recruiterId).get()).data()

      Object.keys(recruiterData).forEach(key => {
        expect(recruiterData[key]).to.deep.equal(data[key])
      })
      expect(recruiterId).to.be.a('string')
      expect(recruiterName).to.be.a('string')
      expect(userInfo).to.be.a('string')
      expect(timestamp).to.be.a('number')
    })
  })
})
