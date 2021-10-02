const chai = require('chai')
const { expect } = chai
const chaiHttp = require('chai-http')

const app = require('../../server')
const authService = require('../../services/authService')
const cleanDb = require('../utils/cleanDb')
const userData = require('../fixtures/user/user')()
const addUser = require('../utils/addUser')

const cookieName = config.get('userToken.cookieName')
const unrestrictedUser = userData[0]
const restrictedUser = userData[2]

chai.use(chaiHttp)

describe('checkRestrictedUser', function () {
  let restrictedJwt
  let unrestrictedJwt

  before(async function () {
    const restrictedUserId = await addUser(restrictedUser)
    const unrestrictedUserId = await addUser(unrestrictedUser)
    restrictedJwt = authService.generateAuthToken({ userId: restrictedUserId })
    unrestrictedJwt = authService.generateAuthToken({ userId: unrestrictedUserId })
  })

  after(async function () {
    await cleanDb()
  })

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

  it('should allow non-GET request coming from unrestricted user', function (done) {
    chai
      .request(app)
      .patch('/users/self')
      .set('cookie', `${cookieName}=${unrestrictedJwt}`)
      .send({
        company: 'Test'
      })
      .end((err, res) => {
        if (err) { return done(err) }

        expect(res).to.have.status(204)
        return done()
      })
  })

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
