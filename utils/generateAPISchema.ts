const swaggerDocs = require('../docs/swaggerDefinition')
const fs = require('fs')

// eslint-disable-next-line security/detect-non-literal-fs-filename
module.exports = fs.writeFileSync(
  process.cwd() + '/public/apiSchema.json',
  JSON.stringify(swaggerDocs)
)
