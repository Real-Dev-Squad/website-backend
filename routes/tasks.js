const express = require('express')
const router = express.Router()
const tasksController = require('../controllers/tasksController')

router.get('/', tasksController.fetchTasks)
router.post('/', tasksController.addNewTask)

module.exports = router
