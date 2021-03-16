const chai = require('chai')
const { expect } = chai
const chaiHttp = require('chai-http')

const app = require('../../server')
const users = require('../../models/users')
const addUser = require('../utils/addUser')
const cleanDb = require('../utils/cleanDb')

chai.use(chaiHttp)

describe('Recruiters', function () {
  let username
  beforeEach(async function () {
    const userId = await addUser()
    const { user } = await users.fetchUser({ userId })
    username = user.username
  })

  afterEach(async function () {
    await cleanDb()
  })

  describe('POST /members/intro/:username', function () {
    it('Should return success response after adding recruiter data', function (done) {
      chai
        .request(app)
        .post('/members/intro/' + username)
        .send({
          company: 'Test-feature',
          first_name: 'Ankita',
          last_name: 'Bannore',
          designation: 'Student',
          reason: 'Test',
          email: 'abc@gmail.com',
          currency: '$',
          package: 100000
        })
        .end((err, res) => {
          if (err) { return done(err) }
          expect(res).to.have.status(200)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.equal('Request Submission Successful!!')
          expect(res.body.recruiterId).to.be.a('string')
          expect(res.body.recruiterName).to.be.a('string')
          expect(res.body.userInfo).to.be.a('string')
          expect(res.body.timestamp).to.be.a('number')

          return done()
        })
    })
  })
})
