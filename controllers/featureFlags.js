const featureFlagQuery = require('../models/featureFlags')
const logger = require('../utils/logger')
const { featureFlagRollout } = require('../utils/rollout')

/**
 * Fetches all the featureFlag
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const getFeatureFlags = async (req, res) => {
  try {
    const allFeatureFlags = await featureFlagQuery.fetchFeatureFlag()
    return res.json({
      message: 'FeatureFlags returned successfully!',
      featureflags: allFeatureFlags.length > 0 ? allFeatureFlags : []
    })
  } catch (err) {
    logger.error(`Error while fetching tasks ${err}`)
    return res.boom.badImplementation('An internal server error occurred')
  }
}

/**
 * Posts the data of the featureFlag
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const addFeatureFlag = async (req, res) => {
  try {
    const featureFlag = await featureFlagQuery.addFeatureFlags(req.body, req.userData.username)
    return res.json({
      message: 'FeatureFlag added successfully!',
      data: featureFlag
    })
  } catch (err) {
    logger.error(`Error while adding featureFlag info: ${err}`)
    return res.boom.badImplementation('Something went wrong please contact admin')
  }
}

/**
 * Update the data of the featureFlag
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const updateFeatureFlag = async (req, res) => {
  try {
    const result = await featureFlagQuery.updateFeatureFlags(req.body, req.params.id)
    if (result.isUpdated) {
      return res.status(204).send()
    }
    return res.boom.notFound('FeatureFlag doesn\'t exist')
  } catch (err) {
    logger.error(`Error while updating featureFlag info: ${err}`)
    return res.boom.badImplementation('Something went wrong please contact admin')
  }
}

/**
 * Delete featureFlag
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const deleteFeatureFlag = async (req, res) => {
  try {
    const result = await featureFlagQuery.deleteFeatureFlag(req.params.id)
    if (result.isDeleted) {
      return res.json({
        message: 'FeatureFlag deleted successfully!!'
      })
    }
    return res.boom.notFound('featureFlag doesn\'t exist')
  } catch (err) {
    logger.error(`Error while deleting featureFlag info: ${err}`)
    return res.boom.badImplementation('Something went wrong please contact admin')
  }
}

/**
 * Get featureFlag config.
 *
 * This returns a list of feature flags and whether they are enabled or not.
 * Feature flag being enabled depends on rollout config.
 */
const getConfig = async (req, res) => {
  try {
    const featureFlags = await featureFlagQuery.fetchFeatureFlag(false)
    return res.json({
      data: featureFlags.map((featureFlag) => {
        return {
          name: featureFlag.name,
          enabled: featureFlagRollout(featureFlag, req.userData)
        }
      })
    })
  } catch (err) {
    logger.error(`Error while fetching feature Flags: ${err}`)
    return res.boom.badImplementation('Something went wrong please contact admin')
  }
}

module.exports = {
  getFeatureFlags,
  addFeatureFlag,
  updateFeatureFlag,
  deleteFeatureFlag,
  getConfig
}
