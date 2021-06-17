const { nanoid } = require('nanoid')
const urlQuery = require('../models/urls')

const ERROR_MESSAGE = 'Error getting urls'
const NOTVALIDURL = 'Please attach valid URL'
const NOTVALIDSHORTURL = 'Please attach valid ID'
const validUrlRegex = /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i
/**
 *
 * @param req {String} - Exxpress request object
 * @param res {Object} - Express response object
 */

const getLongUrl = async (req, res) => {
  try {
    const { shortUrl } = req.params
    const fetchUrlData = await urlQuery.fetchUrl(shortUrl)
    if (fetchUrlData) {
      res.redirect(fetchUrlData.longUrl)
    }
    return res.boom.notFound(NOTVALIDSHORTURL)
  } catch (err) {
    logger.error(ERROR_MESSAGE, err)
    throw err
  }
}

/**
 *
 * @param req {String} - Exxpress request object
 * @param res {Object} - Express response object
 */

const postUrlData = async (req, res) => {
  try {
    const { longUrl } = req.body
    const fetchAvailableUrl = await urlQuery.checkUrlExists(longUrl)
    if (fetchAvailableUrl) {
      return res.json({
        message: 'Url returned successfully',
        urlData: fetchAvailableUrl
      })
    }
    if (validUrlRegex.test(longUrl)) {
      const shortUrl = 'RDS' + nanoid(6)
      const urlData = await urlQuery.addUrl({
        shortUrl: shortUrl,
        longUrl: longUrl
      })
      return res.json({
        message: 'Url created successfully',
        urlData: urlData
      })
    }
    return res.boom.notFound(NOTVALIDURL)
  } catch (err) {
    logger.error(ERROR_MESSAGE, err)
    throw err
  }
}

module.exports = {
  postUrlData,
  getLongUrl
}
