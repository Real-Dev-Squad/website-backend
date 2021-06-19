const firestore = require('../utils/firestore')
const logger = require('../utils/logger')
const urlsModel = firestore.collection('urls')

const ERROR_MESSAGE = 'Error getting urls'

/**
 * Add url
 *
 * @param urlData {Object}: url data object to be stored in DB
 * @return {Promise<{urlData: Object}>}
 */
const addUrl = async (urlData) => {
  try {
    const { longUrl, shortUrl } = urlData
    const { id } = await urlsModel.add(urlData)
    return { id, longUrl, shortUrl }
  } catch (err) {
    logger.error(ERROR_MESSAGE, err)
    throw err
  }
}

/**
 * Fetch Url
 *
 * @param longUrl {string}: url string to fetch urlData
 * @return {Promise<{urlData|Object}>}
 */
const checkUrlExists = async (longUrl) => {
  try {
    const snapshot = await urlsModel.where('longUrl', '==', longUrl).get()
    const [urlData] = snapshot.docs
    if (urlData) {
      return { id: urlData.id, ...urlData.data() }
    }
    return false
  } catch (err) {
    logger.error(ERROR_MESSAGE, err)
    throw err
  }
}

const fetchUrl = async (shortUrl) => {
  try {
    const snapshot = await urlsModel.where('shortUrl', '==', shortUrl).get()
    const [urlData] = snapshot.docs
    if (urlData) {
      const { longUrl, shortUrl } = urlData
      return { id: urlData.id, longUrl, shortUrl }
    }
    return false
  } catch (err) {
    logger.error(ERROR_MESSAGE, err)
    throw err
  }
}

module.exports = {
  addUrl,
  checkUrlExists,
  fetchUrl
}
