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

describe('transaction', function () {
  before(function () {
    transactionDataArray.forEach(async (element, index) => {
      await transactionsModel.add(transactionDataArray[index])
    })
  })
  after(async function () {
    await cleanDb()
  })

  describe('when fetchTransactionsByUserId called, it ', function () {
    it('in DESC order', async function () {
      const expectedTransactionData = transactionDataArray.sort((a, b) => {
        return new Date(b.dateTime) - new Date(a.dateTime)
      })[0]
      const inputUserID = expectedTransactionData.userId
      const data = await transactionModelsImpl.fetchTransactionsByUserId(inputUserID, 0, 1, 'DESC')
      // eslint-disable-next-line no-console
      console.log('desc data', data)
      const outputTransactionData = data[0]
      expect(expectedTransactionData).to.deep.equal(outputTransactionData)
    })
    it('in ASC order', async function () {
      const expectedTransactionData = transactionDataArray.sort((a, b) => {
        return new Date(a.dateTime) - new Date(b.dateTime)
      })[0]
      const inputUserID = expectedTransactionData.userId
      const data = await transactionModelsImpl.fetchTransactionsByUserId(inputUserID, 0, 1, 'ASC')
      // eslint-disable-next-line no-console
      console.log('asc dta', data)
      const outputTransactionData = data[0]
      expect(expectedTransactionData).to.deep.equal(outputTransactionData)
    })
    it('All data in DESC order', async function () {
      const expectedTransactionData = transactionDataArray.sort((a, b) => {
        return new Date(b.dateTime) - new Date(a.dateTime)
      })
      const inputUserID = expectedTransactionData[0].userId
      const outputTransactionData = await transactionModelsImpl.fetchTransactionsByUserId(inputUserID, 0, 10, 'DESC')
      outputTransactionData.forEach((element, index) => {
        expect(expectedTransactionData[index]).to.deep.equal(outputTransactionData[index])
      })
    })
    it('All data in ASC order ', async function () {
      const expectedTransactionData = transactionDataArray.sort((a, b) => {
        return new Date(a.dateTime) - new Date(b.dateTime)
      })
      const inputUserID = expectedTransactionData[0].userId
      const outputTransactionData = await transactionModelsImpl.fetchTransactionsByUserId(inputUserID, 0, 10, 'ASC')
      outputTransactionData.forEach((element, index) => {
        expect(expectedTransactionData[index]).to.deep.equal(outputTransactionData[index])
      })
    })
  })
})
