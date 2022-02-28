const chai = require('chai')
const { expect } = chai
const chaiHttp = require('chai-http')

const app = require('../../server')
const users = require('../../models/users')
const addUser = require('../utils/addUser')
const cleanDb = require('../utils/cleanDb')
const recruiterDataArray = require('../fixtures/recruiter/recruiter')()

chai.use(chaiHttp)

describe('Recruiters', function () {
  let username
  let recruiterData
  beforeEach(async function () {
    const userId = await addUser()
    const { user } = await users.fetchUser({ userId })
    username = user.username
    recruiterData = recruiterDataArray[0]
  })

  afterEach(async function () {
    await cleanDb()
  })

  describe('POST /members/intro/:username', function () {
    it('Should return success response after adding recruiter data', function (done) {
      chai
        .request(app)
        .post(`/members/intro/${username}`)
        .send(recruiterData)
        .end((err, res) => {
          if (err) { return done(err) }
          expect(res).to.have.status(200)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.equal('Request Submission Successful!!')
          expect(res.body.result).to.be.a('object')
          expect(res.body.result.recruiterId).to.be.a('string')
          expect(res.body.result.recruiterName).to.be.a('string')
          expect(res.body.result.userInfo).to.be.a('string')
          expect(res.body.result.timestamp).to.be.a('number')

          return done()
        })
    })

    it('Should return 404 if user not found ', function (done) {
      chai
        .request(app)
        .post('/members/intro/invalidUsername')
        .send(recruiterData)
        .end((err, res) => {
          if (err) { return done() }

          expect(res).to.have.status(404)
          expect(res.body).to.be.an('object')
          expect(res.body).to.eql({
            statusCode: 404,
            error: 'Not Found',
            message: 'User doesn\'t exist'
          })

          return done()
        })
    })
  })
})
