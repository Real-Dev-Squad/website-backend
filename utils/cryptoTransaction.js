function isBalanceSufficient (senderCoins, reveicerCoins) {
  if (senderCoins.copper >= reveicerCoins.copper && senderCoins.silver >= reveicerCoins.silver && senderCoins.gold >= reveicerCoins.gold) {
    return true
  }
  return false
}

function updateBalance (payer, receiver, requestCoins) {
  const payerCoins = {
    copper: diff(payer.copper, requestCoins.copper),
    silver: diff(payer.silver, requestCoins.silver),
    gold: diff(payer.gold, requestCoins.gold)
  }
  const receiverCoins = {
    copper: add(receiver.copper, requestCoins.copper),
    silver: add(receiver.silver, requestCoins.silver),
    gold: add(receiver.gold, requestCoins.gold)

  }
  return { payerCoins, receiverCoins }
}

function diff (a, b) {
  return (a - b)
}

function add (a, b) {
  return (a + b)
}

module.exports = {
  isBalanceSufficient,
  updateBalance
}
