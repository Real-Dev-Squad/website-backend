
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
      typeOfTransaction: 'Credit',
      amount: 500,
      dateTime: 1615710600000
    },
    {
      amount: 130,
      userTo: 'Rishab',
      typeOfTransaction: 'Debit',
      typeOfCurrency: 'neelam',
      userId: 'kratika',
      dateTime: 1615689000000
    },
    {
      typeOfCurrency: 'Silver',
      userTo: 'Rishab',
      userId: 'kratika',
      typeOfTransaction: 'Credit',
      amount: 420,
      dateTime: 1615710600001
    },
    {
      amount: 630,
      userTo: 'Rishab',
      typeOfTransaction: 'Debit',
      typeOfCurrency: 'neelam',
      userId: 'kratika',
      dateTime: 1615689000002
    }
  ]
}
