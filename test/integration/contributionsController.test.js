const chai = require('chai')
const sinon = require('sinon')
const { expect } = chai
const chaiHttp = require('chai-http')

const authService = require('../../services/authService')
const githubService = require('../../services/githubService')
const addUser = require('../utils/addUser')

const app = require('../../server')

chai.use(chaiHttp)

// Import fixtures
const githubPRInfo = require('../fixtures/contributions/githubPRInfo')()

let jwt

describe('Contributions route', function () {
  describe('Create User', function () {
    before(async function () {
      const userId = await addUser()
      jwt = authService.generateAuthToken({ userId })
    })

    afterEach(function () {
      sinon.restore()
    })

    describe('POST /users - create new user', function () {
      it('Should return success response after adding the user', function (done) {
        chai
          .request(app)
          .post('/users')
          .set('cookie', `rds-session=${jwt}`)
          .send({
            first_name: 'Prakash',
            last_name: 'C',
            yoe: 0,
            img: './img.png',
            github_id: 'prakashchoudhary07',
            username: 'prakash'
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
    })
  })
  describe('POST /tasks - creates a new task', function () {
    it('Should return success response after adding the task (isNoteWorthy = true)', function (done) {
      chai
        .request(app)
        .post('/tasks')
        .send({
          title: 'Task for contribution (GET contributions/:username API)',
          purpose: 'To Test mocha',
          featureUrl: '<testUrl>',
          type: 'Dev | Group',
          links: [
            'https://github.com/Real-Dev-Squad/website-backend/pull/145'
          ],
          endsOn: '<unix timestamp>',
          startedOn: '<unix timestamp>',
          status: 'Active',
          ownerId: '<app owner user id>',
          percentCompleted: 10,
          dependsOn: [
            'Depends on task 2'
          ],
          participants: ['prakash'],
          completionAward: { gold: 3, bronze: 300 },
          lossRate: { gold: 1 },
          isNoteworthy: true
        })
        .end((err, res) => {
          if (err) { return done() }
          expect(res).to.have.status(200)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.equal('Task created successfully!')
          expect(res.body.id).to.be.a('string')
          expect(res.body.task).to.be.a('object')
          return done()
        })
    })
    it('Should return success response after adding the task (isNoteWorthy = false)', function (done) {
      chai
        .request(app)
        .post('/tasks')
        .send({
          title: 'Task for contribution',
          purpose: 'To Test mocha',
          featureUrl: '<testUrl>',
          type: 'Dev | Group',
          links: [
            'https://github.com/Real-Dev-Squad/website-backend/pull/83'
          ],
          endsOn: '<unix timestamp>',
          startedOn: '<unix timestamp>',
          status: 'Active',
          ownerId: '<app owner user id>',
          percentCompleted: 10,
          dependsOn: [
            'Depends on task 2'
          ],
          participants: ['prakash'],
          completionAward: { gold: 3, bronze: 300 },
          lossRate: { gold: 1 },
          isNoteworthy: false
        })
        .end((err, res) => {
          if (err) { return done() }
          expect(res).to.have.status(200)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.equal('Task created successfully!')
          expect(res.body.id).to.be.a('string')
          expect(res.body.task).to.be.a('object')
          return done()
        })
    })
  })
  describe('GET /contributions/{username}', function () {
    it('Should get all the contributions of the user', function (done) {
      sinon.stub(githubService, 'fetchPRsByUser').returns(githubPRInfo)
      chai
        .request(app)
        .get('/contributions/prakash')
        .end((err, res) => {
          if (err) { return done() }
          expect(res).to.have.status(200)
          expect(res.body).to.be.a('object')
          expect(res.body.noteworthy).to.be.a('array')
          expect(res.body.all).to.be.a('array')
          const [noteworthyObj] = res.body.noteworthy
          expect(noteworthyObj).to.contain.keys('task', 'prList')
          // eslint-disable-next-line no-unused-expressions
          expect(noteworthyObj.task.isNoteworthy).to.be.true
          expect(noteworthyObj.task).to.have.all.keys('dependsOn', 'endsOn', 'featureUrl', 'isNoteworthy', 'participants', 'purpose', 'startedOn', 'status', 'title')
          expect(noteworthyObj.prList[0]).to.have.all.keys('title', 'state', 'url', 'createdAt', 'updatedAt', 'raisedBy')
          const [noteworthyObj2] = res.body.all
          expect(noteworthyObj2).to.contain.keys('task', 'prList')
          // eslint-disable-next-line no-unused-expressions
          expect(noteworthyObj2.task.isNoteworthy).to.be.false
          return done()
        })
    })
  })
})
