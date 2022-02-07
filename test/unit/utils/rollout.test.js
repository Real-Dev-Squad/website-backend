const chai = require('chai')
const { expect } = chai

const configFixture = require('../../fixtures/featureFlag/featureFlagConfig')
const { featureFlagRollout } = require('../../../utils/rollout')

const userData = {
  id: 'random-id-123', // hash % 100 comes out to 70
  roles: {
    app_owner: true,
    member: true
  }
}

describe('featureFlagRollout', function () {
  describe('roleBasedRollout', function () {
    it('should rollout to user with allowed roles', async function () {
      const featureEnabled = featureFlagRollout(configFixture.roleBasedConfig, userData)
      expect(featureEnabled).to.equal(true)
    })

    it('should disable rollout to a user with not allowed role', async function () {
      const memberData = {
        roles: {
          app_owner: false
        }
      }
      const featureEnabled = featureFlagRollout(configFixture.roleBasedConfig, memberData)
      expect(featureEnabled).to.equal(false)
    })

    it('should fallback to toggle rollout if no userData', async function () {
      // Note: It falls back to percentage rollout, but in this case, even that rollout is not active.
      const featureConfig = {
        config: {
          ...configFixture.roleBasedConfig,
          enabled: true
        }
      }

      const featureEnabled = featureFlagRollout(featureConfig)
      expect(featureEnabled).to.equal(true)
    })

    it('should fallback to toggle rollout if roleBased is inactive', async function () {
      // Note: It falls back to percentage rollout, but in this case, even that rollout is not active.
      const featureConfig = {
        config: {
          ...configFixture.roleBasedConfig.config,
          roleBased: {
            roles: [],
            active: false
          }
        }
      }

      const featureEnabled = featureFlagRollout(featureConfig)
      expect(featureEnabled).to.equal(false)
    })
  })

  describe('percentageRollout', function () {
    it('should rollout to a percentage of user', async function () {
      const featureEnabled = featureFlagRollout(configFixture.percentageConfig, userData)
      expect(featureEnabled).to.equal(true)
    })

    it('should disable rollout to a user based on percentage rollout', async function () {
      const uData = {
        ...userData,
        id: 'random-id-1' // hash % 100 comes out to 83
      }
      const featureEnabled = featureFlagRollout(configFixture.percentageConfig, uData)
      expect(featureEnabled).to.equal(false)
    })

    it('should fallback to toggle rollout if percentage rollout is inactive', async function () {
      const featureConfig = {
        config: {
          ...configFixture.percentageConfig.config,
          percentage: {
            value: 50,
            active: false
          },
          enabled: true
        }
      }
      const featureEnabled = featureFlagRollout(featureConfig)
      expect(featureEnabled).to.equal(true)
    })
  })

  describe('toggleRollout', function () {
    it('should rollout based on toggle value', async function () {
      const featureConfig = configFixture.toggleConfig
      let featureEnabled = featureFlagRollout(featureConfig)
      expect(featureEnabled).to.equal(true)

      featureConfig.config.enabled = false
      featureEnabled = featureFlagRollout(featureConfig)
      expect(featureEnabled).to.equal(false)
    })
  })
})
