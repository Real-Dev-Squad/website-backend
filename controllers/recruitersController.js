const recruiterQuery = require('../models/recruiters')

const addRecruiter = async (req, res) => {
  try {
    const result = await recruiterQuery.addRecruiterInfo(req)
    return res.json(result)
  } catch (error) {
    logger.error(`Error while adding recruiterInfo: ${error}`)
    return res.boom.serverUnavailable('Something went wrong please contact admin')
  }
}

module.exports = {
  addRecruiter
}
