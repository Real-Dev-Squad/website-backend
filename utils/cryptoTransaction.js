const isBalanceSufficient = (senderCoins, reveicerCoins) => (
  senderCoins.copper >= reveicerCoins.copper &&
  senderCoins.silver >= reveicerCoins.silver &&
  senderCoins.gold >= reveicerCoins.gold
)

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

const diff = (a, b) => (a - b)

const add = (a, b) => (a + b)

module.exports = {
  isBalanceSufficient,
  updateBalance
}
