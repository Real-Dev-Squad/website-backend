/**
 * Route used to get the health status of teh server
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const healthCheck = (req, res) => {
  return res.json({
    uptime: process.uptime()
  })
}

module.exports = {
  healthCheck
}
