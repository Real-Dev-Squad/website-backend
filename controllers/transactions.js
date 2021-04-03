const transactionsModel = require("../models/transaction");
const { getUserId } = require("../utils/users");

/**
 * Collects all transactions and sends only required data for username spicified in url
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const fetch = async (req, res) => {
  try {
    const userId = await getUserId(req.params.username);
    if (userId) {
      const n = req.query.n;
      const o = req.query.o;
      const data = await transactionsModel.fetch(userId, n, o);
      if (data.length > 0) {
        return res.json({
          message: "Transactions returned successfully!",
          data,
        });
      } else {
        return res.boom.notFound("No transactions exist!");
      }
    } else {
      return res.boom.notFound("User does not exist!");
    }
  } catch (err) {
    logger.error(`Error while processing transactions fetch request: ${err}`);
    return res.boom.badImplementation("Something went wrong please contact admin");
  }
};

module.exports = {
  fetch,
};
