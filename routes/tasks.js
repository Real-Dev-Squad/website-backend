const express = require('express')
const router = express.Router()
const tasksController = require('../controllers/tasksController')
const { createTask, updateTask } = require('../middlewares/validators/tasks')

/**
 * @swagger
 * /tasks:
 *  get:
 *   summary: Used to get all the tasks
 *   responses:
 *     200:
 *       description: returns tasks
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/tasks'
 *     404:
 *       description : no tasks found
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

router.get('/', tasksController.fetchTasks)

/**
 * @swagger
 * /tasks:
 *  post:
 *   summary: Used to create new task
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
router.post('/', createTask, tasksController.addNewTask)

/**
 * @swagger
 * /tasks:
 *  patch:
 *   summary: Used to update task details
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
router.patch('/:id', updateTask, tasksController.updateTask)

module.exports = router
