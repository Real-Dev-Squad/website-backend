/**
 * This eslint rule is disabled because of https://github.com/nodesecurity/eslint-plugin-security/issues/21
 * It gives linting errors in testing the DB data with keys from fixtures
 */
/* eslint-disable security/detect-object-injection */

const chai = require('chai')
const { expect } = chai

const cleanDb = require('../../utils/cleanDb')
const recruiters = require('../../../models/recruiters')
const firestore = require('../../../utils/firestore')
const recruiterModel = firestore.collection('recruiters')
const recruiterDataArray = require('../../fixtures/recruiter/recruiter')()
const userDataArray = require('../../fixtures/user/user')()

describe('Recruiters', function () {
  after(async function () {
    await cleanDb()
  })
  describe('addRecruiterInfo', function () {
    it('should add the recruiter data', async function () {
      const recruiterData = recruiterDataArray[0]
      recruiterData.timestamp = Date.now()
      const username = userDataArray[0].username
      // Add recruiter data
      const {
        message,
        recruiterId,
        recruiterName,
        userInfo,
        timestamp
      } = await recruiters.addRecruiterInfo(recruiterData, username)

      const data = (await recruiterModel.doc(recruiterId).get()).data()

      Object.keys(recruiterData).forEach(key => {
        expect(recruiterData[key]).to.deep.equal(data[key])
      })
      expect(message).to.equal('Request Submission Successful!!')
      expect(recruiterId).to.be.a('string')
      expect(recruiterName).to.be.a('string')
      expect(userInfo).to.be.a('string')
      expect(timestamp).to.be.a('number')
    })
  })
})
