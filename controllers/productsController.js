const { fetchProducts, fetchProduct, addProduct, purchaseTransaction } = require('../models/products')

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
 * Post new product
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

/**
 * Get the product details
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

/**
 * Make purchase request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const makeTransaction = async (req, res) => {
  try {
    const { amount, items, totalQuantity } = req.body
    const { id: userId } = req.userData
    const purchaseResponse = await purchaseTransaction({ userId, amount, items, totalQuantity })
    if (purchaseResponse) {
      return res.json({
        message: 'Transaction Successful.'
      })
    }
    return res.boom.paymentRequired('Insufficient coins.')
  } catch (err) {
    logger.error(`Error while retriving products ${err}`)
    return res.boom.badImplementation(ERROR_MESSAGE)
  }
}

module.exports = {
  getProducts,
  addNewProduct,
  getProduct,
  makeTransaction
}
