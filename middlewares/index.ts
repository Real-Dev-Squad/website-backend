import config from 'config';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import boom from 'express-boom';
import helmet from 'helmet';
import morgan from 'morgan';
import passport from 'passport';
import logger from '../utils/logger.js';
import contentTypeCheck from './contentTypeCheck.js';

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
      origin: (origin, callback) => {
        const allowedOriginsConfig = config.get("cors.allowedOrigins");
        
        let allowedOrigins;
        try {
          if (allowedOriginsConfig instanceof RegExp) {
            allowedOrigins = allowedOriginsConfig;
          } else if (typeof allowedOriginsConfig === 'string') {
            // Handle string representation of regex
            const regexStr = allowedOriginsConfig.startsWith('/') && allowedOriginsConfig.endsWith('/')
              ? allowedOriginsConfig.slice(1, -1)
              : allowedOriginsConfig;
            allowedOrigins = new RegExp(regexStr);
          } else {
            // Fallback: create from string representation
            allowedOrigins = new RegExp(allowedOriginsConfig.toString());
          }
          
          if (!origin || allowedOrigins.test(origin)) {
            callback(null, true);
          } else {
            callback(new Error('Not allowed by CORS'));
          }
        } catch (error) {
          // Fallback: allow all origins if there's an error with regex
          console.error('CORS regex configuration error:', error);
          callback(null, true);
        }
      },
      credentials: true,
      optionsSuccessStatus: 200,
    })
  );
  app.use(contentTypeCheck);

  // Initialise authentication middleware
  app.use(passport.initialize());
};
