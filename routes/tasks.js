const express = require('express')
const router = express.Router()
const tasksController = require('../controllers/tasksController')

/**
 * @swagger
 * /tasks/:
 *   summary: Used to get all the tasks
 *   responses:
 *     200:
 *       description: returns tasks
 *     404:
 *       description : no tasks found
 *       content:
 *         application/json:
 *     503:
 *       description: serverUnavailable
 *       content:
 *         application/json:
 */

router.get('/tasks', tasksController.fetchTasks)

/**
 * @swagger
 * /tasks/:
 *   summary: Used to create new task
 *   responses:
 *     200:
 *       description: returns newly created task
 *     503:
 *       description: serverUnavailable
 *       content:
 *         application/json:
 */
router.post('/task', tasksController.addNewTask)

module.exports = router
