const chai = require('chai')
const sinon = require('sinon')
const { expect } = chai
const chaiHttp = require('chai-http')

const app = require('../../server')
const tasks = require('../../models/tasks')

chai.use(chaiHttp)

describe('Tasks', function () {
  let tid = ''
  before(async function () {
    this.enableTimeouts(false)
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
  })

  afterEach(function () {
    sinon.restore()
  })

  describe('POST /tasks - creates a new task', function () {
    it('Should return success response after adding the task', function (done) {
      sinon.stub(tasks, 'updateTask').callsFake((userData) => {
        return { taskId: 'taskId', taskDetails: {} }
      })

      chai
        .request(app)
        .post('/tasks')
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
          isNoteWorthy: true
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

  describe('GET /tasks', function () {
    it('Should get all the list of tasks', function (done) {
      sinon.stub(tasks, 'fetchTasks').callsFake((query) => {
        return [
          {
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
        ]
      })

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
      sinon.stub(tasks, 'updateTask').callsFake((taskData, taskId) => {
        return { taskId: 'taskId' }
      })

      chai
        .request(app)
        .patch('/tasks/' + tid)
        .send({
          ownerId: 'sumit'
        })
        .end((err, res) => {
          if (err) { return done() }
          expect(res).to.have.status(204)

          return done()
        })
    })

    it('Should return 404 if task does not exist', function (done) {
      sinon.stub(tasks, 'updateTask').callsFake((taskData, taskId) => {
        return { taskId: 'taskId' }
      })

      chai
        .request(app)
        .patch('/tasks/taskid')
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
