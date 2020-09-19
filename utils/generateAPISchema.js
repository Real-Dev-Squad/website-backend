const swaggerDocs = require('./swaggerDefinition')
const fs = require('fs')

module.exports = fs.writeFileSync(
  process.cwd() + '/public/apidoc.json',
  JSON.stringify(swaggerDocs)
)
