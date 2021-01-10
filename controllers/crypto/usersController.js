const logger = require('../../utils/logger')
const userQuery = require('../../models/crypto/users')

/**
 * Fetches the data of user
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const getUser = async (req, res) => {
  try {
    const result = await userQuery.fetchUser(req.params.id)

    if (result) {
      return res.status(200).json({
        message: 'User returned successfully!',
        user: result.user
      })
    }

    return res.boom.notFound('User doesn\'t exist')
  } catch (error) {
    logger.error(`Error while fetching user: ${error}`)
    return res.boom.badImplementation('Something went wrong please contact admin')
  }
}

/**
 * Add new user
 *
 * @param req {Object} - Express request object
 * @param req.body {Object} - user object
 * @param res {Object} - Express response object
 */
const addNewUser = async (req, res) => {
  try {
    const user = await userQuery.addUser(req)

    if (user) {
      return res.status(201).json({
        message: 'user added successfully!',
        userId: user.id
      })
    }

    return res.boom.conflict('user already exists')
  } catch (error) {
    logger.error(`Error while creating new user: ${error}`)
    return res.boom.badImplementation('Something went wrong please contact admin')
  }
}

/**
 * Update user trainsaction history
 *
 * @param req {Object} - Express request object
 * @param req.body {Object} - user object
 * @param res {Object} - Express response object
 */
const updateTransactionHistory = async (req, res) => {
  try {
    const user = await userQuery.updateTransactionHistory(req.params.id, req.body)

    if (user) {
      return res.status(200).json({
        message: 'TransactionHistory updated successfully!',
        userId: user.id
      })
    }

    return res.boom.notFound('User doesn\'t exist')
  } catch (error) {
    logger.error(`Error while updating user transaction history: ${error}`)
    return res.boom.badImplementation('Something went wrong please contact admin')
  }
}

/**
 * Update user shopping history
 *
 * @param req {Object} - Express request object
 * @param req.body {Object} - user object
 * @param res {Object} - Express response object
 */
const updateShoppingHistory = async (req, res) => {
  try {
    const user = await userQuery.updateShoppingHistory(req.params.id, req.body)

    if (user) {
      return res.status(200).json({
        message: 'shoppingHistory updated successfully!',
        userId: user.id
      })
    }

    return res.boom.notFound('User doesn\'t exist')
  } catch (error) {
    logger.error(`Error while updating user shopping history: ${error}`)
    return res.boom.badImplementation('Something went wrong please contact admin')
  }
}

/**
 * Update user shopping cart
 *
 * @param req {Object} - Express request object
 * @param req.body {Object} - user object
 * @param res {Object} - Express response object
 */
const updateCart = async (req, res) => {
  try {
    const user = await userQuery.updateCart(req.params.id, req.body)

    if (user) {
      return res.status(200).json({
        message: 'cart updated successfully!',
        userId: user.id
      })
    }

    return res.boom.notFound('User doesn\'t exist')
  } catch (error) {
    logger.error(`Error while updating user cart: ${error}`)
    return res.boom.badImplementation('Something went wrong please contact admin')
  }
}

/**
 * Send user coins
 *
 * @param req {Object} - Express request object
 * @param req.body {Object} - user object
 * @param res {Object} - Express response object
 */
const sendCoins = async (req, res) => {
  try {
    const user = await userQuery.sendCoins(req.params.id, req.body)

    if (user) {
      return res.status(200).json({
        message: user.message,
        userId: user.id
      })
    }

    return res.boom.notFound('User doesn\'t exist')
  } catch (error) {
    logger.error(`Error while updating user cart: ${error}`)
    return res.boom.badImplementation('Something went wrong please contact admin')
  }
}

/**
 * Request user for coins
 *
 * @param req {Object} - Express request object
 * @param req.body {Object} - user object
 * @param res {Object} - Express response object
 */
const receiveCoins = async (req, res) => {
  try {
    const user = await userQuery.receiveCoins(req.params.id, req.body)

    if (user) {
      return res.status(200).json({
        message: user.message
      })
    }

    return res.boom.notFound('User doesn\'t exist')
  } catch (error) {
    logger.error(`Error while updating user cart: ${error}`)
    return res.boom.badImplementation('Something went wrong please contact admin')
  }
}

module.exports = {
  getUser,
  addNewUser,
  updateTransactionHistory,
  updateShoppingHistory,
  updateCart,
  sendCoins,
  receiveCoins
}
