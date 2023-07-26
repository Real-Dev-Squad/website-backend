/**
 * Mocha configuration file
 * Info: https://mochajs.org/#configuring-mocha-nodejs
 */
module.exports = {
  timeout: '5000',
  extension: ["ts", "js"],
  require: "ts-node/register"
};
