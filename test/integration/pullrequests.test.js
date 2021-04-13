const chai = require('chai')
const sinon = require('sinon')
const { expect } = chai
const chaiHttp = require('chai-http')

const githubService = require('../../services/githubService')
const userModel = require('../../models/users')

const app = require('../../server')

chai.use(chaiHttp)

// Import fixtures
const githubPRInfo = require('../fixtures/contributions/githubPRInfo')()
const { getOpenPRs, getStalePRs } = require('../fixtures/pullrequests/pullrequests')
const openPRs = getOpenPRs()
const stalePRs = getStalePRs()
const { data: { items } } = openPRs
const earliestDate = items[0].created_at
const oldestDate = items[items.length - 1].created_at

describe('Pull Requests', function () {
  before(async function () {
    const user = {
      github_id: 'prakashchoudhary07',
      username: 'prakash'
    }
    await userModel.addOrUpdate(user)
  })
  afterEach(function () {
    sinon.restore()
  })
  describe('GET /pullrequests/user/:username', function () {
    afterEach(function () {
      sinon.restore()
    })
    it('Should get the pull requests of the user', function (done) {
      sinon.stub(githubService, 'getFetch').returns(githubPRInfo.prakash)
      chai
        .request(app)
        .get('/pullrequests/user/prakash')
        .end((err, res) => {
          if (err) {
            return done()
          }
          expect(res).to.have.status(200)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.be.equal('Pull requests returned successfully!')
          return done()
        })
    })

    it('No pull requests by a user', function (done) {
      sinon.stub(githubService, 'fetchPRsByUser').returns(githubPRInfo.userWithNoPrs)
      chai
        .request(app)
        .get('/pullrequests/user/prakash')
        .end((err, res) => {
          if (err) {
            return done()
          }
          expect(res).to.have.status(200)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.be.equal('No pull requests found!')
          expect(res.body.pullRequests).to.eql([])
          return done()
        })
    })

    it('Should return 404 for invalid user', function (done) {
      sinon.stub(githubService, 'getFetch').returns(githubPRInfo.prakash)
      chai
        .request(app)
        .get('/pullrequests/user/invalidUser')
        .end((err, res) => {
          if (err) {
            return done()
          }
          expect(res).to.have.status(404)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.be.equal('Cannot find the user!')
          return done()
        })
    })
  })

  describe('GET /pullrequests/open', function () {
    it('Should get open PRs', function (done) {
      sinon.stub(githubService, 'fetchOpenPRs').returns(openPRs)
      chai
        .request(app)
        .get('/pullrequests/open')
        .end((err, res) => {
          if (err) {
            return done()
          }
          expect(res).to.have.status(200)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.be.equal('Open PRs')
          expect(res.body.pullRequests[0].createdAt).to.equal(earliestDate)
          return done()
        })
    })
  })

  describe('GET /pullrequests/stale', function () {
    it('Should get open PRs', function (done) {
      sinon.stub(githubService, 'fetchStalePRs').returns(stalePRs)
      chai
        .request(app)
        .get('/pullrequests/stale')
        .end((err, res) => {
          if (err) {
            return done()
          }

          expect(res).to.have.status(200)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.be.equal('Stale PRs')
          expect(res.body.pullRequests[0].createdAt).to.equal(oldestDate)
          return done()
        })
    })
  })
})
