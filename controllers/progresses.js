/**
 * Add Progresses Document
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const addProgresses = async (req, res) => {
  return res.json({
    message: "Progresses document created successfully.",
  });
};

module.exports = { addProgresses };
