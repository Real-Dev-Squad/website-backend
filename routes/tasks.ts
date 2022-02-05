// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'express'.
const express = require('express')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'router'.
const router = express.Router()
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'authentica... Remove this comment to see the full error message
const authenticate = require('../middlewares/authenticate')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'tasks'.
const tasks = require('../controllers/tasks')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'createTask... Remove this comment to see the full error message
const { createTask, updateTask, updateSelfTask } = require('../middlewares/validators/tasks')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'authorizeU... Remove this comment to see the full error message
const { authorizeUser } = require('../middlewares/authorization')

/**
 * @swagger
 * /tasks:
 *  get:
 *   summary: Used to get all the tasks
 *   tags:
 *     - Tasks
 *   responses:
 *     200:
 *       description: returns tasks
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/tasks'
 *     500:
 *       description: badImplementation
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/errors/badImplementation'
 */

router.get('/', tasks.fetchTasks)

/**
 * @swagger
 * /tasks/self:
 *   get:
 *     summary: Use to get all the tasks of the logged in user
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: returns all tasks
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/tasks'
 *       401:
 *         description: unAuthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errors/unAuthorized'
 *       404:
 *         description: notFound
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errors/notFound'
 *       500:
 *         description: badImplementation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errors/badImplementation'
 */
router.get('/self', authenticate, tasks.getSelfTasks)

/**
 * @swagger
 * /tasks:
 *  post:
 *   summary: Used to create new task
 *   tags:
 *     - Tasks
 *   requestBody:
 *     description: Task data
 *     content:
 *       application/json:
 *         schema:
 *           $ref: '#/components/schemas/tasks'
 *   responses:
 *     200:
 *       description: returns newly created task
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/tasks'
 *     500:
 *       description: badImplementation
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/errors/badImplementation'
 */
router.post('/', authenticate, authorizeUser('appOwner'), createTask, tasks.addNewTask)

/**
 * @swagger
 * /tasks:
 *  patch:
 *   summary: Used to update task details
 *   tags:
 *     - Tasks
 *   requestBody:
 *     description: Task data to be updated
 *     content:
 *       application/json:
 *         schema:
 *           $ref: '#/components/schemas/tasks'
 *   responses:
 *     204:
 *       description: no content
 *     404:
 *       description: notFound
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/errors/notFound'
 *     500:
 *       description: badImplementation
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/errors/badImplementation'
 */
router.patch('/:id', authenticate, authorizeUser('appOwner'), updateTask, tasks.updateTask)

/**
 * @swagger
 * /tasks/username:
 *   get:
 *     summary: Use to get all the tasks of the requested user
 *     tags:
 *       - Tasks
 *     responses:
 *       200:
 *         description: returns all tasks of the requested user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/tasks'
 *       404:
 *         description: notFound
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errors/notFound'
 *       500:
 *         description: badImplementation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errors/badImplementation'
 */
router.get('/:username', tasks.getUserTasks)

/**
 * @swagger
 * /tasks/self/:id:
 *  patch:
 *   summary: used to update self task status
 *   tags:
 *     - Tasks
 *   requestBody:
 *     desciption: Task status
 *     required: true
 *     content:
 *       application/json:
 *         schema:
 *           $ref: '#/components/schemas/tasks'
 *   responses:
 *     204:
 *       description: Status of self task udpated
 *       content:
 *         application/json:
 *           schma:
 *             $ref: '#/components/schemas/tasks'
 *     401:
 *       description: unAuthorized
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/errors/unAuthorized'
 *     403:
 *       description: forbidden
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/errors/forbidden'
 *     404:
 *       description: notFound
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/errors/notFound'
 *     500:
 *       description: badImplementation
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/errors/badImplementation'
 */
router.patch('/self/:id', authenticate, updateSelfTask, tasks.updateTaskStatus)

// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = router
