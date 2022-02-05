// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const recruiterQuery = require('../models/recruiters')

/**
 * Posts the data about the recruiter
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'addRecruit... Remove this comment to see the full error message
const addRecruiter = async (req: any, res: any) => {
  try {
    const result = await recruiterQuery.addRecruiterInfo(req.body, req.params.username)
    if (!result) {
      return res.boom.notFound('User doesn\'t exist')
    }
    return res.json({
      message: 'Request Submission Successful!!',
      result
    })
  } catch (error) {
    logger.error(`Error while adding recruiterInfo: ${error}`)
    return res.boom.serverUnavailable('Something went wrong please contact admin')
  }
}

// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = {
  addRecruiter
}
