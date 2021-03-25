const chai = require('chai')
const sinon = require('sinon')
const { expect } = chai
const chaiHttp = require('chai-http')

const app = require('../../server')
const tasks = require('../../models/tasks')
const authService = require('../../services/authService')
const addUser = require('../utils/addUser')
const config = require('config')
const cookieName = config.get('userToken.cookieName')
chai.use(chaiHttp)

let jwt

describe('Tasks', function () {
  let taskId1, taskId

  before(async function () {
    const userId = await addUser()
    jwt = authService.generateAuthToken({ userId })

    const taskData = [{
      title: 'Test task',
      purpose: 'To Test mocha',
      featureUrl: '<testUrl>',
      type: 'Dev | Group',
      links: [
        'test1'
      ],
      endsOn: '<unix timestamp>',
      startedOn: '<unix timestamp>',
      status: 'active',
      ownerId: 'ankur',
      percentCompleted: 10,
      dependsOn: [
        'd12',
        'd23'
      ],
      participants: ['ankur'],
      completionAward: { gold: 3, bronze: 300 },
      lossRate: { gold: 1 },
      isNoteWorthy: true
    }, {
      title: 'Test task',
      purpose: 'To Test mocha',
      featureUrl: '<testUrl>',
      type: 'Dev | Group',
      links: [
        'test1'
      ],
      endsOn: '<unix timestamp>',
      startedOn: '<unix timestamp>',
      status: 'completed',
      ownerId: 'ankur',
      percentCompleted: 10,
      dependsOn: [
        'd12',
        'd23'
      ],
      participants: ['ankur'],
      completionAward: { gold: 3, bronze: 300 },
      lossRate: { gold: 1 },
      isNoteworthy: true
    }]

    // Add the active task
    taskId = (await tasks.updateTask(taskData[0])).taskId
    taskId1 = taskId

    // Add the completed task
    taskId = (await tasks.updateTask(taskData[1])).taskId
  })

  afterEach(function () {
    sinon.restore()
  })

  describe('POST /tasks - creates a new task', function () {
    it('Should return success response after adding the task', function (done) {
      chai
        .request(app)
        .post('/tasks')
        .set('cookie', `${cookieName}=${jwt}`)
        .send({
          title: 'Test task',
          purpose: 'To Test mocha',
          featureUrl: '<testUrl>',
          type: 'Dev | Group',
          links: [
            'test1'
          ],
          endsOn: '<unix timestamp>',
          startedOn: '<unix timestamp>',
          status: 'completed',
          ownerId: 'ankur',
          percentCompleted: 10,
          dependsOn: [
            'd12',
            'd23'
          ],
          participants: ['ankur'],
          completionAward: { gold: 3, bronze: 300 },
          lossRate: { gold: 1 },
          isNoteworthy: true
        })
        .end((err, res) => {
          if (err) { return done(err) }
          expect(res).to.have.status(200)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.equal('Task created successfully!')
          expect(res.body.id).to.be.a('string')
          expect(res.body.task).to.be.a('object')
          expect(res.body.task.ownerId).to.equal('ankur')
          expect(res.body.task.participants).to.include('ankur')
          return done()
        })
    })
  })

  describe('GET /tasks', function () {
    it('Should get all the list of tasks', function (done) {
      chai
        .request(app)
        .get('/tasks')
        .end((err, res) => {
          if (err) { return done(err) }
          expect(res).to.have.status(200)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.equal('Tasks returned successfully!')
          expect(res.body.tasks).to.be.a('array')
          res.body.tasks.forEach((task) => {
            expect(task.ownerId).to.equal('ankur')
            expect(task.participants).to.include('ankur')
          })
          return done()
        })
    })
  })

  describe('GET /tasks/self', function () {
    it('Should get all the active and blocked tasks of the user', function (done) {
      const taskStatus = ['active', 'completed']

      chai
        .request(app)
        .get('/tasks/self')
        .set('cookie', `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) { return done() }
          expect(res).to.have.status(200)
          expect(res.body).to.be.a('array')
          expect(res.body).to.have.length.above(0)
          res.body.forEach((task) => {
            expect(taskStatus).to.include(task.status)
          })

          return done()
        })
    })

    it('Should return all the completed tasks of the user when query \'completed\' is true', function (done) {
      chai
        .request(app)
        .get('/tasks/self?completed=true')
        .set('cookie', `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) { return (done) }
          expect(res).to.have.status(200)
          expect(res.body).to.be.a('array')
          expect(res.body[0].status).to.equal('completed')

          return done()
        })
    })

    it('Should return 401 if not logged in', function (done) {
      chai
        .request(app)
        .get('/tasks/self')
        .end((err, res) => {
          if (err) { return done() }

          expect(res).to.have.status(401)
          expect(res.body).to.be.an('object')
          expect(res.body).to.eql({
            statusCode: 401,
            error: 'Unauthorized',
            message: 'Unauthenticated User'
          })

          return done()
        })
    })
  })

  describe('PATCH /tasks', function () {
    it('Should update the task for the given taskid', function (done) {
      chai
        .request(app)
        .patch('/tasks/' + taskId1)
        .set('cookie', `${cookieName}=${jwt}`)
        .send({
          ownerId: 'sumit'
        })
        .end((err, res) => {
          if (err) { return done(err) }
          expect(res).to.have.status(204)

          return done()
        })
    })

    it('Should return 404 if task does not exist', function (done) {
      chai
        .request(app)
        .patch('/tasks/taskid')
        .set('cookie', `${cookieName}=${jwt}`)
        .send({
          ownerId: 'umit'
        })
        .end((err, res) => {
          if (err) { return done(err) }
          expect(res).to.have.status(404)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.equal('Task not found')

          return done()
        })
    })
  })
})
