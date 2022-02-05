// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'featureFla... Remove this comment to see the full error message
const featureFlagQuery = require('../models/featureFlags')

/**
 * Fetches all the featureFlag
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const getFeatureFlags = async (req: any, res: any) => {
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

const addFeatureFlag = async (req: any, res: any) => {
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

const updateFeatureFlag = async (req: any, res: any) => {
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

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'deleteFeat... Remove this comment to see the full error message
const deleteFeatureFlag = async (req: any, res: any) => {
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

// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = {
  getFeatureFlags,
  addFeatureFlag,
  updateFeatureFlag,
  deleteFeatureFlag
}
