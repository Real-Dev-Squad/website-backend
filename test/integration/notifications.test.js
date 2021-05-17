const chai = require('chai')
const { expect } = chai
const chaiHttp = require('chai-http')

const app = require('../../server')
const authService = require('../../services/authService')
const addUser = require('../utils/addUser')
const cleanDb = require('../utils/cleanDb')

const config = require('config')
const cookieName = config.get('userToken.cookieName')

chai.use(chaiHttp)

describe('Notifications', function () {
  let jwt
  beforeEach(async function () {
    const userId = await addUser()
    jwt = authService.generateAuthToken({ userId })
  })

  afterEach(async function () {
    await cleanDb()
  })

  describe('GET /notifications', function () {
    const page = 1
    const limit = 5

    it('Should get all the notifications for the loggedIn user in system', function (done) {
      chai
        .request(app)
        .get('/notifications')
        .query({ page, n: limit })
        .set('cookie', `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) { return done(err) }
          expect(res).to.have.status(200)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.equal('Notifications returned successfully!')
          expect(res.body.data).to.be.a('array')
          return done()
        })
    })

    it('Should return 401 if not logged in', function (done) {
      chai
        .request(app)
        .get('/notifications')
        .query({ page, n: limit })
        .end((err, res) => {
          if (err) { return done() }

          expect(res).to.have.status(401)
          expect(res.body).to.be.an('object')
          expect(res.body).to.eql({
            statusCode: 401,
            error: 'Unauthorized',
            message: 'Unauthenticated User'
          })

          return done()
        })
    })
  })
})
