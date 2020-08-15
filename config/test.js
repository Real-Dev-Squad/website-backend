const setBooleanConfig = require('../utils/config').setBooleanConfig

module.exports = {
  port: process.env.PORT || 3000,
  enableLogTrasports: setBooleanConfig(process.env.ENABLE_LOGS, true)
}
