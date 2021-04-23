
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
      amount: 130,
      userTo: 'Rishab',
      typeOfTransaction: 'Debit',
      typeOfCurrency: 'neelam',
      userId: 'kratika',
      dateInMillis: 1615689000000
    }
  ]
}
