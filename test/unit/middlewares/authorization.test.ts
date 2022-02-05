// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'expect'.
const { expect } = require('chai')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'userHasPer... Remove this comment to see the full error message
const { userHasPermission } = require('../../../middlewares/authorization')

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('userHasPermission', function () {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('user has default role and no required role is provided', function (done: any) {
    expect(userHasPermission('', { default: true })).to.be.equal(true)
    return done()
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('user has default role and required role is `appOwner`', function (done: any) {
    expect(userHasPermission('appOwner', { default: true })).to.be.equal(false)
    return done()
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('user has app_owner role and required role is `appOwner`', function (done: any) {
    expect(userHasPermission('appOwner', { app_owner: true })).to.be.equal(true)
    return done()
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('user has super_user role and required role is `appOwner`', function (done: any) {
    expect(userHasPermission('appOwner', { super_user: true })).to.be.equal(true)
    return done()
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('user has app_owner role and required role is `superUser`', function (done: any) {
    expect(userHasPermission('superUser', { app_owner: true })).to.be.equal(false)
    return done()
  })
})
