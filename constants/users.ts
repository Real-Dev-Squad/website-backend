// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'userStatus... Remove this comment to see the full error message
const userStatusEnum = ['ooo', 'idle', 'active']
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'ROLES'.
const ROLES = {
  ADMIN: 'admin',
  APPOWNER: 'app_owner',
  DEFAULT: 'default',
  MEMBER: 'member',
  SUPERUSER: 'super_user'
}
// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = { userStatusEnum, ROLES }
