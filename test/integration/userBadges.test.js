const chai = require('chai');
const { expect } = chai;
const sinon = require('sinon');
const chaiHttp = require('chai-http');
const badges = require('../../models/badges');
const userBadges = require('../fixtures/userBadges/userBadges');

const app = require('../../server');

chai.use(chaiHttp);

describe('User badges', function () {
  describe('GET /badges/:username', function () {
    afterEach(function () {
      badges.fetchUserBadges.restore();
    });

    it('Should get the list of user badges', function (done) {
      sinon.stub(badges, 'fetchUserBadges').returns(userBadges.userFound);
      chai
        .request(app)
        .get('/badges/ankush')
        .end((err, res) => {
          if (err) {
            return done();
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('User badges returned successfully!');
          expect(res.body.userBadges).to.be.a('array');

          return done();
        });
    });
    it('Should return a not found message if the user is not found', function (done) {
      sinon.stub(badges, 'fetchUserBadges').returns(userBadges.userNotFound);
      chai
        .request(app)
        .get('/badges/invalidUsername')
        .end((err, res) => {
          if (err) {
            return done();
          }
          expect(res).to.have.status(404);
          expect(res.body.error).to.equal('Not Found');
          expect(res.body.message).to.equal('The user does not exist');

          return done();
        });
    });
    it('Should return no badges message if the user does not have any badges', function (done) {
      sinon.stub(badges, 'fetchUserBadges').returns(userBadges.badgesEmpty);
      chai
        .request(app)
        .get('/badges/some-user')
        .end((err, res) => {
          if (err) {
            return done();
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('This user does not have any badges');

          return done();
        });
    });
  });
});
