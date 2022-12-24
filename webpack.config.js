const path = require("path");
const nodeExternals = require("webpack-node-externals");

module.exports = {
  entry: "./server.js",
  target: "node",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  resolve: {
    modules: [path.resolve(__dirname, "node_modules")],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: [/node_modules/, /test/],
      },
    ],
  },

  externals: [nodeExternals()],
};
