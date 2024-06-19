/**
 * Custom validator to check the word count of a string value.
 * @param {string} value - The value of the field being validated.
 * @param {object} helpers - The Joi validation helpers object.
 * @param {number} wordCount - The desired minimum word count for validation.
 * @returns {*} The validated value if the word count is met, otherwise an error.
 */
const customWordCountValidator = (value, helpers, wordCount) => {
  const words = value.split(/\s+/);

  if (words.length < wordCount) {
    return helpers.error("any.invalid");
  }

  return value;
};

module.exports = {
  customWordCountValidator,
};
