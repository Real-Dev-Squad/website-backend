const { default: axios } = require('axios')
const memberQuery = require('../models/members')

const CLOUD_FARE_ZONE_ID = 'ba637cab83d148e6935cbba0b197d495'
const CLOUD_FARE_PURGE_CACHE_API = `https://api.cloudflare.com/client/v4/zones/${CLOUD_FARE_ZONE_ID}/purge_cache`

/**
 * Fetches the data about our members
 *
 * @param _ {Object} - Express request object
 * @param res {Object} - Express response object
 */

const getMembers = async (_, res) => {
  try {
    const allMembers = await memberQuery.fetchMembers()

    return res.json({
      message: 'Members returned successfully!',
      members: allMembers
    })
  } catch (error) {
    logger.error(`Error while fetching all members: ${error}`)
    return res.boom.badImplementation('Something went wrong. Please contact admin')
  }
}

const purgeMembersCache = async (req, res) => {
  try {
    const { username } = req.userData?.username

    if (!username) {
      return res.boom.badRequest('Username is not valid')
    }

    const rep = await axios.post(
      CLOUD_FARE_PURGE_CACHE_API,
      {
        files: [`https://members.realdevsquad.com/${username}`]
      },
      {
        headers: {
          'X-Auth-Key': config.get('CLOUD_FARE_X_AUTH_KEY'),
          'X-Auth-Email': config.get('CLOUD_FARE_AUTH_EMAIL'),
          Authorization: `Bearer ${config.get('CLOUD_FARE_WORDPRESS_AUTHORIZATION_TOKEN')}`
        }
      }
    )

    return res.json(rep.data)
  } catch (error) {
    logger.error(`Error while clearing members cache: ${error}`)
    return res.boom.badImplementation('Something went wrong. Please contact admin')
  }
}

module.exports = {
  getMembers,
  purgeMembersCache
}
