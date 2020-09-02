const swaggerOptions = {
	swaggerDefinition: {
		openapi: '3.0.1',
		info: {
			version: '1.0.0',
			title: 'RDS API documentation',
			description:
				'This is documentation for all real dev squad"s API. Find out more about Real dev squad at [http://realdevsquad.com](http://realdevsquad.com)',
			contact: {
				name: 'Real Dev Squad',
				url: 'http://realdevsquad.com',
			},
		},
		tags: [
			{
				name: 'Healthcheck',
				description: 'API for health check in the system',
			},
		], // tags are used to group api routes together in the UI
		basePath: '/',
		servers: [
			{
				url: `http://localhost:${process.env.PORT || 3000}`,
				description: 'Local server URL',
			},
			{
				url: process.env.SERVICES_RDSAPI_BASEURL,
				description: 'Remote server URL',
			},
		],
	},
	apis: ['./routes/*.js'],
};

module.exports = swaggerOptions;

/* Read more on: https://swagger.io/docs/specification/about/ */
