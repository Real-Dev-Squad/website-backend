const chai = require('chai')
const { expect } = chai
const chaiHttp = require('chai-http')

const { debitCoins, checkSufficientAmountAvaliable } = require('../../../utils/crypto/transaction')

chai.use(chaiHttp)

describe('Transaction helper', function () {
  describe('Test debitCoins function', function () {
    it('should return final amount after deduction', function () {
      const amount = {
        brass: 10,
        silver: 4,
        gold: 0
      }
      const available = {
        brass: 10,
        silver: 5,
        gold: 2
      }
      const finalCoins = debitCoins(amount, available)
      expect(finalCoins).to.be.a('object')
      expect(finalCoins).to.contain.keys('brass', 'silver', 'gold')
      expect(finalCoins.brass).to.be.eq(0)
      expect(finalCoins.silver).to.be.eq(1)
      expect(finalCoins.gold).to.be.eq(2)
    })
  })

  describe('Test checkSufficientAmountAvaliable function', function () {
    it('should return true if sufficient amount is available', function () {
      const amount = {
        brass: 10,
        silver: 4,
        gold: 0
      }
      const available = {
        brass: 10,
        silver: 5,
        gold: 2
      }
      const isAmonuntAvailable = checkSufficientAmountAvaliable(amount, available)
      expect(isAmonuntAvailable).to.be.a('boolean')
      expect(isAmonuntAvailable).to.be.eq(true)
    })

    it('should return false if sufficient amount is not available', function () {
      const amount = {
        brass: 10,
        silver: 4,
        gold: 3
      }
      const available = {
        brass: 10,
        silver: 5,
        gold: 2
      }
      const isAmonuntAvailable = checkSufficientAmountAvaliable(amount, available)
      expect(isAmonuntAvailable).to.be.a('boolean')
      expect(isAmonuntAvailable).to.be.eq(false)
    })
  })
})
