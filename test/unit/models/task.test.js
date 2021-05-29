const chai = require('chai')
const { expect } = chai
const tasks = require('../../../models/tasks')
const sinon = require('sinon')
const addUser = require('../../utils/addUser')
const userData = require('../../fixtures/user/user')()
const appOwner = userData[3]
const otherUser = userData[0]

describe('tasks', function () {
  before(async function () {
    await addUser(appOwner)
    await addUser(otherUser)
  })

  afterEach(function () {
    sinon.restore()
  })

  describe('fetchUserTasks', function () {
    describe('When user exists and status is not passed', function () {
      it('Should return blank array if no task are assigned to user', async function () {
        const allTasks = await tasks.fetchUserTasks(appOwner.username)
        expect(allTasks).to.eql([])
      })

      it('Should return group tasks in array', async function () {
        const taskData = [
          {
            title: 'Title of the task 1',
            type: 'group',
            endsOn: '1621814400',
            startedOn: '1621728000',
            status: 'completed',
            participants: [
              appOwner.username
            ]
          }]

        await tasks.updateTask(taskData[0])
        const allTasks = await tasks.fetchUserTasks(appOwner.username)
        const task1 = allTasks[0]
        if (task1.type === 'group') {
          expect(task1.participants).to.include(appOwner.username)
        }
      })

      it('Should return both group and feature tasks in array', async function () {
        const taskData = [{
          title: 'Title of the task 2',
          type: 'feature',
          endsOn: '1621814400',
          startedOn: '1621728000',
          status: 'completed',
          assignee: appOwner.username
        }]

        await tasks.updateTask(taskData[0])

        const allTasks = await tasks.fetchUserTasks(appOwner.username)
        const task1 = allTasks[0]
        const task2 = allTasks[1]
        if (task1.type === 'group') {
          expect(task1.participants).to.include(appOwner.username)
        } else {
          expect(task1.assignee).to.equal(appOwner.username)
        }

        if (task2.type === 'group') {
          expect(task2.participants).to.include(appOwner.username)
        } else {
          expect(task2.assignee).to.equal(appOwner.username)
        }
      })
    })

    describe('When user exists and status is passed', function () {
      it('Should return blank array if user has no task with that status', async function () {
        const allTasks = await tasks.fetchUserTasks(otherUser.username)
        expect(allTasks).to.eql([])
      })

      it('Should return all completed task if completed status is passed', async function () {
        const isCompleted = (task) => {
          return task.status === 'completed'
        }

        const allTasks = await tasks.fetchUserTasks(appOwner.username, ['completed'])
        expect(allTasks.length).to.equal(2)
        expect(allTasks.length).to.equal(2)
        const validatedTasks = allTasks.filter(isCompleted)
        expect(allTasks).to.deep.equal(validatedTasks)
      })

      it('Should return all active blocked or pending task if active blocked or pending status is passed', async function () {
        const taskData = [{
          title: 'Title of the task 3',
          type: 'feature',
          endsOn: '1621814400',
          startedOn: '1621728000',
          status: 'active',
          assignee: appOwner.username
        },
        {
          title: 'Title of the task 4',
          type: 'feature',
          endsOn: '1621814400',
          startedOn: '1621728000',
          status: 'blocked',
          assignee: appOwner.username
        },
        {
          title: 'Title of the task 5',
          type: 'feature',
          endsOn: '1621814400',
          startedOn: '1621728000',
          status: 'pending',
          assignee: appOwner.username
        }]

        await tasks.updateTask(taskData[0])
        await tasks.updateTask(taskData[1])
        await tasks.updateTask(taskData[2])

        const validateStatus = (task) => {
          return ['active', 'blocked', 'pending'].includes(task.status)
        }

        const allTasks = await tasks.fetchUserTasks(appOwner.username, ['active', 'pending', 'blocked'])
        const validatedTasks = allTasks.filter(validateStatus)
        expect(allTasks).to.deep.equal(validatedTasks)
      })
    })
  })
})
