// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'chai'.
const chai = require('chai')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'expect'.
const { expect } = chai
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'chaiHttp'.
const chaiHttp = require('chai-http')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'app'.
const app = require('../../server')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'users'.
const users = require('../../models/users')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'addUser'.
const addUser = require('../utils/addUser')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'cleanDb'.
const cleanDb = require('../utils/cleanDb')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'recruiterD... Remove this comment to see the full error message
const recruiterDataArray = require('../fixtures/recruiter/recruiter')()

chai.use(chaiHttp)

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Recruiters', function () {
  let username: any
  let recruiterData: any
  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'beforeEach'.
  beforeEach(async function () {
    const userId = await addUser()
    const { user } = await users.fetchUser({ userId })
    username = user.username
    recruiterData = recruiterDataArray[0]
  })

  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'afterEach'.
  afterEach(async function () {
    await cleanDb()
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('POST /members/intro/:username', function () {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('Should return success response after adding recruiter data', function (done: any) {
      chai
        .request(app)
        .post(`/members/intro/${username}`)
        .send(recruiterData)
        .end((err: any, res: any) => {
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

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('Should return 404 if user not found ', function (done: any) {
      chai
        .request(app)
        .post('/members/intro/invalidUsername')
        .send(recruiterData)
        .end((err: any, res: any) => {
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
