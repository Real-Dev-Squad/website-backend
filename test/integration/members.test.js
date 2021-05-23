const chai = require('chai')
const { expect } = chai
const chaiHttp = require('chai-http')

const app = require('../../server')
const authService = require('../../services/authService')
const addUser = require('../utils/addUser')
const cleanDb = require('../utils/cleanDb')

// Import fixtures
const userData = require('../fixtures/user/user')()

const config = require('config')
const cookieName = config.get('userToken.cookieName')

chai.use(chaiHttp)

const superUser = userData[4]

describe('Members', function () {
  let jwt

  afterEach(async function () {
    await addUser()
  })

  after(async function () {
    await cleanDb()
  })

  describe('GET /members', function () {
    before(async function () {
      await cleanDb()
    })
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
          expect(res.body.members[0].isMember).to.eql(true)

          return done()
        })
    })
  })

  describe('GET /members/idle', function () {
    before(async function () {
      await cleanDb()
    })
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

  describe('PATCH /members/moveToMembers', function () {
    before(async function () {
      await cleanDb()
      const userId = await addUser(superUser)
      jwt = authService.generateAuthToken({ userId })
    })
    it('Should make the user a member', function (done) {
      chai
        .request(app)
        .patch(`/members/moveToMembers/${superUser.username}`)
        .set('cookie', `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) { return done(err) }

          expect(res).to.have.status(204)

          return done()
        })
    })
    it('Should return 400 if user is already a member', function (done) {
      chai
        .request(app)
        .patch(`/members/moveToMembers/${superUser.username}`)
        .set('cookie', `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) { return done(err) }

          expect(res).to.have.status(400)

          return done()
        })
    })
  })
})
