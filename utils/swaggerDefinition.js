const swaggerJsDoc = require('swagger-jsdoc')
const config = require('config')

/**
 * Read more on: https://swagger.io/docs/specification/about
 *
 * Cookie authentication issue in Swagger UI: https://github.com/swagger-api/swagger-js/issues/1163, https://swagger.io/docs/specification/authentication/cookie-authentication/
 * We are supporting Bearer Authentication for non-production environments
 */
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.1',
    info: {
      version: '1.0.0',
      title: 'RDS API documentation',
      description:
        'This is documentation for Real Dev Squad\'s API. Find out more about Real dev squad at [http://realdevsquad.com](http://realdevsquad.com)',
      contact: {
        name: 'Real Dev Squad',
        url: 'http://realdevsquad.com'
      }
    },
    tags: [
      {
        name: 'Healthcheck',
        description: 'API for health check in the system'
      },
      {
        name: 'Authentication',
        description: 'Authentication routes'
      }
    ], // tags are used to group api routes together in the UI
    servers: [
      {
        url: config.get('services.rdsApi.baseUrl'),
        description: 'Local server URL'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        healthCheck: {
          type: 'object',
          properties: {
            uptime: {
              type: 'number'
            }
          }
        },
        user: {
          type: 'object',
          properties: {
            uptime: {
              type: 'number'
            }
          }
        },
        users: {
          type: 'object',
          properties: {
            first_name: {
              type: 'string'
            },
            last_name: {
              type: 'string'
            },
            yoe: {
              type: 'number'
            },
            company: {
              type: 'string'
            },
            designation: {
              type: 'string'
            },
            img: {
              type: 'string'
            },
            github_display_name: {
              type: 'string'
            },
            github_id: {
              type: 'string'
            },
            linkedin_id: {
              type: 'string'
            },
            twitter_id: {
              type: 'string'
            },
            instagram_id: {
              type: 'string'
            },
            site: {
              type: 'string'
            },
            isMember: {
              type: 'boolean'
            },
            tokens: {
              type: 'object'
            }
          }
        },
        errors: {
          unAuthorized: {
            type: 'object',
            properties: {
              statusCode: {
                type: 'integer'
              },
              error: {
                type: 'string'
              },
              message: {
                type: 'string'
              }
            }
          },
          notFound: {
            type: 'object',
            properties: {
              statusCode: {
                type: 'integer'
              },
              error: {
                type: 'string'
              },
              message: {
                type: 'string'
              }
            }
          },
          badImplementation: {
            type: 'object',
            properties: {
              statusCode: {
                type: 'integer'
              },
              error: {
                type: 'string'
              },
              message: {
                type: 'string'
              }
            }
          }
        }
      } // schemas are used to group the common request/response for API's
    }
  },
  apis: ['./routes/**/*.js']
}

const swaggerDocs = swaggerJsDoc(swaggerOptions)
module.exports = swaggerDocs
