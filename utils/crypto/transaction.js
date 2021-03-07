/**
 * Check if balance is available to make successful transaction
 * @param {Object} debit - amount to be deduced (coins object)
 * @param {Object} available - actual amount avaliable (conins object)
 */
function checkSufficientAmountAvaliable (debit, available) {
  const brassAvailablity = (debit.brass <= available.brass)
  const silverAvailablity = (debit.silver <= available.silver)
  const goldAvailablity = (debit.gold <= available.gold)
  if (brassAvailablity && silverAvailablity && goldAvailablity) return true
  else return false
}

/**
 * Returns the updated balance after deducing the amount from the user's coins
 * @param {Object} debit - amount to be deduced (coins object)
 * @param {Object} available - actual amount avaliable (conins object)
 */
function debitCoins (debit, available) {
  const coins = {
    brass: 0,
    silver: 0,
    gold: 0
  }
  coins.brass = available.brass - debit.brass
  coins.silver = available.silver - debit.silver
  coins.gold = available.gold - debit.gold
  return coins
}

module.exports = {
  checkSufficientAmountAvaliable,
  debitCoins
}
