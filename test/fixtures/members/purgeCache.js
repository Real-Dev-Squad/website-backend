/**
 * Purge Cache Response
 * Multiple responses can be added to the array if required
 *
 * @return {Object}
 */

module.exports = () => {
  return [
    {
      data: {
        success: true,
        errors: [],
        messages: [],
        result: {
          id: "TEST_RESULT_ID",
        },
      },
    },
  ];
};
