const swaggerDocs = require('../docs/swaggerDefinition')
const fs = require('fs')

module.exports = fs.writeFileSync(
  process.cwd() + '/public/apiSchema.json',
  JSON.stringify(swaggerDocs)
)
