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
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'addUser'.
const addUser = require('../utils/addUser')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'cleanDb'.
const cleanDb = require('../utils/cleanDb')

// Import fixtures
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'userData'.
const userData = require('../fixtures/user/user')()

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'config'.
const config = require('config')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'cookieName... Remove this comment to see the full error message
const cookieName = config.get('userToken.cookieName')

chai.use(chaiHttp)

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'superUser'... Remove this comment to see the full error message
const superUser = userData[4]
const userAlreadyMember = userData[0]
const userToBeMadeMember = userData[1]
const nonSuperUser = userData[2]

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Members', function () {
  let jwt

  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'afterEach'.
  afterEach(async function () {
    await addUser()
  })

  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'after'.
  after(async function () {
    await cleanDb()
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('GET /members', function () {
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'before'.
    before(async function () {
      await cleanDb()
    })
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('Should return empty array if no member is found', function (done) {
      chai
        .request(app)
        .get('/members')
        .end((err, res) => {
          if (err) { return done(err) }

          expect(res).to.have.status(200)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.equal('No member found')
          expect(res.body.members).to.eql([])

          return done()
        })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('Get all the members in the database', function (done) {
      chai
        .request(app)
        .get('/members')
        .end((err, res) => {
          if (err) { return done(err) }

          expect(res).to.have.status(200)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.equal('Members returned successfully!')
          expect(res.body.members).to.be.a('array')
          expect(res.body.members[0].roles.member).to.eql(true)

          return done()
        })
    })
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('GET /members/idle', function () {
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'before'.
    before(async function () {
      await cleanDb()
    })
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('Should return empty array if no idle member is found', function (done) {
      chai
        .request(app)
        .get('/members/idle')
        .end((err, res) => {
          if (err) { return done(err) }

          expect(res).to.have.status(200)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.equal('No idle member found')
          expect(res.body.idleMemberUserNames).to.eql([])

          return done()
        })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('Get all the idle members in the database', function (done) {
      chai
        .request(app)
        .get('/members/idle')
        .end((err, res) => {
          if (err) { return done(err) }

          expect(res).to.have.status(200)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.equal('Idle members returned successfully!')
          expect(res.body.idleMemberUserNames).to.be.a('array')
          expect(res.body.idleMemberUserNames[0]).to.be.a('string')

          return done()
        })
    })
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('PATCH /members/moveToMembers/:username', function () {
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'before'.
    before(async function () {
      await cleanDb()
      const userId = await addUser(superUser)
      jwt = authService.generateAuthToken({ userId })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it("Should return 404 if user doesn't exist", function (done) {
      chai
        .request(app)
        .patch(`/members/moveToMembers/${userToBeMadeMember.username}`)
        .set('cookie', `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) { return done(err) }

          expect(res).to.have.status(404)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.equal("User doesn't exist")

          return done()
        })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('Should make the user a member', function (done) {
      addUser(userToBeMadeMember).then(() => {
        chai
          .request(app)
          .patch(`/members/moveToMembers/${userToBeMadeMember.username}`)
          .set('cookie', `${cookieName}=${jwt}`)
          .end((err, res) => {
            if (err) { return done(err) }

            expect(res).to.have.status(204)
            /* eslint-disable no-unused-expressions */
            expect(res.body).to.be.a('object').to.be.empty

            return done()
          })
      })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('Should return 400 if user is already a member', function (done) {
      addUser(userAlreadyMember).then(() => {
        chai
          .request(app)
          .patch(`/members/moveToMembers/${userAlreadyMember.username}`)
          .set('cookie', `${cookieName}=${jwt}`)
          .end((err, res) => {
            if (err) { return done(err) }

            expect(res).to.have.status(400)
            expect(res.body).to.be.a('object')
            expect(res.body.message).to.equal('User is already a member')

            return done()
          })
      })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('Should return 401 if user is not a super_user', function (done) {
      addUser(nonSuperUser).then(nonSuperUserId => {
        const nonSuperUserJwt = authService.generateAuthToken({ nonSuperUserId })
        chai
          .request(app)
          .patch(`/members/moveToMembers/${nonSuperUser.username}`)
          .set('cookie', `${cookieName}=${nonSuperUserJwt}`)
          .end((err, res) => {
            if (err) { return done(err) }

            expect(res).to.have.status(401)
            expect(res.body).to.be.a('object')
            expect(res.body.message).to.equal('You are not authorized for this action.')

            return done()
          })
      })
    })
  })
})
