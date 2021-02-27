const { addProduct } = require('../models/crypto')
const { fetchProducts } = require('../models/crypto')

const ERROR_MESSAGE = 'Something went wrong. Please try again or contact admin'

/**
 * Get the  contributions of the user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */

const getProducts = async (req, res) => {
  try {
    const productId = req.params.productId
    const productData = await fetchProducts(productId)
    return res.json(productData)
  } catch (err) {
    logger.error(`Error while retriving contributions ${err}`)
    return res.boom.badImplementation(ERROR_MESSAGE)
  }
}

const addNewProduct = async (req, res) => {
  try {
    const productData = req.body
    const product = await addProduct(productData)
    if (product) {
      return res.json({
        message: 'Product added successfully!',
        product
      })
    }
    return res.boom.conflict(`Product with id ${productData.id} already exist`)
  } catch (err) {
    logger.error(`Error while adding contributions ${err}`)
    return res.boom.badImplementation(ERROR_MESSAGE)
  }
}

module.exports = {
  getProducts,
  addNewProduct
}
