const chai = require('chai')
const { expect } = chai
const chaiHttp = require('chai-http')

const app = require('../../server')
const addUser = require('../utils/addUser')

chai.use(chaiHttp)

describe('Members', function () {
  before(async function () {
    await addUser()
  })

  describe('GET /members', function () {
    it('Get all the members in the database', function (done) {
      chai
        .request(app)
        .get('/members')
        .end((err, res) => {
          if (err) { return done() }

          expect(res).to.have.status(200)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.equal('Members returned successfully!')
          expect(res.body.members).to.be.a('array')
          expect(res.body.members[0].isMember).to.eql(true)

          return done()
        })
    })
  })
})
