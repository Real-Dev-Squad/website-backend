/**
 * This eslint rule is disabled because of https://github.com/nodesecurity/eslint-plugin-security/issues/21
 * It gives linting errors in testing the DB data with keys from fixtures
 */
/* eslint-disable security/detect-object-injection */

const chai = require('chai')
const { expect } = chai

const usersUtils = require('../../../utils/users')
const cleanDb = require('../../utils/cleanDb')
const addUser = require('../../utils/addUser')
const userData = require('../../fixtures/user/user')()[0]
const tasks = require('../../../models/tasks')

/**
 * Test the utils functions and validate the data returned
 */

describe('users', function () {
  let userId, taskId, task
  const taskData = {
    title: 'Test task',
    purpose: 'To Test mocha',
    featureUrl: '<testUrl>',
    type: 'Dev | Group',
    links: [
      'test1'
    ],
    endsOn: '<unix timestamp>',
    startedOn: '<unix timestamp>',
    status: 'active',
    ownerId: 'ankur',
    percentCompleted: 10,
    dependsOn: [
      'd12',
      'd23'
    ],
    participants: ['ankur'],
    completionAward: { gold: 3, bronze: 300 },
    lossRate: { gold: 1 },
    isNoteWorthy: true
  }

  beforeEach(async function () {
    userId = await addUser()
    taskId = (await tasks.updateTask(taskData)).taskId
    task = await tasks.fetchTask(taskId)
  })

  afterEach(async function () {
    await cleanDb()
  })

  describe('getUsername', function () {
    it('should receive userId of user from database and return username', async function () {
      const convertedUsername = await usersUtils.getUsername(userId)
      expect(convertedUsername).to.equal(userData.username)
    })
  })

  describe('getUserId', function () {
    it('should receive username of user and return userId', async function () {
      const convertedUserId = await usersUtils.getUserId(userData.username)
      expect(convertedUserId).to.equal(userId)
    })
  })

  describe('getParticipantUsernames', function () {
    it('should receive userId of users from database and return their usernames', async function () {
      const participantArray = task.taskData.participants
      const participantUsername = await usersUtils.getParticipantUsernames(participantArray)

      expect(participantUsername).to.include(userData.username)
    })
  })

  describe('getParticipantUserIds', function () {
    it('should receive usernames of users from participant array and return their userIds', async function () {
      const participantArray = taskData.participants
      const participantUserId = await usersUtils.getParticipantUserIds(participantArray)
      expect(participantUserId).to.include(userId)
    })
  })
})
