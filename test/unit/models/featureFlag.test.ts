/**
 * This eslint rule is disabled because of https://github.com/nodesecurity/eslint-plugin-security/issues/21
 * It gives linting errors in testing the DB data with keys from fixtures
 */
/* eslint-disable security/detect-object-injection */
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'chai'.
const chai = require('chai')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'expect'.
const { expect } = chai

// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const featureFlags = require('../../../models/featureFlags')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'addUser'.
const addUser = require('../../utils/addUser')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'cleanDb'.
const cleanDb = require('../../utils/cleanDb')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'firestore'... Remove this comment to see the full error message
const firestore = require('../../../utils/firestore')
const featureFlagModel = firestore.collection('featureFlags')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'featureFla... Remove this comment to see the full error message
const featureFlagData = require('../../fixtures/featureFlag/featureFlag')()
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'userData'.
const userData = require('../../fixtures/user/user')()

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'appOwner'.
const appOwner = userData[5]
const featureFlag = featureFlagData[0]

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('FeatureFlag', function () {
  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'beforeEach'.
  beforeEach(async function () {
    await addUser()
  })

  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'after'.
  after(async function () {
    await cleanDb()
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('addFeatureFlag', function () {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('updateFeatureFlag', function () {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
