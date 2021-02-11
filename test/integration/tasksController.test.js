const chai = require('chai')
const sinon = require('sinon')
const { expect } = chai
const chaiHttp = require('chai-http')

const app = require('../../server')
const tasks = require('../../models/tasks')
const addUser = require('../utils/addUser')
const authService = require('../../services/authService')
chai.use(chaiHttp)

describe('Tasks', function () {
  let jwt
  let tid
  before(async function () {
    const taskData = {
      title: 'Test Task',
      purpose: 'To Test mocha',
      featureUrl: '<testUrl>',
      type: 'Dev | Group',
      links: [
        'test1'
      ],
      endsOn: '<unix timestamp>',
      startedOn: '<unix timestamp>',
      status: 'Active',
      ownerId: '<app owner user id>',
      percentCompleted: 10,
      dependsOn: [
        'd12',
        'd23'
      ],
      participants: ['id1'],
      completionAward: { gold: 3, bronze: 300 },
      lossRate: { gold: 1 },
      isNoteWorthy: true
    }
    const { taskId } = await tasks.updateTask(taskData)
    tid = taskId
    const userId = await addUser()
    jwt = authService.generateAuthToken({ userId })
  })

  afterEach(function () {
    sinon.restore()
  })

  describe('POST /tasks - creates a new task', function () {
    it('Should return success response after adding the task', function (done) {
      chai
        .request(app)
        .post('/tasks')
        .set('cookie', `rds-session=${jwt}`)
        .send({
          title: 'Test Task',
          purpose: 'To Test mocha',
          featureUrl: '<testUrl>',
          type: 'Dev | Group',
          links: [
            'test1'
          ],
          endsOn: '<unix timestamp>',
          startedOn: '<unix timestamp>',
          status: 'Active',
          ownerId: '<app owner user id>',
          percentCompleted: 10,
          dependsOn: [
            'd12',
            'd23'
          ],
          participants: ['id1'],
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

    it('Should return 403 if user is not authorized', function (done) {
      chai
        .request(app)
        .post('/tasks')
        .set('cookie', `rds-session=${jwt}`)
        .send({
          title: 'Test Task',
          purpose: 'To Test mocha',
          featureUrl: '<testUrl>',
          type: 'Dev | Group',
          links: [
            'test1'
          ],
          endsOn: '<unix timestamp>',
          startedOn: '<unix timestamp>',
          status: 'Active',
          ownerId: 'umit',
          percentCompleted: 10,
          dependsOn: [
            'd12',
            'd23'
          ],
          participants: ['id1'],
          completionAward: { gold: 3, bronze: 300 },
          lossRate: { gold: 1 },
          isNoteworthy: true
        })
        .end((err, res) => {
          if (err) { return done() }
          expect(res).to.have.status(403)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.equal('Unauthorized User')
          expect(res.body.id).to.be.a('string')
          expect(res.body.task).to.be.a('object')
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
          if (err) { return done() }
          expect(res).to.have.status(200)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.equal('Tasks returned successfully!')
          expect(res.body.tasks).to.be.a('array')

          return done()
        })
    })
  })

  describe('PATCH /tasks', function () {
    it('Should update the task for the given taskid', function (done) {
      chai
        .request(app)
        .patch('/tasks/' + tid)
        .set('cookie', `rds-session=${jwt}`)
        .send({
          ownerId: 'sumit'
        })
        .end((err, res) => {
          if (err) { return done() }
          expect(res).to.have.status(204)

          return done()
        })
    })

    it('Should return 403 if user is not authorized', function (done) {
      chai
        .request(app)
        .patch('/tasks/taskid')
        .set('cookie', `rds-session=${jwt}`)
        .send({
          ownerId: 'harshith'
        })
        .end((err, res) => {
          if (err) { return done() }
          expect(res).to.have.status(403)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.equal('Unauthorized User')

          return done()
        })
    })

    it('Should return 404 if task does not exist', function (done) {
      chai
        .request(app)
        .patch('/tasks/taskid')
        .set('cookie', `rds-session=${jwt}`)
        .send({
          ownerId: 'umit'
        })
        .end((err, res) => {
          if (err) { return done() }
          expect(res).to.have.status(404)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.equal('Task not found')

          return done()
        })
    })
  })
})
