
const { getUsername, getUserId, getParticipantUsernames, getParticipantUserIds } = require('./users')

const fromFirestoreData = async (task) => {
  if (!task) {
    return task
  }
  let { ownerId, createdBy, assignedTo, participants } = task
  if (ownerId) {
    ownerId = await getUsername(ownerId)
  }
  if (createdBy) {
    createdBy = await getUsername(createdBy)
  }
  if (assignedTo) {
    assignedTo = await getUsername(assignedTo)
  }

  if (participants) {
    participants = await getParticipantUsernames(participants)
  }

  return {
    ...task,
    ownerId,
    createdBy,
    assignedTo,
    participants
  }
}

const toFirestoreData = async (task) => {
  if (!task) {
    return task
  }
  const updatedTask = { ...task }
  const { ownerId, assignedTo, participants } = task
  if (ownerId) {
    updatedTask.ownerId = await getUserId(ownerId)
  }
  if (assignedTo) {
    updatedTask.assignedTo = await getUserId(assignedTo)
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
