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

const purgeMembersCache = async (_, res) => {
  try {
    const rep = await axios.post(
      CLOUD_FARE_PURGE_CACHE_API,
      {
        files: [
          'https://members.realdevsquad.com',
          {
            url: 'https://members.realdevsquad.com',
            headers: {
              Origin: 'https://www.cloudflare.com',
              'CF-IPCountry': 'US',
              'CF-Device-Type': 'desktop'
            }
          }
        ]
      },
      {
        headers: {
          'X-Auth-Key': 'ce6ed15370a25ae6b0825d2ed59ebbf1271ac',
          'X-Auth-Email': 'ashversache@gmail.com',
          Authorization: 'Bearer TiuuAHl_d8-yI0CQL6pF7-Z8bc2xVnN5uiWuw_ia'
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
