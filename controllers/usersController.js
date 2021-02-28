
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
    const result = await userQuery.fetchUser({ username: req.params.username })
    const { phone, email, ...user } = result.user

    if (result.userExists) {
      return res.json({
        message: 'User returned successfully!',
        user
      })
    }

    return res.boom.notFound('User doesn\'t exist')
  } catch (error) {
    logger.error(`Error while fetching user: ${error}`)
    return res.boom.serverUnavailable('Something went wrong please contact admin')
  }
}

/**
 * Checks whether a user exists or not
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const checkUser = async (req, res) => {
  try {
    const result = await userQuery.fetchUser({ username: req.params.username })
    return res.json({
      userAvailable: !result.userExists
    })
  } catch (error) {
    logger.error(`Error while checking user: ${error}`)
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
      if (req.query.private) {
        return res.send(req.userData)
      }
      const { phone, email, ...userData } = req.userData
      return res.send(userData)
    }
    return res.boom.notFound('User doesn\'t exist')
  } catch (error) {
    logger.error(`Error while fetching user: ${error}`)
    return res.boom.badImplementation('An internal server error occurred')
  }
}

/**
 * Update the user
 *
 * @param req {Object} - Express request object
 * @param req.body {Object} - User object
 * @param res {Object} - Express response object
 */
const updateSelf = async (req, res) => {
  try {
    const { id: userId } = req.userData
    if (req.body.username) {
      const { user } = await userQuery.fetchUser({ userId })
      if (!user.incompleteUserDetails) {
        return res.boom.forbidden('Cannot update username again')
      }
      await userQuery.setIncompleteUserDetails(userId)
    }

    const user = await userQuery.addOrUpdate(req.body, userId)

    if (!user.isNewUser) {
      return res.status(204).send()
    }

    return res.boom.notFound('User not found')
  } catch (error) {
    logger.error(`Error while updating user: ${error}`)
    return res.boom.serverUnavailable('Something went wrong please contact admin')
  }
}

module.exports = {
  updateSelf,
  getUsers,
  getSelfDetails,
  getUser,
  checkUser
}
