// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'chai'.
const chai = require('chai')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'expect'.
const { expect } = chai
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'sinon'.
const sinon = require('sinon')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'chaiHttp'.
const chaiHttp = require('chai-http')
// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const badges = require('../../models/badges')
// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const userBadges = require('../fixtures/userBadges/userBadges')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'app'.
const app = require('../../server')

chai.use(chaiHttp)

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('User badges', function () {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('GET /badges/:username', function () {
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'afterEach'.
    afterEach(function () {
      badges.fetchUserBadges.restore()
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('Should get the list of user badges', function (done: any) {
      sinon.stub(badges, 'fetchUserBadges').returns(userBadges.userFound)
      chai
        .request(app)
        .get('/badges/ankush')
        .end((err: any, res: any) => {
          if (err) { return done() }
          expect(res).to.have.status(200)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.equal('User badges returned successfully!')
          expect(res.body.userBadges).to.be.a('array')

          return done()
        })
    })
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('Should return a not found message if the user is not found', function (done: any) {
      sinon.stub(badges, 'fetchUserBadges').returns(userBadges.userNotFound)
      chai
        .request(app)
        .get('/badges/invalidUsername')
        .end((err: any, res: any) => {
          if (err) { return done() }
          expect(res).to.have.status(404)
          expect(res.body.error).to.equal('Not Found')
          expect(res.body.message).to.equal('The user does not exist')

          return done()
        })
    })
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('Should return no badges message if the user does not have any badges', function (done: any) {
      sinon.stub(badges, 'fetchUserBadges').returns(userBadges.badgesEmpty)
      chai
        .request(app)
        .get('/badges/some-user')
        .end((err: any, res: any) => {
          if (err) { return done() }
          expect(res).to.have.status(200)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.equal('This user does not have any badges')

          return done()
        })
    })
  })
})
