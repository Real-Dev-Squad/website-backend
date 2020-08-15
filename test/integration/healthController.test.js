const chai = require('chai')
const { expect } = chai
const chaiHttp = require('chai-http')
chai.use(chaiHttp)

const app = require('../../server')

describe('healthController', function () {
  it('should return uptime from the healthcheck API', done => {
    chai
      .request(app)
      .get('/healthcheck')
      .end((err, res) => {
        if (err) { return done() }

        expect(res).to.have.status(200)
        expect(res.body).to.be.an('object')
        expect(res.body).to.have.property('uptime').that.is.a('number')
        return done()
      })
  })
})
