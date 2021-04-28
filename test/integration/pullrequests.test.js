const chai = require('chai')
const sinon = require('sinon')
const { expect } = chai
const chaiHttp = require('chai-http')

const githubService = require('../../services/githubService')
const userModel = require('../../models/users')
const cleanDb = require('../utils/cleanDb')

const app = require('../../server')

chai.use(chaiHttp)

// Import fixtures
const githubPRInfo = require('../fixtures/contributions/githubPRInfo')()
const { getOpenPRs, getStalePRs, pullRequestKeys } = require('../fixtures/pullrequests/pullrequests')
const openPRs = getOpenPRs()
const stalePRs = getStalePRs()
const { data: { items } } = openPRs
const earliestDate = items[0].created_at
const oldestDate = items[items.length - 1].created_at

describe('Pull Requests', function () {
  const username = 'prakash'
  const githubId = 'prakashchoudhary07'
  before(async function () {
    const user = {
      github_id: githubId,
      username
    }
    await userModel.addOrUpdate(user)
  })
  afterEach(function () {
    sinon.restore()
    cleanDb()
  })

  describe('GET /pullrequests/user/:username', function () {
    it('Should return the pull requests of an user', function (done) {
      sinon.stub(githubService, 'fetchPRsByUser').returns(githubPRInfo.prakash)
      chai
        .request(app)
        .get(`/pullrequests/user/${username}`)
        .end((err, res) => {
          if (err) {
            return done()
          }

          expect(res).to.have.status(200)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.be.equal('Pull requests returned successfully!')
          expect(res.body.pullRequests).to.be.a('array')
          expect(res.body.pullRequests[0].username).to.be.equal(githubId)
          expect(res.body.pullRequests[0]).to.have.all.keys(...pullRequestKeys)
          return done()
        })
    })

    it('Should return empty array in case of no PRs found ', function (done) {
      sinon.stub(githubService, 'fetchPRsByUser').returns(githubPRInfo.userWithNoPrs)
      chai
        .request(app)
        .get(`/pullrequests/user/${username}`)
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
      chai
        .request(app)
        .get('/pullrequests/user/invalidUser')
        .end((err, res) => {
          if (err) {
            return done()
          }

          expect(res).to.have.status(404)
          expect(res.body).to.be.an('object')
          expect(res.body).to.eql({
            statusCode: 404,
            error: 'Not Found',
            message: 'Cannot find the user!'
          })
          return done()
        })
    })
  })

  describe('GET /pullrequests/open', function () {
    it('Should get all the open PRs in Real Dev Squad', function (done) {
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
          expect(res.body.pullRequests[0]).to.have.all.keys(...pullRequestKeys)
          expect(res.body.pullRequests[0].createdAt).to.equal(earliestDate)
          return done()
        })
    })
  })

  describe('GET /pullrequests/stale', function () {
    it('Should get all the stale PRs in Real Dev Squad', function (done) {
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
          expect(res.body.pullRequests[0]).to.have.all.keys(...pullRequestKeys)
          expect(res.body.pullRequests[0].createdAt).to.equal(oldestDate)
          return done()
        })
    })
  })
})
