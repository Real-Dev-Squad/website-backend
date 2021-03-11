const recruiterQuery = require('../models/recruiters')


const addRecruiter = async (req, res) => {
  try {
    const timeStamp=req._startTime
    const result = await recruiterQuery.addRecruiterInfo(req.body, req.params.username, timeStamp)
    res.send(result)
  } catch (error) {
    logger.error(`Error while adding recruiterInfo: ${error}`)
    return res.boom.serverUnavailable('Something went wrong please contact admin')
  }
}



module.exports = {
  addRecruiter
}
