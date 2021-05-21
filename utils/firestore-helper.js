/**
 * Extracts the data form the first doc of firestore response
 * @return {Promise<object>}
 */
const extractReferenceDocumentData = (doc) => {
  return doc.docs[0] && doc.docs[0].data()
}

/**
 * Gets the id of firestore document
 * @return {Promise<object>}
 */
const extractReferenceDocumentId = (doc) => {
  return doc.docs[0] && doc.docs[0].id
}

module.exports = {
  extractReferenceDocumentData,
  extractReferenceDocumentId
}
