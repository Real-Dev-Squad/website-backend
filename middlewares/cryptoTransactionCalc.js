/**
 * Does Calculation for Transaction from one User to Other
 * @param {Object} toUserWallet - To whom currency should be transferred
 * @param {Object} fromUserWallet - From whom currency should be deducted
 * @param {Object} currency - Type of Currency
 * @param {Object} amount - amount of Currency
 */
const cryptoCalc = (fromUserWallet, toUserWallet, currencyType, amount) => {
  if (toUserWallet.user.isActive === true && fromUserWallet.user.isActive === true) {
    if (fromUserWallet.user.currency[currencyType] >= amount) {
      fromUserWallet.user.currency[currencyType] -= parseInt(amount)
      toUserWallet.user.currency[currencyType] += parseInt(amount)
  }
}
  return { fromUserWallet, toUserWallet }
}

module.exports = {
  cryptoCalc
}
