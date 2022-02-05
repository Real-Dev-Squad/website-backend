// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'TASK_TYPE'... Remove this comment to see the full error message
const TASK_TYPE = {
  FEATURE: 'feature',
  GROUP: 'group',
  STORY: 'story'
}

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'TASK_STATU... Remove this comment to see the full error message
const TASK_STATUS = {
  ACTIVE: 'active',
  ASSIGNED: 'assigned',
  BLOCKED: 'blocked',
  COMPLETED: 'completed',
  UNASSIGNED: 'unAssigned'
}

// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = { TASK_TYPE, TASK_STATUS }
