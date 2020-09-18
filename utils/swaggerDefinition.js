const swaggerJsDoc = require('swagger-jsdoc')

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
        url: 'http://realdevsquad.com'
      }
    },
    tags: [
      {
        name: 'Healthcheck',
        description: 'API for health check in the system'
      }
    ], // tags are used to group api routes together in the UI
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: 'Local server URL'
      },
      {
        url:
          process.env.SERVICES_RDSAPI_BASEURL ||
          `http://localhost:${process.env.PORT || 3000}`,
        description: 'Remote server URL'
      }
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          // arbitrary name for the security scheme
          type: 'apiKey',
          in: 'cookie', // can be "header", "query" or "cookie"
          name: 'rds-session' // name of the header, query parameter or cookie
        }
      },
      schemas: {
        healthcheck: {
          type: 'object',
          properties: {
            uptime: {
              type: 'integer'
            }
          }
        }
      } // schemas are used to group the common request/response for API's
    }
  },
  apis: ['./routes/*.js']
}

const swaggerDocs = swaggerJsDoc(swaggerOptions)
module.exports = swaggerDocs

/* Read more on: https://swagger.io/docs/specification/about/ */

// @Findings
// Cookie authentication issue in swagger-ui : https://stackoverflow.com/questions/49272171/sending-cookie-session-id-with-swagger-3-0

// Localhost server issue in Swagger Hub: https://community.smartbear.com/t5/SwaggerHub/Can-I-use-localhost-as-host-in-swaggerhub/td-p/160421
