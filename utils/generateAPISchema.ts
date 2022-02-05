// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'swaggerDoc... Remove this comment to see the full error message
const swaggerDocs = require('../docs/swaggerDefinition')
// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const fs = require('fs')

// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
// eslint-disable-next-line security/detect-non-literal-fs-filename
module.exports = fs.writeFileSync(
  // @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
  process.cwd() + '/public/apiSchema.json',
  JSON.stringify(swaggerDocs)
)
