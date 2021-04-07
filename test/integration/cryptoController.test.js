/* eslint-disable mocha/no-hooks-for-single-case */
const chai = require('chai')
const { expect } = chai
const chaiHttp = require('chai-http')

const app = require('../../server')
const cleanDb = require('../utils/cleanDb')


chai.use(chaiHttp)

describe('crypto', function () {
  beforeEach(function() {
    // How to fetch the user_id 
  })

  afterEach(async function () {
    await cleanDb()
  })

  describe('GET /userinfo/user_id', function () {
    it('Should fetch all the information of the crypto user with user_id provided', function (done) {
      chai
        .request(app)
        .get('/userinfo/user_id')
        .end((err, res) => {
          if (err) { return done(err) }

          expect(res).to.have.status(200)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.equal('User returned successfully!')
          expect(res.body.userInfo).to.be.a('object')
          expect(res.body.userInfo).to.have.property('coins')
          expect(res.body.userInfo).to.have.property('name')
          expect(res.body.userInfo).to.have.property('orders')
          expect(res.body.userInfo).to.have.property('transaction')
          expect(res.body.userInfo).to.have.property('notification')
          expect(res.body.userInfo).to.have.property('user_id')
          expect(res.body.userInfo).to.have.property('photo')
          expect(res.body.userInfo.coins).to.be.a('object')
          expect(res.body.userInfo.name).to.be.a('string')
          expect(res.body.userInfo.orders).to.be.a('array')
          expect(res.body.userInfo.transaction).to.be.a('array')
          expect(res.body.userInfo.notification).to.be.a('array')

          return done()
        })
    })
  })
})
