const logger = require('../../utils/logger')
const productQuery = require('../../models/crypto/products')

/**
 * Fetches the data of products
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const getProducts = async (req, res) => {
  try {
    const allProducts = await productQuery.fetchProducts()

    return res.json({
      message: 'Products returned successfully!',
      Products: allProducts
    })
  } catch (error) {
    logger.error(`Error while fetching all products: ${error}`)
    return res.boom.serverUnavailable('Something went wrong please contact admin')
  }
}

/**
 * Fetches the data od produc
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const getProduct = async (req, res) => {
  try {
    const product = await productQuery.fetchProduct(req.params.id)
    if (product) {
      return res.status(200).json({
        message: 'Product returned successfully!',
        Products: product
      })
    }
    return res.status(404).json({
      message: 'Product not found!'
    })
  } catch (error) {
    logger.error(`Error while fetching product: ${error}`)
    return res.boom.serverUnavailable('Something went wrong please contact admin')
  }
}

/**
 * Add new Product
 *
 * @param req {Object} - Express request object
 * @param req.body {Object} - Product object
 * @param res {Object} - Express response object
 */
const addNewProduct = async (req, res) => {
  try {
    const product = await productQuery.addProduct(req.body)

    if (product) {
      return res.status(201).json({
        message: 'Product added successfully!',
        productId: product.productId
      })
    }

    return res.boom.conflict('Product already exists')
  } catch (error) {
    logger.error(`Error while creating new product: ${error}`)
    return res.boom.serverUnavailable('Something went wrong please contact admin')
  }
}

module.exports = {
  getProducts,
  getProduct,
  addNewProduct
}
