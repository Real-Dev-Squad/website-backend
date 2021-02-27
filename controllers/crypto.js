const { fetchProducts } = require('../models/crypto')

const ERROR_MESSAGE = 'Something went wrong. Please try again or contact admin'

/**
 * Get the  products details
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */

const getProducts = async (req, res) => {
  try {
    const productData = await fetchProducts()
    return res.json({
      message: Object.keys(productData).length !== 0 ? 'Products returned successfully!' : 'No products found',
      products: productData
    })
  } catch (err) {
    logger.error(`Error while retriving contributions ${err}`)
    return res.boom.badImplementation(ERROR_MESSAGE)
  }
}

module.exports = {
  getProducts
}
