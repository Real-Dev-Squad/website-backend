const express = require('express')
const router = express.Router()
const authenticate = require('../middlewares/authenticate')
const tasks = require('../controllers/tasks')
const { createTask, updateTask } = require('../middlewares/validators/tasks')
const authorizeOwner = require('../middlewares/authorizeOwner')

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
router.post('/', authenticate, authorizeOwner, createTask, tasks.addNewTask)

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
router.patch('/:id', authenticate, authorizeOwner, updateTask, tasks.updateTask)

/**
 * @swagger
 * /tasks/:username
 *   get:
 *     summary: Use to get all the tasks of the requested user
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: returns all tasks of the requested user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/tasks'
 *       500:
 *         description: badImplementation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errors/badImplementation'
 */
router.get('/:username', authenticate, tasks.getUserTasks)

module.exports = router
