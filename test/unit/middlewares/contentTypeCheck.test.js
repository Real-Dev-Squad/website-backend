const chai = require('chai')
const { expect } = chai
const chaiHttp = require('chai-http')

const app = require('../../../server')
const authService = require('../../../services/authService')
const addUser = require('../../utils/addUser')
const cleanDb = require('../../utils/cleanDb')
const config = require('config')
const cookieName = config.get('userToken.cookieName')

chai.use(chaiHttp)

describe('contentTypeCheck', function () {
  let jwt

  beforeEach(async function () {
    const userId = await addUser()
    jwt = authService.generateAuthToken({ userId })
  })

  afterEach(async function () {
    await cleanDb()
  })

  it('should return 415 error when content-type application/json is not passed', function (done) {
    chai
      .request(app)
      .post('/users')
      .set('content-type', 'application/xml')
      .send()
      .end((err, res) => {
        if (err) { return done(err) }

        expect(res).to.have.status(415)
        expect(res.body).to.be.a('object')
        expect(res.body).to.eql({
          statusCode: 415,
          error: 'Unsupported Media Type',
          message: 'Invalid content-type header: application/xml, expected: application/json'
        })

        return done()
      })
  })

  it('should process the request when no content-type is passed', function (done) {
    chai
      .request(app)
      .get('/healthcheck')
      .end((err, res) => {
        if (err) { return done(err) }

        expect(res).to.have.status(200)

        return done()
      })
  })

  it('should process the request when content-type application/json is passed', function (done) {
    chai
      .request(app)
      .patch('/users/self')
      .set('cookie', `${cookieName}=${jwt}`)
      .send({
        first_name: 'Test first_name'
      })
      .end((err, res) => {
        if (err) { return done(err) }

        expect(res).to.have.status(204)

        return done()
      })
  })
})
