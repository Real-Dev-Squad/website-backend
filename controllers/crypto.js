const { addProduct } = require('../models/crypto')
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
    logger.error(`Error while retriving products ${err}`)
    return res.boom.badImplementation(ERROR_MESSAGE)
  }
}

/**
 * Post new  product
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const addNewProduct = async (req, res) => {
  try {
    const productData = req.body
    const product = await addProduct(productData)
    if (product) {
      return res.status(201).json({
        message: 'Product added successfully!',
        product
      })
    }
    return res.boom.conflict(`Product with id "${productData.id}" already exist`)
  } catch (err) {
    logger.error(`Error while adding products in crypto ${err}`)
    return res.boom.badImplementation(ERROR_MESSAGE)
  }
}

module.exports = {
  getProducts,
  addNewProduct
}
