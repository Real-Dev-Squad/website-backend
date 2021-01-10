const express = require('express')
const router = express.Router()
const tasksController = require('../controllers/tasksController')

/**
 * @swagger
 * /tasks:
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
 *   summary: Used to create new task
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
router.post('/', tasksController.addNewTask)

module.exports = router
