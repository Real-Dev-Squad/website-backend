
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'getUsernam... Remove this comment to see the full error message
const { getUsername, getUserId, getParticipantUsernames, getParticipantUserIds } = require('./users')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'TASK_TYPE'... Remove this comment to see the full error message
const { TASK_TYPE } = require('../constants/tasks')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'fromFirest... Remove this comment to see the full error message
const fromFirestoreData = async (task: any) => {
  if (!task) {
    return task
  }

  let { createdBy, assignee, participants, type } = task

  if (createdBy) {
    createdBy = await getUsername(createdBy)
  }

  if (assignee) {
    assignee = await getUsername(assignee)
  }

  if (type === TASK_TYPE.GROUP) {
    participants = await getParticipantUsernames(participants)
  }

  return {
    ...task,
    createdBy,
    assignee,
    participants
  }
}

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'toFirestor... Remove this comment to see the full error message
const toFirestoreData = async (task: any) => {
  if (!task) {
    return task
  }
  const updatedTask = { ...task }
  const { assignee, participants } = task
  if (assignee) {
    updatedTask.assignee = await getUserId(assignee)
  }

  if (Array.isArray(participants)) {
    updatedTask.participants = await getParticipantUserIds(participants)
  }
  return updatedTask
}

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'buildTasks... Remove this comment to see the full error message
const buildTasks = (tasks: any, initialTaskArray = []) => {
  if (!tasks.empty) {
    tasks.forEach((task: any) => {
      initialTaskArray.push({
        // @ts-expect-error ts-migrate(2322) FIXME: Type 'any' is not assignable to type 'never'.
        id: task.id,
        ...task.data()
      })
    })
  }

  return initialTaskArray
}

// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = {
  fromFirestoreData,
  toFirestoreData,
  buildTasks
}
