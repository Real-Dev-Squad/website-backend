const createError = require("http-errors");
const express = require("express");
const { isMulterError, multerErrorHandling } = require("./utils/multer");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");

// Attach response headers
const responseHeaders = require("./middlewares/responseHeaders");

// import app middlewares
const AppMiddlewares = require("./middlewares");

// import routes
const indexRouter = require("./routes/index");

const app = express();

// Swagger config
const swaggerDocument = YAML.load("bundled.yaml");

// Add Middlewares, routes
AppMiddlewares(app);
app.use("/", responseHeaders, indexRouter);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument, { explorer: true }));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, _next) {
  if (isMulterError(err)) {
    return multerErrorHandling(err, req, res);
  }
  return res.boom.boomify(err, {
    statusCode: err.statusCode,
  });
});

module.exports = app;
