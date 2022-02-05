// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'chai'.
const chai = require('chai')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'expect'.
const { expect } = chai

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'usersUtils... Remove this comment to see the full error message
const usersUtils = require('../../../utils/users')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'cleanDb'.
const cleanDb = require('../../utils/cleanDb')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'addUser'.
const addUser = require('../../utils/addUser')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'userData'.
const userData = require('../../fixtures/user/user')()[0]
/**
 * Test the utils functions and validate the data returned
 */

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('users', function () {
  let userId: any
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
    isNoteworthy: true
  }

  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'beforeEach'.
  beforeEach(async function () {
    userId = await addUser()
  })

  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'afterEach'.
  afterEach(async function () {
    await cleanDb()
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('getUsername', function () {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should receive userId of user from database and return username', async function () {
      const convertedUsername = await usersUtils.getUsername(userId)
      expect(convertedUsername).to.equal(userData.username)
    })
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('getUserId', function () {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should receive username of user and return userId', async function () {
      const convertedUserId = await usersUtils.getUserId(userData.username)
      expect(convertedUserId).to.equal(userId)
    })
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('getParticipantUsernames', function () {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should receive userId of users from database and return their usernames', async function () {
      const participantUsername = await usersUtils.getParticipantUsernames([userId])
      expect(participantUsername).to.include(userData.username)
    })
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('getParticipantUserIds', function () {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should receive usernames of users from participant array and return their userIds', async function () {
      const participantArray = taskData.participants
      const participantUserId = await usersUtils.getParticipantUserIds(participantArray)
      expect(participantUserId).to.include(userId)
    })
  })
})
