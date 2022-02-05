/**
 * This eslint rule is disabled because of https://github.com/nodesecurity/eslint-plugin-security/issues/21
 * It gives linting errors in testing the DB data with keys from fixtures
 */
/* eslint-disable security/detect-object-injection */

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'chai'.
const chai = require('chai')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'expect'.
const { expect } = chai

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'cleanDb'.
const cleanDb = require('../../utils/cleanDb')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'users'.
const users = require('../../../models/users')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'firestore'... Remove this comment to see the full error message
const firestore = require('../../../utils/firestore')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'userModel'... Remove this comment to see the full error message
const userModel = firestore.collection('users')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'userDataAr... Remove this comment to see the full error message
const userDataArray = require('../../fixtures/user/user')()

/**
 * Test the model functions and validate the data stored
 */

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('users', function () {
  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'afterEach'.
  afterEach(async function () {
    await cleanDb()
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('addOrUpdate', function () {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should add the user collection and set the flag incompleteUserDetails and isNewUser', async function () {
      const userData = userDataArray[0]
      const { isNewUser, userId } = await users.addOrUpdate(userData)

      const data = (await userModel.doc(userId).get()).data()

      Object.keys(userData).forEach(key => {
        expect(userData[key]).to.deep.equal(data[key])
      })

      expect(data.incompleteUserDetails).to.equal(true)
      expect(isNewUser).to.equal(true)
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should update the user collection and unset the flag isNewUser', async function () {
      const userData = userDataArray[0]

      // Add the user the first time
      const { isNewUser } = await users.addOrUpdate(userData)

      // Update the user with same data
      const { isNewUser: updatedIsNewUserFlag } = await users.addOrUpdate(userData)

      expect(isNewUser).to.equal(true)
      expect(updatedIsNewUserFlag).to.equal(false)
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should update the user collection when userId is passed', async function () {
      const userData1 = userDataArray[0]
      const userData2 = userDataArray[1]
      const updatedUserData = {}

      Object.assign(updatedUserData, userData1, userData2)

      // Add the user the first time
      const { isNewUser, userId } = await users.addOrUpdate(userData1)

      // Update the user with same data
      const { isNewUser: updatedIsNewUserFlag } = await users.addOrUpdate(userData2, userId)

      const data = (await userModel.doc(userId).get()).data()

      Object.keys(updatedUserData).forEach(key => {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        expect(updatedUserData[key]).to.deep.equal(data[key])
      })

      expect(isNewUser).to.equal(true)
      expect(updatedIsNewUserFlag).to.equal(false)
    })
  })
})
