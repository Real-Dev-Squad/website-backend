const firestore = require('../utils/firestore')
const cryptoProductsCollection = firestore.collection('crypto-products')

/**
 * Fetches the data of crypto product
 * @return {Promise<userModel|Array>}
 */

const fetchProducts = async () => {
  try {
    const snapshot = await cryptoProductsCollection.get()

    const productsData = {}

    snapshot.forEach((doc) => {
      const data = doc.data()
      productsData[data.id] = { ...data }
    })
    return productsData
  } catch (err) {
    logger.error('Error retrieving product data', err)
    throw err
  }
}

/**
 * Fetches the data of crypto product
 * @param productId { string }: product id
 * @return {Promise<userModel|Array>}
 */

const fetchProduct = async (productId) => {
  try {
    const snapshot = await cryptoProductsCollection.doc(productId).get()
    if (snapshot.exists) {
      const productData = snapshot.data()
      return productData
    }
    return undefined
  } catch (err) {
    logger.error('Error retrieving product data', err)
    throw err
  }
}

module.exports = {
  fetchProducts,
  fetchProduct
}
