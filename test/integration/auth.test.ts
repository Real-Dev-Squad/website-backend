// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'chai'.
const chai = require('chai')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'sinon'.
const sinon = require('sinon')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'expect'.
const { expect } = chai
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'chaiHttp'.
const chaiHttp = require('chai-http')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'passport'.
const passport = require('passport')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'app'.
const app = require('../../server')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'cleanDb'.
const cleanDb = require('../utils/cleanDb')

chai.use(chaiHttp)

// Import fixtures
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'githubUser... Remove this comment to see the full error message
const githubUserInfo = require('../fixtures/auth/githubUserInfo')()

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('auth', function () {
  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'afterEach'.
  afterEach(async function () {
    await cleanDb()

    sinon.restore()
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should redirect the request to the goto page on successful login', function (done: any) {
    const authRedirectionUrl = `${config.get('services.rdsUi.baseUrl')}${config.get('services.rdsUi.routes.authRedirection')}`

    sinon.stub(passport, 'authenticate').callsFake((strategy: any, options: any, callback: any) => {
      callback(null, 'accessToken', githubUserInfo[0])
      return (req: any, res: any, next: any) => { };
    })

    chai
      .request(app)
      .get('/auth/github/callback')
      .query({ code: 'codeReturnedByGithub' })
      .redirects(0)
      .end((err: any, res: any) => {
        if (err) { return done(err) }

        expect(res).to.have.status(302)
        expect(res.headers.location).to.equal(authRedirectionUrl)

        return done()
      })
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should send a cookie with JWT in the response', function (done: any) {
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'URL'.
    const rdsUiUrl = new URL(config.get('services.rdsUi.baseUrl'))

    sinon.stub(passport, 'authenticate').callsFake((strategy: any, options: any, callback: any) => {
      callback(null, 'accessToken', githubUserInfo[0])
      return (req: any, res: any, next: any) => {};
    })

    chai
      .request(app)
      .get('/auth/github/callback')
      .query({ code: 'codeReturnedByGithub' })
      .redirects(0)
      .end((err: any, res: any) => {
        if (err) { return done(err) }

        expect(res).to.have.status(302)
        // rds-session=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VySWQiLCJpYXQiOjE1OTkzOTEzODcsImV4cCI6MTYwMTk4MzM4N30.AljtAmXpZUmErubhSBbA0fQtG9DwH4ci6iroa9z5MBjIPFfQ5FSbaOqU0CQlmgOe-U7XDVPuGBp7GzBzA4yCH7_3PSS9JrHwEVZQQBScTUC-WHDradit5nD1ryKPqJE2WlRO6q0uLOKEukMj-7iPXQ-ykdYwtlokhyJbLVS1S3E; Domain=realdevsquad.com; Path=/; Expires=Tue, 06 Oct 2020 11:23:07 GMT; HttpOnly; Secure
        expect(res.headers['set-cookie']).to.have.length(1)
        expect(res.headers['set-cookie'][0]).to.be.a('string')
          .and.satisfy((msg: any) => msg.startsWith(config.get('userToken.cookieName')))
        expect(res.headers['set-cookie'][0]).to.include('HttpOnly')
        expect(res.headers['set-cookie'][0]).to.include('Secure')
        expect(res.headers['set-cookie'][0]).to.include(`Domain=${rdsUiUrl.hostname}`)
        expect(res.headers['set-cookie'][0]).to.include('SameSite=Lax')

        return done()
      })
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should return 401 if github call fails', function (done: any) {
    chai
      .request(app)
      .get('/auth/github/callback')
      .query({ code: 'codeReturnedByGithub' })
      .end((err: any, res: any) => {
        if (err) { return done(err) }

        expect(res).to.have.status(401)
        expect(res.body).to.be.an('object')
        expect(res.body).to.eql({
          statusCode: 401,
          error: 'Unauthorized',
          message: 'User cannot be authenticated'
        })

        return done()
      })
  })
})
