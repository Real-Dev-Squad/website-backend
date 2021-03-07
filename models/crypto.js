const Firestore = require('@google-cloud/firestore')
const firestore = require('../utils/firestore')
const { checkSufficientAmountAvaliable, debitCoins } = require('../utils/crypto/transaction')
const cryptoProductsCollection = firestore.collection('crypto-products')
const cryptoUsersCollection = firestore.collection('crypto-users') // Users collection name to be standardized
/**
 * Fetches the data of crypto product
 * @return {Promise<product|Object>}
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
    logger.error('Error retrieving products data', err)
    throw err
  }
}

/**
 * Fetches the data of crypto product
 * @param productData {object} - product details that is to be put in DB
 * @return {Promise<product|object>}
 */
const addProduct = async (productData) => {
  try {
    const { id } = productData
    const product = await cryptoProductsCollection.doc(id).get()
    if (!product.exists) {
      await cryptoProductsCollection.doc(id).set(productData)
      return productData
    } else {
      return undefined
    }
  } catch (err) {
    logger.error('Error adding product data', err)
    throw err
  }
}

/**
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

/**
 * @param Object : object with userId, amount, items, totalQuantity
 * @return {Promise<boolean>}
 */
const purchaseTransaction = async ({ userId, amount, items, totalQuantity = null }) => {
  try {
    const userDoc = cryptoUsersCollection.doc(userId)
    const transactionCompleted = await firestore.runTransaction(async t => {
      const userRef = await t.get(userDoc)
      const userData = userRef.data()
      if (checkSufficientAmountAvaliable(amount, userData.coins)) {
        const coins = debitCoins(amount, userData.coins)
        await t.update(userDoc, {
          coins: coins,
          transactions: Firestore.FieldValue.arrayUnion({
            items: items,
            totalQuantity,
            totlaAmount: amount,
            time: Date.now()
          })
        })
        return true
      }
      return false
    })
    return transactionCompleted
  } catch (err) {
    logger.error('Error while making purchase Transaction request \nTransaction failure:', err)
    throw err
  }
}

module.exports = {
  fetchProducts,
  addProduct,
  fetchProduct,
  purchaseTransaction
}
