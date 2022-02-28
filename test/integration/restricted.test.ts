// @ts-expect-error ts-migrate(6200) FIXME: Definitions of the following identifiers conflict ... Remove this comment to see the full error message
const chai = require('chai')
const { expect } = chai
// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const chaiHttp = require('chai-http')

// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const app = require('../../server')
// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const authService = require('../../services/authService')
// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const cleanDb = require('../utils/cleanDb')
// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const userData = require('../fixtures/user/user')()
// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const addUser = require('../utils/addUser')

const cookieName = config.get('userToken.cookieName')
const unrestrictedUser = userData[0]
const restrictedUser = userData[2]

chai.use(chaiHttp)

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('checkRestrictedUser', function () {
  let restrictedJwt
  let unrestrictedJwt

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
  it('should allow GET request coming from restricted user', function (done) {
    chai
      .request(app)
      .get('/users/self')
      .set('cookie', `${cookieName}=${restrictedJwt}`)
      .end((err, res) => {
        if (err) { return done(err) }

        expect(res).to.have.status(200)
        expect(res).to.be.a('object')
        return done()
      })
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should allow non-GET request coming from unrestricted user', function (done) {
    chai
      .request(app)
      .patch('/users/self')
      .set('cookie', `${cookieName}=${unrestrictedJwt}`)
      .send({
        first_name: 'Test'
      })
      .end((err, res) => {
        if (err) { return done(err) }

        expect(res).to.have.status(204)
        return done()
      })
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should deny non-GET request coming from restricted user', function (done) {
    chai
      .request(app)
      .patch('/users/self')
      .set('cookie', `${cookieName}=${restrictedJwt}`)
      .send({
        first_name: 'Test'
      })
      .end((err, res) => {
        if (err) { return done(err) }

        expect(res).to.have.status(403)
        return done()
      })
  })
})
