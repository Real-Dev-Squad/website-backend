// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'chai'.
const chai = require('chai')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'expect'.
const { expect } = chai
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'chaiHttp'.
const chaiHttp = require('chai-http')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'app'.
const app = require('../../server')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'authServic... Remove this comment to see the full error message
const authService = require('../../services/authService')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'cleanDb'.
const cleanDb = require('../utils/cleanDb')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'userData'.
const userData = require('../fixtures/user/user')()
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'addUser'.
const addUser = require('../utils/addUser')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'cookieName... Remove this comment to see the full error message
const cookieName = config.get('userToken.cookieName')
const unrestrictedUser = userData[0]
const restrictedUser = userData[2]

chai.use(chaiHttp)

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('checkRestrictedUser', function () {
  let restrictedJwt: any
  let unrestrictedJwt: any

  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'before'.
  before(async function () {
    const restrictedUserId = await addUser(restrictedUser)
    const unrestrictedUserId = await addUser(unrestrictedUser)
    restrictedJwt = authService.generateAuthToken({ userId: restrictedUserId })
    unrestrictedJwt = authService.generateAuthToken({ userId: unrestrictedUserId })
  })

  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'after'.
  after(async function () {
    await cleanDb()
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should allow GET request coming from restricted user', function (done: any) {
    chai
      .request(app)
      .get('/users/self')
      .set('cookie', `${cookieName}=${restrictedJwt}`)
      .end((err: any, res: any) => {
        if (err) { return done(err) }

        expect(res).to.have.status(200)
        expect(res).to.be.a('object')
        return done()
      })
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should allow non-GET request coming from unrestricted user', function (done: any) {
    chai
      .request(app)
      .patch('/users/self')
      .set('cookie', `${cookieName}=${unrestrictedJwt}`)
      .send({
        first_name: 'Test'
      })
      .end((err: any, res: any) => {
        if (err) { return done(err) }

        expect(res).to.have.status(204)
        return done()
      })
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should deny non-GET request coming from restricted user', function (done: any) {
    chai
      .request(app)
      .patch('/users/self')
      .set('cookie', `${cookieName}=${restrictedJwt}`)
      .send({
        first_name: 'Test'
      })
      .end((err: any, res: any) => {
        if (err) { return done(err) }

        expect(res).to.have.status(403)
        return done()
      })
  })
})
