/* eslint-disable no-unused-expressions */
const chai = require('chai')
const { expect } = chai
const chaiHttp = require('chai-http')

const app = require('../../server')
const productsModel = require('../../models/products')
const userModel = require('../../models/users')
const firestore = require('../../utils/firestore')
const authService = require('../../services/authService')
const cookieName = config.get('userToken.cookieName')

// Import fixtures
const { PRAKASH: userPrakash } = require('../fixtures/products/user')
const { COFFEE, MILK, WATER, PRODUCT_KEY_LIST } = require('../fixtures/products/product')

chai.use(chaiHttp)

describe('Products', function () {
  let jwt
  let createdUserId
  before(async function () {
    const { userId } = await userModel.addOrUpdate(userPrakash)
    createdUserId = userId
    jwt = authService.generateAuthToken({ userId })
  })
  describe('GET /products', function () {
    afterEach(async function () {
      await productsModel.addProduct(COFFEE)
    })
    it('should return empty ', function (done) {
      chai
        .request(app)
        .get('/products')
        .end((err, res) => {
          if (err) {
            return done()
          }
          expect(res).to.have.status(200)
          expect(res.body).to.be.a('object')
          expect(res.body).to.contain.keys('message', 'products')
          expect(res.body.message).to.equal('No products found')
          expect(res.body.products).to.be.a('object').that.is.empty
          return done()
        })
    })
    it('Should return product details', function (done) {
      chai
        .request(app)
        .get('/products')
        .end((err, res) => {
          if (err) {
            return done()
          }
          expect(res).to.have.status(200)
          expect(res.body).to.be.a('object')
          expect(res.body).to.contain.keys('message', 'products')
          expect(res.body.message).to.equal('Products returned successfully!')
          expect(res.body.products).to.be.a('object')
          expect(res.body.products.coffee).to.have.all.keys(...PRODUCT_KEY_LIST)
          return done()
        })
    })
  })
  describe('GET /products/:productId', function () {
    afterEach(async function () {
      await productsModel.addProduct(MILK)
    })
    it('should return empty ', function (done) {
      const productId = 'milk'
      chai
        .request(app)
        .get(`/products/${productId}`)
        .end((err, res) => {
          if (err) {
            return done()
          }
          expect(res).to.have.status(404)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.equal('Product doesn\'t exist')
          return done()
        })
    })
    it('Should return milk product detais', function (done) {
      const productId = 'milk'
      chai
        .request(app)
        .get(`/products/${productId}`)
        .end((err, res) => {
          if (err) {
            return done()
          }
          expect(res).to.have.status(200)
          expect(res.body).to.be.a('object')
          expect(res.body).to.contain.keys('message', 'product')
          expect(res.body.message).to.equal('Product returned successfully.')
          expect(res.body.product).to.be.a('object')
          expect(res.body.product).to.have.all.keys(...PRODUCT_KEY_LIST)
          return done()
        })
    })
  })
  describe('POST /products', function () {
    it('Should show 401 unauthenticated error', function (done) {
      chai
        .request(app)
        .post('/products')
        .send(WATER)
        .end((err, res) => {
          if (err) {
            return done()
          }
          expect(res).to.have.status(401)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.equal('Unauthenticated User')
          return done()
        })
    })
    it('should retrun validation error when id is not passed ', function (done) {
      const coffee = JSON.parse(JSON.stringify(COFFEE))
      delete coffee.id
      chai
        .request(app)
        .post('/products')
        .send(coffee)
        .set('cookie', `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) {
            return done()
          }
          expect(res).to.have.status(400)
          expect(res.body).to.be.a('object')
          expect(res.body.error).to.equal('Bad Request')
          expect(res.body.message).to.equal('"id" is required')
          return done()
        })
    })
    it('Should create water product', function (done) {
      chai
        .request(app)
        .post('/products')
        .send(WATER)
        .set('cookie', `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) {
            return done()
          }
          expect(res).to.have.status(201)
          expect(res.body).to.be.a('object')
          expect(res.body).to.contain.keys('message', 'product')
          expect(res.body.message).to.equal('Product added successfully!')
          expect(res.body.product).to.be.a('object')
          expect(res.body.product).to.have.all.keys(...PRODUCT_KEY_LIST)
          return done()
        })
    })
    it('Should response conflict when creating water product that is already created', function (done) {
      chai
        .request(app)
        .post('/products')
        .send(WATER)
        .set('cookie', `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) {
            return done()
          }
          expect(res).to.have.status(409)
          expect(res.body).to.be.a('object')
          expect(res.body.error).to.equal('Conflict')
          expect(res.body.message).to.equal('Product with id "water" already exist')
          return done()
        })
    })
  })
  describe('POST /products/purchase', function () {
    before(async function () {
      const userCollection = firestore.collection('wallets')
      await userCollection.doc('prakash').set({
        currencies: {
          dinero: 10,
          neelam: 5
        },
        userId: createdUserId
      })
    })
    it('Should show 401 unauthenticated error', function (done) {
      chai
        .request(app)
        .post('/products/purchase')
        .send({
          items: {
            itemid: 'coffee'
          },
          amount: {
            dinero: 3,
            neelam: 0
          }
        })
        .end((err, res) => {
          if (err) {
            return done()
          }
          expect(res).to.have.status(401)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.equal('Unauthenticated User')
          return done()
        })
    })
    it('should retrun validation error when amount is not passed ', function (done) {
      chai
        .request(app)
        .post('/products/purchase')
        .send({
          items: [{
            itemid: 'coffee'
          }]
        })
        .set('cookie', `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) {
            return done()
          }
          expect(res).to.have.status(400)
          expect(res.body).to.be.a('object')
          expect(res.body.error).to.equal('Bad Request')
          expect(res.body.message).to.equal('"amount" is required')
          return done()
        })
    })
    it('Should make successful transaction', function (done) {
      chai
        .request(app)
        .post('/products/purchase')
        .send({
          items: [{
            itemId: 'coffee',
            quantity: 3
          }],
          totalQuantity: 3,
          amount: {
            dinero: 3,
            neelam: 0
          }
        })
        .set('cookie', `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) {
            return done()
          }
          expect(res).to.have.status(200)
          expect(res.body).to.be.a('object')
          expect(res.body).to.contain.keys('message')
          expect(res.body.message).to.equal('Purchase successful.')
          return done()
        })
    })
    it('Should response 402 payment required', function (done) {
      chai
        .request(app)
        .post('/products/purchase')
        .send({
          items: [{
            itemId: 'coffee',
            quantity: 3
          }],
          totalQuantity: 3,
          amount: {
            dinero: 10,
            neelam: 4
          }
        })
        .set('cookie', `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) {
            return done()
          }
          expect(res).to.have.status(402)
          expect(res.body).to.be.a('object')
          expect(res.body.error).to.equal('Payment Required')
          expect(res.body.message).to.equal('Insufficient coins.')
          return done()
        })
    })
  })
})
