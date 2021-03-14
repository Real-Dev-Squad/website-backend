/**
 * Does Calculation for Transaction from one User to Other
 * @param {Object} toUserWallet - To whom currency should be transferred
 * @param {Object} fromUserWallet - From whom currency should be deducted
 * @param {Object} currency - Type of Currency
 * @param {Object} amount - amount of Currency
 */
const cryptoCalc = (fromUserWallet, toUserWallet, currency, amount) => {
  if (toUserWallet.user.isActive === true && fromUserWallet.user.isActive === true) {
    if (currency === 'brass' && fromUserWallet.user.currency.brass >= amount) {
      fromUserWallet.user.currency.brass -= parseInt(amount)
      toUserWallet.user.currency.brass += parseInt(amount)
    } else if (currency === 'gold' && fromUserWallet.user.currency.gold >= amount) {
      fromUserWallet.user.currency.gold -= parseInt(amount)
      toUserWallet.user.currency.gold += parseInt(amount)
    } else if (currency === 'silver' && fromUserWallet.user.currency.silver >= amount) {
      fromUserWallet.user.currency.silver -= parseInt(amount)
      toUserWallet.user.currency.silver += parseInt(amount)
    } else if (currency === 'neelam' && fromUserWallet.user.currency.neelam >= amount) {
      fromUserWallet.user.currency.neelam -= parseInt(amount)
      toUserWallet.user.currency.neelam += parseInt(amount)
    } else if (currency === 'dinero' && fromUserWallet.user.currency.dinero >= amount) {
      fromUserWallet.user.currency.dinero -= parseInt(amount)
      toUserWallet.user.currency.dinero += parseInt(amount)
    }
  }
  return { fromUserWallet, toUserWallet }
}

module.exports = {
  cryptoCalc
}
