const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const boom = require("express-boom");
const helmet = require("helmet");
const cors = require("cors");
const passport = require("passport");
const contentTypeCheck = require("./contentTypeCheck");

// require middlewares
require("./passport");

const middleware = (app) => {
  // Middleware for sending error responses with express response object. To be required above all middlewares
  app.use(boom());

  // Initialise logging middleware
  app.use(morgan("combined", { stream: logger.stream }));

  // Request parsing middlewares
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());

  // Express 5 leaves req.body undefined when no body parser runs for the
  // request (e.g. no JSON content-type). The codebase was written against
  // Express 4, which always defaulted req.body to {}, so normalize it here
  // to keep validators and controllers from crashing on destructuring.
  app.use(function defaultEmptyBody(req, _res, next) {
    if (req.body === undefined) req.body = {};
    next();
  });

  // Middleware to add security headers. Few headers have been disabled as it does not serve any purpose for the API.
  app.use(
    helmet({
      contentSecurityPolicy: false,
      dnsPrefetchControl: false,
      ieNoOpen: false,
      referrerPolicy: false,
      xssFilter: false,
    }),
  );

  app.use(
    cors({
      // Config stores the pattern as a string (see config/default.js), so
      // build a real RegExp here. A RegExp stored in config would come back
      // wrapped in node-config's immutable Proxy and crash cors.
      // eslint-disable-next-line security/detect-non-literal-regexp
      origin: new RegExp(config.get("cors.allowedOrigins")),
      credentials: true,
      optionsSuccessStatus: 200,
    }),
  );
  app.use(contentTypeCheck);

  // Initialise authentication middleware
  app.use(passport.initialize());
};

module.exports = middleware;
