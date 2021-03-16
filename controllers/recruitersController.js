const recruiterQuery = require('../models/recruiters')

/**
 * Posts the data about the recruiter
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const addRecruiter = async (req, res) => {
  try {
    const result = await recruiterQuery.addRecruiterInfo(req.body, req.params.username)
    return res.json(result)
  } catch (error) {
    logger.error(`Error while adding recruiterInfo: ${error}`)
    return res.boom.notFound('Something went wrong please contact admin')
  }
}

module.exports = {
  addRecruiter
}
