
const { getUsername, getUserId, getParticipantUsernames, getParticipantUserIds } = require('./users')
const { TASK_TYPE } = require('../constants/tasks')

const fromFirestoreData = async (task) => {
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

const toFirestoreData = async (task) => {
  if (!task) {
    return task
  }
  const updatedTask = { ...task }
  const { assignee, participants } = task
  if (assignee) {
    updatedTask.assignee = await getUserId(assignee)
    if (!updatedTask.assignee) return { userNotFound: true }
  }

  if (Array.isArray(participants)) {
    updatedTask.participants = await getParticipantUserIds(participants)
  }
  return updatedTask
}

const buildTasks = (tasks, initialTaskArray = []) => {
  if (!tasks.empty) {
    tasks.forEach((task) => {
      initialTaskArray.push({
        id: task.id,
        ...task.data()
      })
    })
  }

  return initialTaskArray
}

module.exports = {
  fromFirestoreData,
  toFirestoreData,
  buildTasks
}
