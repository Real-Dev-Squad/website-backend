const chai = require('chai')
const { expect } = chai
const chaiHttp = require('chai-http')

const app = require('../../../server')
const authService = require('../../../services/authService')
const addUser = require('../../utils/addUser')
chai.use(chaiHttp)

describe('contentTypeCheck', function () {
  it('should return 415 error when content-type application/json is not passed', function (done) {
    chai
      .request(app)
      .post('/users')
      .set('content-type', 'application/xml')
      .send()
      .end((err, res) => {
        if (err) { return done() }

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

  it('should process the request when content-type application/json is passed', async function () {
    const userId = await addUser()
    const jwt = authService.generateAuthToken({ userId })

    chai
      .request(app)
      .patch('/users/self')
      .set('cookie', `rds-session=${jwt}`)
      .send({
        first_name: 'Test first_name'
      })
      .end((err, res) => {
        if (err) { throw err }

        expect(res).to.have.status(204)
      })
  })
})
