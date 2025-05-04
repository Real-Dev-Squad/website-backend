import express from 'express';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import boom from 'express-boom';
import helmet from 'helmet';
import cors from 'cors';
import passport from 'passport';
import contentTypeCheck from './contentTypeCheck.js';
import config from 'config';
import logger from '../utils/logger.js';

// import middlewares
import './passport.js';

export const middleware = (app) => {
  // Middleware for sending error responses with express response object. To be required above all middlewares
  app.use(boom());

  // Initialise logging middleware
  app.use(morgan("combined", { stream: logger.stream }));

  // Request parsing middlewares
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());

  // Middleware to add security headers. Few headers have been disabled as it does not serve any purpose for the API.
  app.use(
    helmet({
      contentSecurityPolicy: false,
      dnsPrefetchControl: false,
      ieNoOpen: false,
      referrerPolicy: false,
      xssFilter: false,
    })
  );

  app.use(
    cors({
      origin: config.get("cors.allowedOrigins"),
      credentials: true,
      optionsSuccessStatus: 200,
    })
  );
  app.use(contentTypeCheck);

  // Initialise authentication middleware
  app.use(passport.initialize());
};
