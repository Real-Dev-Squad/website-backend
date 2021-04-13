
const { getUsername, getUserId, getParticipantUsernames, getParticipantUserIds } = require('./users')

const fromFirestoreData = async (task) => {
  if (!task) {
    return task
  }
  let { createdBy, assignee, participants } = task
  if (createdBy) {
    createdBy = await getUsername(createdBy)
  }
  if (assignee) {
    assignee = await getUsername(assignee)
  }

  if (participants) {
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
  }

  if (participants) {
    updatedTask.participants = await getParticipantUserIds(participants)
  }
  return updatedTask
}

module.exports = {
  fromFirestoreData,
  toFirestoreData
}
