/* eslint-disable no-unused-expressions */
const chai = require('chai')
const { expect } = chai
const chaiHttp = require('chai-http')

const app = require('../../server')
const cryptoModel = require('../../models/crypto')
const authService = require('../../services/authService')
const addUser = require('../utils/addUser')
const cookieName = config.get('userToken.cookieName')

chai.use(chaiHttp)

describe('Crypto', function () {
  let jwt
  beforeEach(async function () {
    const userId = await addUser()
    jwt = authService.generateAuthToken({ userId })
  })
  describe('GET /crypto/products', function () {
    afterEach(async function () {
      const product = {
        id: 'coffee',
        image: 'coffeeImage',
        name: 'coffee',
        manufacturer: 'RDS',
        price: 55,
        category: 'food',
        usage: ['To make coffee']
      }
      await cryptoModel.addProduct(product)
    })
    it('should return empty ', function (done) {
      chai
        .request(app)
        .get('/crypto/products')
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
        .get('/crypto/products')
        .end((err, res) => {
          if (err) {
            return done()
          }
          expect(res).to.have.status(200)
          expect(res.body).to.be.a('object')
          expect(res.body).to.contain.keys('message', 'products')
          expect(res.body.message).to.equal('Products returned successfully!')
          expect(res.body.products).to.be.a('object')
          expect(res.body.products.coffee).to.have.all.keys(
            'id',
            'image',
            'name',
            'manufacturer',
            'price',
            'category',
            'usage'
          )
          return done()
        })
    })
  })
  describe('GET /crypto/products/:productId', function () {
    afterEach(async function () {
      const product = {
        id: 'milk',
        image: 'milkImage',
        name: 'milk',
        manufacturer: 'RDS',
        price: 55,
        category: 'food',
        usage: ['To make coffee']
      }
      await cryptoModel.addProduct(product)
    })
    it('should return empty ', function (done) {
      const productId = 'milk'
      chai
        .request(app)
        .get(`/crypto/products/${productId}`)
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
        .get(`/crypto/products/${productId}`)
        .end((err, res) => {
          if (err) {
            return done()
          }
          expect(res).to.have.status(200)
          expect(res.body).to.be.a('object')
          expect(res.body).to.contain.keys('message', 'product')
          expect(res.body.message).to.equal('Product returned successfully.')
          expect(res.body.product).to.be.a('object')
          expect(res.body.product).to.have.all.keys(
            'id',
            'image',
            'name',
            'manufacturer',
            'price',
            'category',
            'usage'
          )
          return done()
        })
    })
  })
  describe('POST /crypto/products', function () {
    it('Should show 401 unauthenticated error', function (done) {
      chai
        .request(app)
        .post('/crypto/products')
        .send({
          id: 'water',
          image: 'waterImage',
          name: 'water',
          manufacturer: 'RDS',
          price: 55,
          category: 'food',
          usage: ['To drink ']
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
    it('should retrun validation error when id is not passed ', function (done) {
      chai
        .request(app)
        .post('/crypto/products')
        .send({
          image: 'coffeeImage',
          name: 'coffee',
          manufacturer: 'RDS',
          price: 55,
          category: 'food',
          usage: ['To make coffee']
        })
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
        .post('/crypto/products')
        .send({
          id: 'water',
          image: 'waterImage',
          name: 'water',
          manufacturer: 'RDS',
          price: 55,
          category: 'food',
          usage: ['To drink ']
        })
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
          expect(res.body.product).to.have.all.keys(
            'id',
            'image',
            'name',
            'manufacturer',
            'price',
            'category',
            'usage'
          )
          return done()
        })
    })
    it('Should response conflict when creating water product that is already created', function (done) {
      chai
        .request(app)
        .post('/crypto/products')
        .send({
          id: 'water',
          image: 'waterImage',
          name: 'water',
          manufacturer: 'RDS',
          price: 55,
          category: 'food',
          usage: ['To drink ']
        })
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
})
