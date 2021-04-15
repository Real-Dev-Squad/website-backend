
/**
 * Transaction info for loggedin Users
 * Multiple responses can be added to the array if required
 *
 * @return {Object}
 */
module.exports = () => {
  return [
    {
      typeOfCurrency: 'Silver',
      userTo: 'Rishab',
      userId: 'kratika',
      typrOfTransaction: 'Credit',
      amount: 500,
      dateInMillis: 1615710600000
    },
    {
      userId: 'kratika',
      userTo: 'Rishab',
      amount: 400,
      typeOfTransaction: 'Credit',
      typeOfCurrency: 'Gold',
      dateInMillis: 1615707000000
    }
  ]
}
