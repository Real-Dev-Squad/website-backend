import createError from "http-errors";
import express from "express";
import { isMulterError, multerErrorHandling } from "./utils/multer.js";

// Attach response headers
import { responseHeaders } from "./middlewares/responseHeaders.js";

// import app middlewares
import { middleware } from "./middlewares/index.js";

// import routes
import { appRoutes } from "./routes/index.js";
import logger from "./utils/logger.js";

const app = express();

// Add Middlewares, routes
middleware(app);
app.use("/", responseHeaders, appRoutes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  if (isMulterError(err)) {
    return multerErrorHandling(err, req, res, next);
  }
  logger.error(err);
  return res.boom.boomify(err, {
    statusCode: err.statusCode,
  });
});

export default app;
