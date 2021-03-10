const { fetchUser } = require('../models/users')

/**
 * Used for receiving userId when providing username
 *
 * @param username {String} - username of the User.
 * @returns id {String} - userId of the same user
 */
const toUserId = async (username) => {
  try {
    const { user: { id } } = await fetchUser({ username })
    return id
  } catch (error) {
    logger.error('Something went wrong', error)
    throw error
  }
}
/**
 * Used for receiving username when providing userId
 *
 * @param userId {String} - userId of the User.
 * @returns username {String} - username of the same user
 */
const toUsername = async (userId) => {
  try {
    const { user: { username } } = await fetchUser({ userId })
    return username
  } catch (error) {
    logger.error('Something went wrong', error)
    throw error
  }
}

module.exports = {
  toUserId,
  toUsername
}
