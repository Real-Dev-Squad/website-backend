/**
 * This file contains wrapper functions to interact with the DB.
 * This will contain the DB schema if we start consuming an ORM for managing the DB operations
 */

const logger = require('../../utils/logger')
const firestore = require('../../utils/firestore')
const productsModel = firestore.collection('crypto/shop/products')

/**
 * Fetches the data of products in crypto site
 * @return {Promise<productsModel|Array>}
 */

const fetchProducts = async () => {
  try {
    const snapshot = await productsModel.get()

    const allProducts = []

    snapshot.forEach((doc) => {
      allProducts.push({
        id: doc.id,
        ...doc.data()
      })
    }
    )

    return allProducts
  } catch (err) {
    logger.error('Error retrieving products data', err)
    throw err
  }
}

/**
 * Fetches the data of a product in crypto site
 * @return {Promise<productsModel|Object>}
 */

const fetchProduct = async (id) => {
  try {
    const product = await productsModel.doc(id).get()
    if (product.exists) {
      return {
        product: {
          id: id,
          ...product.data()
        }
      }
    }
    return ''
  } catch (err) {
    logger.error('Error retrieving product data', err)
    throw err
  }
}

/**
 * Adds the data of a product to crypto site
 * @return {Promise<productsModel|Object>}
 */

const addProduct = async (productData) => {
  try {
    let productInfo = await productsModel.where('productId', '==', productData.productId).limit(1).get()

    if (productInfo.empty) {
      productInfo = await productsModel.doc().set(productData)
      return { productId: productInfo.id }
    }

    return ''
  } catch (err) {
    logger.error('Error adding product data', err)
    throw err
  }
}

module.exports = {
  fetchProducts,
  fetchProduct,
  addProduct
}
