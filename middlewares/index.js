const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const boom = require('express-boom');
const helmet = require('helmet');
const cors = require('cors');
const passport = require('passport');
const swaggerUi = require('swagger-ui-express');
const swaggerDocs = require('../utils/swaggerDefinition');

// import utilities
const logger = require('../utils/logger');

// require middlewares
require('./passport');

const middleware = (app) => {
	app.use(morgan('combined', { stream: logger.stream }));

	// Request parsing middlewares
	app.use(express.json());
	app.use(express.urlencoded({ extended: false }));
	app.use(cookieParser());
	app.use(passport.initialize());

	app.use(helmet());

	app.use(
		cors({
			optionsSuccessStatus: 200,
		})
	);

	app.use(boom());

	/* Swagger middleware */
	const options = {
		customCss: '.swagger-ui .topbar { display: none }',
	}; // custom css applied to Swagger UI

	app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, options));
};

module.exports = middleware;
