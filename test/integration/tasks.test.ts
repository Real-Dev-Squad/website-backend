// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'chai'.
const chai = require('chai')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'sinon'.
const sinon = require('sinon')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'expect'.
const { expect } = chai
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'chaiHttp'.
const chaiHttp = require('chai-http')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'app'.
const app = require('../../server')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'tasks'.
const tasks = require('../../models/tasks')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'authServic... Remove this comment to see the full error message
const authService = require('../../services/authService')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'addUser'.
const addUser = require('../utils/addUser')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'userModel'... Remove this comment to see the full error message
const userModel = require('../../models/users')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'config'.
const config = require('config')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'cookieName... Remove this comment to see the full error message
const cookieName = config.get('userToken.cookieName')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'userData'.
const userData = require('../fixtures/user/user')()
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'DINERO'.
const { DINERO, NEELAM } = require('../../constants/wallets')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'cleanDb'.
const cleanDb = require('../utils/cleanDb')
chai.use(chaiHttp)

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'appOwner'.
const appOwner = userData[3]

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'jwt'.
let jwt

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Tasks', function () {
  let taskId1: any, taskId

  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'before'.
  before(async function () {
    const userId = await addUser(appOwner)
    // @ts-expect-error ts-migrate(2588) FIXME: Cannot assign to 'jwt' because it is a constant.
    jwt = authService.generateAuthToken({ userId })

    const taskData = [{
      title: 'Test task',
      type: 'feature',
      endsOn: 1234,
      startedOn: 4567,
      status: 'active',
      percentCompleted: 10,
      participants: [],
      assignee: appOwner.username,
      completionAward: { [DINERO]: 3, [NEELAM]: 300 },
      lossRate: { [DINERO]: 1 },
      isNoteworthy: true
    }, {
      title: 'Test task',
      purpose: 'To Test mocha',
      featureUrl: '<testUrl>',
      type: 'group',
      links: [
        'test1'
      ],
      endsOn: 1234,
      startedOn: 54321,
      status: 'completed',
      percentCompleted: 10,
      dependsOn: [
        'd12',
        'd23'
      ],
      participants: [appOwner.username],
      completionAward: { [DINERO]: 3, [NEELAM]: 300 },
      lossRate: { [DINERO]: 1 },
      isNoteworthy: false
    }]

    // Add the active task
    taskId = (await tasks.updateTask(taskData[0])).taskId
    taskId1 = taskId

    // Add the completed task
    taskId = (await tasks.updateTask(taskData[1])).taskId
  })

  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'after'.
  after(async function () {
    await cleanDb()
  })

  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'afterEach'.
  afterEach(async function () {
    sinon.restore()
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('POST /tasks - creates a new task', function () {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('Should return success response after adding the task', function (done: any) {
      chai
        .request(app)
        .post('/tasks')
        .set('cookie', `${cookieName}=${jwt}`)
        .send({
          title: 'Test task - Create',
          type: 'feature',
          endsOn: 123,
          startedOn: 456,
          status: 'completed',
          percentCompleted: 10,
          completionAward: { [DINERO]: 3, [NEELAM]: 300 },
          lossRate: { [DINERO]: 1 },
          assignee: appOwner.username,
          participants: []
        })
        .end((err: any, res: any) => {
          if (err) { return done(err) }
          expect(res).to.have.status(200)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.equal('Task created successfully!')
          expect(res.body.id).to.be.a('string')
          expect(res.body.task).to.be.a('object')
          expect(res.body.task.createdBy).to.equal(appOwner.username)
          expect(res.body.task.assignee).to.equal(appOwner.username)
          expect(res.body.task.participants).to.be.a('array')
          return done()
        })
    })
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('GET /tasks', function () {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('Should get all the list of tasks', function (done: any) {
      chai
        .request(app)
        .get('/tasks')
        .end((err: any, res: any) => {
          if (err) { return done(err) }
          expect(res).to.have.status(200)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.equal('Tasks returned successfully!')
          expect(res.body.tasks).to.be.a('array')
          const taskWithParticipants = res.body.tasks[0]

          if (taskWithParticipants.type === 'group') {
            expect(taskWithParticipants.participants).to.include(appOwner.username)
          } else {
            expect(taskWithParticipants.assignee).to.equal(appOwner.username)
          }

          return done()
        })
    })
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('GET /tasks/self', function () {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('Should get all the active and blocked tasks of the user', function (done: any) {
      const taskStatus = ['active', 'completed']

      chai
        .request(app)
        .get('/tasks/self')
        .set('cookie', `${cookieName}=${jwt}`)
        .end((err: any, res: any) => {
          if (err) { return done() }
          expect(res).to.have.status(200)
          expect(res.body).to.be.a('array')
          expect(res.body).to.have.length.above(0)
          res.body.forEach((task: any) => {
            expect(taskStatus).to.include(task.status)
          })

          return done()
        })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('Should return all the completed tasks of the user when query \'completed\' is true', function (done: any) {
      chai
        .request(app)
        .get('/tasks/self?completed=true')
        .set('cookie', `${cookieName}=${jwt}`)
        .end((err: any, res: any) => {
          if (err) { return (done) }
          expect(res).to.have.status(200)
          expect(res.body).to.be.a('array')
          expect(res.body[0].status).to.equal('completed')

          return done()
        })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('Should return assignee task', async function () {
      const { userId: assignedUser } = await userModel.addOrUpdate({
        github_id: 'prakashchoudhary07',
        username: 'user1'
      })
      const assignedTask = {
        title: 'Assigned task',
        purpose: 'To Test mocha',
        featureUrl: '<testUrl>',
        type: 'group',
        links: [
          'test1'
        ],
        endsOn: '<unix timestamp>',
        startedOn: '<unix timestamp>',
        status: 'active',
        percentCompleted: 10,
        dependsOn: [
          'd12',
          'd23'
        ],
        participants: ['user1'],
        completionAward: { [DINERO]: 3, [NEELAM]: 300 },
        lossRate: { [DINERO]: 1 },
        isNoteworthy: true
      }
      const { taskId } = await tasks.updateTask(assignedTask)
      const res = await chai
        .request(app)
        .get('/tasks/self')
        .set('cookie', `${cookieName}=${authService.generateAuthToken({ userId: assignedUser })}`)
      expect(res).to.have.status(200)
      expect(res.body).to.be.a('array')
      expect(res.body[0].id).to.equal(taskId)
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('Should return 401 if not logged in', function (done: any) {
      chai
        .request(app)
        .get('/tasks/self')
        .end((err: any, res: any) => {
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

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('PATCH /tasks', function () {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('Should update the task for the given taskid', function (done: any) {
      chai
        .request(app)
        .patch('/tasks/' + taskId1)
        .set('cookie', `${cookieName}=${jwt}`)
        .send({
          title: 'new-title'
        })
        .end((err: any, res: any) => {
          if (err) { return done(err) }
          expect(res).to.have.status(204)

          return done()
        })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('Should return 404 if task does not exist', function (done: any) {
      chai
        .request(app)
        .patch('/tasks/taskid')
        .set('cookie', `${cookieName}=${jwt}`)
        .send({
          title: 'new-title'
        })
        .end((err: any, res: any) => {
          if (err) { return done(err) }
          expect(res).to.have.status(404)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.equal('Task not found')

          return done()
        })
    })
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('GET /tasks/:username', function () {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('Should return 200 when username is valid', function (done: any) {
      chai
        .request(app)
        .get(`/tasks/${appOwner.username}?status=active`)
        .end((err: any, res: any) => {
          if (err) { return done(err) }
          expect(res).to.have.status(200)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.equal('Tasks returned successfully!')

          const task1 = res.body.tasks[0]

          if (task1.type === 'group') {
            expect(task1.participants).to.include(appOwner.username)
          } else {
            expect(task1.assignee).to.equal(appOwner.username)
          }

          expect(res.body.tasks).to.be.a('array')
          return done()
        })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('Should return 404 when username is invalid', function (done: any) {
      chai
        .request(app)
        .get('/tasks/dummyUser?status=active')
        .end((err: any, res: any) => {
          if (err) { return done(err) }
          expect(res).to.have.status(404)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.equal('User doesn\'t exist')
          return done()
        })
    })
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('PATCH /self/:id', function () {
    const taskStatusData = {
      status: 'currentStatus',
      percentCompleted: 50
    }

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('Should update the task status for given self taskid', function (done: any) {
      chai
        .request(app)
        .patch(`/tasks/self/${taskId1}`)
        .set('cookie', `${cookieName}=${jwt}`)
        .send(taskStatusData)
        .end((err: any, res: any) => {
          if (err) { return done(err) }
          expect(res).to.have.status(200)
          expect(res.body.message).to.equal('Task updated successfully!')
          return done()
        })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('Should return 404 if task doesnt exist', function (done: any) {
      chai
        .request(app)
        .patch('/tasks/self/wrongtaskId')
        .set('cookie', `${cookieName}=${jwt}`)
        .send(taskStatusData)
        .end((err: any, res: any) => {
          if (err) { return done(err) }
          expect(res).to.have.status(404)
          expect(res.body.message).to.equal('Task doesn\'t exist')
          return done()
        })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('Should return Forbidden error if task is not assigned to self', async function () {
      const { userId } = await addUser(userData[1])
      const jwt = authService.generateAuthToken({ userId })

      const res = await chai
        .request(app)
        .patch(`/tasks/self/${taskId1}`)
        .set('cookie', `${cookieName}=${jwt}`)

      expect(res).to.have.status(403)
      expect(res.body.message).to.equal('This task is not assigned to you')
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('Should give error for no cookie', async function (done: any) {
      chai
        .request(app)
        .patch(`/tasks/self/${taskId1}`)
        .send(taskStatusData)
        .end((err: any, res: any) => {
          if (err) { return done(err) }
          expect(res).to.have.status(401)
          expect(res.body.message).to.be.equal('Unauthenticated User')
          return done()
        })
        .catch(done())
    })
  })
})
