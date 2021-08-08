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
  beforeEach(async function () {
    for (let i = 0; i < transactionDataArray.length; i++) {
      await transactionsModel.add(transactionDataArray[i])
    }
  })
  afterEach(async function () {
    await cleanDb()
  })

  describe('when fetchTransactionsByUserId called, it ', function () {
    it('in DESC order', async function () {
      const expectedTransactionData = transactionDataArray.sort((a, b) => {
        return new Date(b.dateTime) - new Date(a.dateTime)
      })[0]
      const inputUserID = expectedTransactionData.userId
      const data = await transactionModelsImpl.fetchTransactionsByUserId(inputUserID, 0, 1, 'DESC')
      const outputTransactionData = data[0]
      expect(expectedTransactionData).to.deep.equal(outputTransactionData)
    })
    it('in ASC order', async function () {
      const expectedTransactionData = transactionDataArray.sort((a, b) => {
        return new Date(a.dateTime) - new Date(b.dateTime)
      })[0]
      const inputUserID = expectedTransactionData.userId
      const data = await transactionModelsImpl.fetchTransactionsByUserId(inputUserID, 0, 1, 'ASC')
      const outputTransactionData = data[0]
      expect(expectedTransactionData).to.deep.equal(outputTransactionData)
    })
    it('All data in DESC order', async function () {
      const expectedTransactionData = transactionDataArray.sort((a, b) => {
        return new Date(b.dateTime) - new Date(a.dateTime)
      })
      const inputUserID = expectedTransactionData[0].userId
      const data = await transactionModelsImpl.fetchTransactionsByUserId(inputUserID, 0, 10, 'DESC')
      const DATA_LENGTH = data.length
      for (let i = 0; i < DATA_LENGTH; i++) {
        const outputTransactionData = data[i]
        expect(expectedTransactionData[i]).to.deep.equal(outputTransactionData)
      }
    })
    it('All data in ASC order ', async function () {
      const expectedTransactionData = transactionDataArray.sort((a, b) => {
        return new Date(a.dateTime) - new Date(b.dateTime)
      })
      const inputUserID = expectedTransactionData[0].userId
      const data = await transactionModelsImpl.fetchTransactionsByUserId(inputUserID, 0, 10, 'ASC')
      const DATA_LENGTH = data.length
      for (let i = 0; i < DATA_LENGTH; i++) {
        const outputTransactionData = data[i]
        expect(expectedTransactionData[i]).to.deep.equal(outputTransactionData)
      }
    })
  })
})
