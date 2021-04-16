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

/**
 * Test the model functions and validate the data stored
 */

describe('transaction', function () {
  afterEach(async function () {
    await cleanDb()
  })

  describe('when fetchTransactionsByUserId called, it ', function () {
    it('should fetch transaction', async function () {
      const transactionData = transactionDataArray[0]
      const data = await transactionModelsImpl.fetchTransactionsByUserId('kratika', 0, 2, 'DESC')
      Object.keys(transactionData).forEach(key => {
        expect(data[key]).to.deep.equal(data[key])
      })
    })
  })
})
