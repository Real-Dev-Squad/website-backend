// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'ROLES'.
const ROLES = {
  SUPER_USER: 'superUser',
  APP_OWNER: 'appOwner'
}

// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = ROLES
