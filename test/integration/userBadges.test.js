const chai = require('chai')
const { expect } = chai
const chaiHttp = require('chai-http')

const app = require('../../server')

chai.use(chaiHttp)

describe('User badges', function () {
  describe('GET /badges/:username', function () {
    it('Should get the list of user badges', function (done) {
      chai
        .request(app)
        .get('/badges/ankush')
        .end((err, res) => {
          if (err) { return done() }
          expect(res).to.have.status(200)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.equal('User badges returned successfully!')
          expect(res.body.userBadges).to.be.a('array')

          return done()
        })
    })
  })
})
