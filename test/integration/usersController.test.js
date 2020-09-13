const chai = require('chai')
const sinon = require('sinon')
const { expect } = chai
const chaiHttp = require('chai-http')

const app = require('../../server')
const authService = require('../../services/authService')
const userQuery = require('../../models/users')

chai.use(chaiHttp)

afterEach(() => {
  sinon.restore()
})

describe('Users', function () {
  const jwt = authService.generateAuthToken({ userId: 1 })

  describe('POST /users - create one user', function () {
    it('Should return success response after adding the user', done => {
      sinon.stub(userQuery, 'addOrUpdate').callsFake((userData) => {
        return { isNewUser: true, userId: 'userId' }
      })

      chai
        .request(app)
        .post('/users')
        .set('cookie', `rds-session=${jwt}`)
        .send({
          first_name: 'Nikhil',
          last_name: 'Bhandarkar',
          yoe: 0,
          img: './img.png',
          github_id: 'whydonti',
          linkedin_id: 'nikhil-bhandarkar',
          twitter_id: 'whatifi'
        })
        .end((err, res) => {
          if (err) { return done() }

          expect(res).to.have.status(200)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.equal('User added successfully!')
          expect(res.body.userId).to.be.a('string')

          return done()
        })
    })

    it('Should return 409 if user already exists', done => {
      sinon.stub(userQuery, 'addOrUpdate').callsFake((userData) => {
        return { isNewUser: false, userId: 'userId' }
      })

      chai
        .request(app)
        .post('/users')
        .set('cookie', `rds-session=${jwt}`)
        .send({
          first_name: 'Nikhil',
          last_name: 'Bhandarkar',
          yoe: 0,
          img: './img.png',
          github_id: 'whydonti',
          linkedin_id: 'nikhil-bhandarkar',
          twitter_id: 'whatifi'
        })
        .end((err, res) => {
          if (err) { return done() }

          expect(res).to.have.status(409)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.equal('User already exists')

          return done()
        })
    })
  })

  describe('PATCH /users', function () {
    it('Should update the user with given id', done => {
      sinon.stub(userQuery, 'addOrUpdate').callsFake((userData, userId) => {
        return { isNewUser: false, userId: 'userId' }
      })

      chai
        .request(app)
        .patch('/users/userId')
        .set('cookie', `rds-session=${jwt}`)
        .send({
          first_name: 'Test first_name'
        })
        .end((err, res) => {
          if (err) { return done() }

          expect(res).to.have.status(200)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.equal('User updated successfully!')

          return done()
        })
    })

    it('Should return 404 if user does not exists', done => {
      sinon.stub(userQuery, 'addOrUpdate').callsFake((userData, userId) => {
        return { isNewUser: true, userId: 'userId' }
      })

      chai
        .request(app)
        .patch('/users/userId')
        .set('cookie', `rds-session=${jwt}`)
        .send({
          first_name: 'Test first_name'
        })
        .end((err, res) => {
          if (err) { return done() }

          expect(res).to.have.status(404)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.equal('User not found')

          return done()
        })
    })
  })

  describe('GET /users', function () {
    it('Should get all the users in system', done => {
      sinon.stub(userQuery, 'fetchUsers').callsFake((query) => {
        return [
          {
            id: 'nikhil',
            yoe: 0,
            twitter_id: 'whatifi',
            first_name: 'Nikhil',
            linkedin_id: 'nikhil-bhandarkar',
            img: './img.png',
            github_id: 'whydonti',
            last_name: 'Bhandarkar'
          }
        ]
      })

      chai
        .request(app)
        .get('/users')
        .set('cookie', `rds-session=${jwt}`)
        .end((err, res) => {
          if (err) { return done() }

          expect(res).to.have.status(200)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.equal('Users returned successfully!')
          expect(res.body.users).to.be.a('array')

          return done()
        })
    })
  })

  describe('GET /users/id', function () {
    it('Should return one user with given id', done => {
      sinon.stub(userQuery, 'fetchUser').callsFake((userId) => {
        return {
          userExists: true,
          user: {
            id: 'nikhil',
            yoe: 0,
            twitter_id: 'whatifi',
            first_name: 'Nikhil',
            linkedin_id: 'nikhil-bhandarkar',
            img: './img.png',
            github_id: 'whydonti',
            last_name: 'Bhandarkar'
          }
        }
      })

      chai
        .request(app)
        .get('/users/userId')
        .set('cookie', `rds-session=${jwt}`)
        .end((err, res) => {
          if (err) { return done() }

          expect(res).to.have.status(200)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.equal('User returned successfully!')
          expect(res.body.user).to.be.a('object')

          return done()
        })
    })

    it('Should return 404 if there is no user in the system', done => {
      sinon.stub(userQuery, 'fetchUser').callsFake((userId) => {
        return { userExists: false, user: undefined }
      })

      chai
        .request(app)
        .get('/users/userId')
        .set('cookie', `rds-session=${jwt}`)
        .end((err, res) => {
          if (err) { return done() }

          expect(res).to.have.status(404)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.equal('User doesn\'t exist')

          return done()
        })
    })
  })
})
