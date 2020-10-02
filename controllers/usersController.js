const logger = require('../utils/logger')
const userQuery = require('../models/users')

/**
 * Fetches the data about our users
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const getUsers = async (req, res) => {
  try {
    const allUsers = await userQuery.fetchUsers(req.query)

    return res.json({
      message: 'Users returned successfully!',
      users: allUsers
    })
  } catch (error) {
    logger.error(`Error while fetching all users: ${error}`)
    return res.boom.serverUnavailable('Something went wrong please contact admin')
  }
}

/**
 * Fetches the data about user with given id
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const getUser = async (req, res) => {
  try {
    const result = await userQuery.fetchUser(req.params.id)

    if (result.userExists) {
      return res.json({
        message: 'User returned successfully!',
        user: result.user
      })
    }

    return res.boom.notFound('User doesn\'t exist')
  } catch (error) {
    logger.error(`Error while fetching user: ${error}`)
    return res.boom.serverUnavailable('Something went wrong please contact admin')
  }
}

/**
 * Fetches the data about logged in user
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const getSelfDetails = (req, res) => {
  try {
    if (req.userData) {
      return res.send(req.userData)
    }
    return res.boom.notFound('User doesn\'t exist')
  } catch (error) {
    logger.error(`Error while fetching user: ${error}`)
    return res.boom.badImplementation('An internal server error occurred')
  }
}

/**
 * Add new user
 *
 * @param req {Object} - Express request object
 * @param req.body {Object} - User object
 * @param res {Object} - Express response object
 */
const addNewUser = async (req, res) => {
  try {
    const user = await userQuery.addOrUpdate(req.body)

    if (user.isNewUser) {
      return res.json({
        message: 'User added successfully!',
        userId: user.userId
      })
    }

    return res.boom.conflict('User already exists')
  } catch (error) {
    logger.error(`Error while creating new user: ${error}`)
    return res.boom.serverUnavailable('Something went wrong please contact admin')
  }
}

/**
 * Update user
 *
 * @param req {Object} - Express request object
 * @param req.params.id {string} - User id
 * @param req.body {Object} - User object
 * @param res {Object} - Express response object
 */
const updateUser = async (req, res) => {
  try {
    const user = await userQuery.addOrUpdate(req.body, req.params.id)

    if (!user.isNewUser) {
      return res.json({
        message: 'User updated successfully!',
        userId: user.userId
      })
    }

    return res.boom.notFound('User not found')
  } catch (error) {
    logger.error(`Error while updating user: ${error}`)
    return res.boom.serverUnavailable('Something went wrong please contact admin')
  }
}

module.exports = {
  addNewUser,
  updateUser,
  getUsers,
  getSelfDetails,
  getUser
}
