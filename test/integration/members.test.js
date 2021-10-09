const chai = require('chai')
const { expect } = chai
const chaiHttp = require('chai-http')

const app = require('../../server')
const addUser = require('../utils/addUser')
const cleanDb = require('../utils/cleanDb')

chai.use(chaiHttp)

describe('Members', function () {
  afterEach(async function () {
    await cleanDb()
    await addUser()
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
          expect(res.body.members[0].roles.member).to.eql(true)

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
})
