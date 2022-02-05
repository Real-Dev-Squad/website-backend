/**
 * Route used to get the health status of teh server
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const healthCheck = (req: any, res: any) => {
  return res.json({
    // @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    uptime: process.uptime()
  })
}

// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = {
  healthCheck
}
