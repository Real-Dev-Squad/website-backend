const firestore = require('../utils/firestore')
const { checkSufficientAmountAvaliable, debitCoins } = require('../utils/crypto/transaction')
const { WALLETS, TRANSACTIONS, CRYPTO_PRODUCTS } = require('../constants/firestore-collections')
const productsCollection = firestore.collection(CRYPTO_PRODUCTS)
const walletsCollection = firestore.collection(WALLETS) // Users collection name to be standardized
const transactionCollection = firestore.collection(TRANSACTIONS) // Users collection name to be standardized
/**
 * Fetches the data of crypto product
 * @return {Promise<product|Object>}
 */

const fetchProducts = async () => {
  try {
    const snapshot = await productsCollection.get()

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
    const product = await productsCollection.doc(id).get()
    if (!product.exists) {
      await productsCollection.doc(id).set(productData)
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
    const snapshot = await productsCollection.doc(productId).get()
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
    const userWalletRef = await walletsCollection.where('userId', '==', userId).limit(1)
    const isTransactionCompleted = await firestore.runTransaction(async t => {
      const userWalletDocsArray = await t.get(userWalletRef)
      const [userWalletDoc] = userWalletDocsArray.docs
      const userWallet = await userWalletDoc.data()
      if (checkSufficientAmountAvaliable(amount, userWallet.currencies)) {
        const currencies = debitCoins(amount, userWallet.currencies)
        const userWalletUpdateRef = walletsCollection.doc(userWalletDoc.id)
        t.update(userWalletUpdateRef, { currencies })
        const transactionDocument = transactionCollection.doc()
        t.set(transactionDocument, {
          userId,
          amount,
          orders: items,
          typeOfTransaction: 'products',
          totalQuantity,
          transactionId: transactionDocument.id,
          timestamp: Date.now()
        })
        return true
      }
      return false
    })
    return isTransactionCompleted
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
