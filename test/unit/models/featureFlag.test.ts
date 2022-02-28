/**
 * This eslint rule is disabled because of https://github.com/nodesecurity/eslint-plugin-security/issues/21
 * It gives linting errors in testing the DB data with keys from fixtures
 */
/* eslint-disable security/detect-object-injection */
const chai = require('chai')
const { expect } = chai

const featureFlags = require('../../../models/featureFlags')
const addUser = require('../../utils/addUser')
const cleanDb = require('../../utils/cleanDb')
const firestore = require('../../../utils/firestore')
const featureFlagModel = firestore.collection('featureFlags')
const featureFlagData = require('../../fixtures/featureFlag/featureFlag')()
const userData = require('../../fixtures/user/user')()

const appOwner = userData[5]
const featureFlag = featureFlagData[0]

describe('FeatureFlag', function () {
  beforeEach(async function () {
    await addUser()
  })

  after(async function () {
    await cleanDb()
  })

  describe('addFeatureFlag', function () {
    it('Should add the feature flag data', async function () {
      featureFlag.created_at = Date.now()
      featureFlag.updated_at = featureFlag.created_at
      featureFlag.owner = appOwner.username

      // Add feature flag data
      const data = await featureFlags.addFeatureFlags(featureFlag, appOwner.username)

      const featureData = (await featureFlagModel.doc(data.id).get()).data()

      Object.keys(featureFlag).forEach((key) => {
        expect(featureFlag[key]).to.deep.equal(featureData[key])
      })

      expect(data.name).to.be.a('string')
      expect(data.id).to.be.a('string')
      expect(data.title).to.be.a('string')
      expect(data.owner).to.be.a('string')
      expect(data.created_at).to.be.a('number')
      expect(data.created_at).to.be.a('number')
      expect(data.config.enabled).to.be.a('boolean')
    })
  })

  describe('updateFeatureFlag', function () {
    it('Should update the feature flag', async function () {
      const data = await featureFlags.addFeatureFlags(featureFlag, appOwner.username)

      const updatedData = {
        config: {
          enabled: true
        }
      }
      const { isUpdated } = await featureFlags.updateFeatureFlags(updatedData, data.id)

      expect(isUpdated).to.equal(true)
    })
  })
})
