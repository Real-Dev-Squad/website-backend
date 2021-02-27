const { fetchProducts, fetchProduct } = require('../models/crypto')

const ERROR_MESSAGE = 'Something went wrong. Please try again or contact admin'

/**
 * Get the  contributions of the user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */

const getProducts = async (req, res) => {
  try {
    const productData = await fetchProducts()
    return res.json(productData)
  } catch (err) {
    logger.error(`Error while retriving contributions ${err}`)
    return res.boom.badImplementation(ERROR_MESSAGE)
  }
}

/**
 * Get the  contributions of the user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */

const getProduct = async (req, res) => {
  try {
    const productId = req.params.productId
    const productData = await fetchProduct(productId)
    if (productData) {
      return res.json({
        message: 'Product returned successfully.',
        product: productData
      })
    }
    return res.boom.notFound('Product doesn\'t exist')
  } catch (err) {
    logger.error(`Error while retriving products ${err}`)
    return res.boom.badImplementation(ERROR_MESSAGE)
  }
}

module.exports = {
  getProducts,
  getProduct
}
