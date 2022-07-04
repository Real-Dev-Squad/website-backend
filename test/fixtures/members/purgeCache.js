/**
 * Purge Cache Response
 * Multiple responses can be added to the array if required
 *
 * @return {Object}
 */

module.exports = () => {
  return [
    {
      message: "Cache purged successfully",
      success: true,
      errors: [],
      messages: [],
      result: {
        id: "ba637cab83d148e6935cbba0b1abcxyz",
      },
    },
    {
      statusCode: 401,
      error: "Unauthorized",
      message: "Unauthenticated User",
    },
    {
      statusCode: 500,
      error: "Internal Server Error",
      message: "An internal server error occurred",
    },
  ];
};
