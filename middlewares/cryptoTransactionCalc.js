/**
 * Does Calculation for Transaction from one User to Other
 * @param {Object} verifyUserTO - To whom currency should be transferred
 * @param {Object} verifyUserFrom - From whom currency should be deducted
 * @param {Object} currency - Type of Currency
 * @param {Object} amount - amount of Currency
 */
const cryptoCalc = (verifyUserTO, verifyUserFrom, currency, amount) => {
    if (verifyUserTO && verifyUserFrom) {
      if (currency === 'brass' && verifyUserFrom.user.coins.brass >= amount) {
        verifyUserFrom.user.coins.brass = verifyUserFrom.user.coins.brass - parseInt(amount)
        verifyUserTO.user.coins.brass = verifyUserTO.user.coins.brass + parseInt(amount)
      } else if (currency === 'gold' && verifyUserFrom.user.coins.gold >= amount) {
        verifyUserFrom.user.coins.gold = verifyUserFrom.user.coins.gold - parseInt(amount)
        verifyUserTO.user.coins.gold = verifyUserTO.user.coins.gold + parseInt(amount)
      } else if (currency === 'silver' && verifyUserFrom.user.coins.silver >= amount) {
        verifyUserFrom.user.coins.silver = verifyUserFrom.user.coins.silver - parseInt(amount)
        verifyUserTO.user.coins.silver = verifyUserTO.user.coins.silver + parseInt(amount)
      }
    }
    return { verifyUserFrom, verifyUserTO }
  }
  
  module.exports = {
    cryptoCalc
  }