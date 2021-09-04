/**
 * This eslint rule is disabled because of https://github.com/nodesecurity/eslint-plugin-security/issues/21
 * It gives linting errors in testing the DB data with keys from fixtures
 */
/* eslint-disable security/detect-object-injection */

const chai = require('chai')
const { expect } = chai

const cleanDb = require('../../utils/cleanDb')
const transactionModelsImpl = require('../../../models/transaction')
const transactionDataArray = require('../../fixtures/transaction/transactions')()
const firestore = require('../../../utils/firestore')
const transactionsModel = firestore.collection('transaction')

/**
 * Test the model functions and validate the data stored
 */

describe('Transactions', function () {
  before(function () {
    transactionDataArray.forEach(async (element, index) => {
      await transactionsModel.add(transactionDataArray[index])
    })
  })
  after(async function () {
    await cleanDb()
  })

  describe('fetchTransactionsByUserId', function () {
    it('Should return data in descending order', async function () {
      const expectedTransactionData = transactionDataArray.sort((a, b) => b.dateTime - a.dateTime)[0]
      const inputUserID = expectedTransactionData.userId
      const data = await transactionModelsImpl.fetchTransactionsByUserId(inputUserID, 0, 1, 'DESC')
      const [outputTransactionData] = data
      expect(expectedTransactionData).to.deep.equal(outputTransactionData)
    })
    it('Should return data in ascending order', async function () {
      const expectedTransactionData = transactionDataArray.sort((a, b) => a.dateTime - b.dateTime)[0]
      const inputUserID = expectedTransactionData.userId
      const data = await transactionModelsImpl.fetchTransactionsByUserId(inputUserID, 0, 1, 'ASC')
      const [outputTransactionData] = data
      expect(expectedTransactionData).to.deep.equal(outputTransactionData)
    })
    it('Should return all data in descending order', async function () {
      const expectedTransactionData = transactionDataArray.sort((a, b) => b.dateTime - a.dateTime)
      const inputUserID = expectedTransactionData[0].userId
      const outputTransactionData = await transactionModelsImpl.fetchTransactionsByUserId(inputUserID, 0, 10, 'DESC')
      outputTransactionData.forEach((element, index) => {
        expect(expectedTransactionData[index]).to.deep.equal(outputTransactionData[index])
      })
    })
    it('Should return all data in ascending order ', async function () {
      const expectedTransactionData = transactionDataArray.sort((a, b) => a.dateTime - b.dateTime)
      const inputUserID = expectedTransactionData[0].userId
      const outputTransactionData = await transactionModelsImpl.fetchTransactionsByUserId(inputUserID, 0, 10, 'ASC')
      outputTransactionData.forEach((element, index) => {
        expect(expectedTransactionData[index]).to.deep.equal(outputTransactionData[index])
      })
    })
  })
})
