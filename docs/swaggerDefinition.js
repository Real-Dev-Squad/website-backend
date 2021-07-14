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
        tasks: {
          type: 'object',
          properties: {
            title: {
              type: 'string'
            },
            purpose: {
              type: 'string'
            },
            featureUrl: {
              type: 'string'
            },
            type: {
              type: 'string'
            },
            links: {
              type: 'array',
              items: {
                link1: {
                  type: 'string'
                }
              }
            },
            endsOn: {
              type: 'string'
            },
            startedOn: {
              type: 'string'
            },
            status: {
              type: 'string'
            },
            assignee: {
              type: 'string'
            },
            percentCompleted: {
              type: 'number'
            },
            dependsOn: {
              type: 'array',
              items: {
                taskid: {
                  type: 'string'
                }
              }
            },
            participants: {
              type: 'array',
              items: {
                username: {
                  type: 'string'
                }
              }
            },
            completionAward: {
              type: 'object',
              properties: {
                neelam: {
                  type: 'number'
                },
                dinero: {
                  type: 'number'
                }
              }
            },
            lossRate: {
              type: 'object',
              properties: {
                neelam: {
                  type: 'number'
                },
                dinero: {
                  type: 'number'
                }
              }
            },
            isNoteworthy: {
              type: 'boolean'
            }
          }
        },
        contributions: {
          type: 'object',
          properties: {
            noteworthy: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  task: {
                    type: 'object',
                    properties: {
                      title: {
                        type: 'string'
                      },
                      purpose: {
                        type: 'string'
                      },
                      featureUrl: {
                        type: 'string'
                      },
                      endsOn: {
                        type: 'string'
                      },
                      startedOn: {
                        type: 'string'
                      },
                      status: {
                        type: 'string'
                      },
                      dependsOn: {
                        type: 'array',
                        items: {
                          type: 'string'
                        }
                      },
                      participants: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            firstname: {
                              type: 'string'
                            },
                            lastname: {
                              type: 'string'
                            },
                            img: {
                              type: 'string'
                            },
                            username: {
                              type: 'string'
                            }
                          }
                        }
                      },
                      isNoteworthy: {
                        type: 'boolean'
                      }
                    }
                  },
                  prList: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        title: {
                          type: 'string'
                        },
                        url: {
                          type: 'string'
                        },
                        state: {
                          type: 'string'
                        },
                        createdAt: {
                          type: 'string'
                        },
                        updatedAt: {
                          type: 'string'
                        },
                        raisedBy: {
                          type: 'string'
                        }
                      }
                    }
                  }
                }
              }
            },
            all: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  task: {
                    type: 'object',
                    properties: {
                      title: {
                        type: 'string'
                      },
                      purpose: {
                        type: 'string'
                      },
                      featureUrl: {
                        type: 'string'
                      },
                      endsOn: {
                        type: 'string'
                      },
                      startedOn: {
                        type: 'string'
                      },
                      status: {
                        type: 'string'
                      },
                      dependsOn: {
                        type: 'array',
                        items: {
                          type: 'string'
                        }
                      },
                      participants: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            firstname: {
                              type: 'string'
                            },
                            lastname: {
                              type: 'string'
                            },
                            img: {
                              type: 'string'
                            },
                            username: {
                              type: 'string'
                            }
                          }
                        }
                      },
                      isNoteworthy: {
                        type: 'boolean'
                      }
                    }
                  },
                  prList: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        title: {
                          type: 'string'
                        },
                        url: {
                          type: 'string'
                        },
                        state: {
                          type: 'string'
                        },
                        createdAt: {
                          type: 'string'
                        },
                        updatedAt: {
                          type: 'string'
                        },
                        raisedBy: {
                          type: 'string'
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        challenges: {
          type: 'object',
          properties: {
            id: {
              type: 'string'
            },
            title: {
              type: 'string'
            },
            level: {
              type: 'string'
            },
            start_date: {
              type: 'string'
            },
            end_date: {
              type: 'string'
            },
            is_active: {
              type: 'boolean'
            },
            participants: {
              type: 'array',
              items: []
            }
          }
        },
        pullRequests: {
          type: 'object',
          properties: {
            title: {
              type: 'string'
            },
            url: {
              type: 'string'
            },
            state: {
              type: 'string'
            },
            createdAt: {
              type: 'string'
            },
            updatedAt: {
              type: 'string'
            },
            readyForReview: {
              type: 'boolean'
            },
            labels: {
              type: 'array',
              items: []
            },
            assignees: {
              type: 'array',
              items: []
            }
          }
        },
        recruiters: {
          type: 'object',
          properties: {
            company: {
              type: 'string'
            },
            first_name: {
              type: 'string'
            },
            last_name: {
              type: 'string'
            },
            designation: {
              type: 'string'
            },
            reason: {
              type: 'string'
            },
            email: {
              type: 'string'
            },
            currency: {
              type: 'string'
            },
            package: {
              type: 'number'
            }
          }
        },
        migratedUsers: {
          type: 'object',
          properties: {
            count: {
              type: 'number'
            },
            users: {
              type: 'array'
            }
          }
        },
        users: {
          type: 'object',
          properties: {
            username: {
              type: 'string'
            },
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
            },
            status: {
              type: 'string'
            }
          }
        },
        badges: {
          type: 'object',
          properties: {
            title: {
              type: 'string'
            },
            description: {
              type: 'string'
            },
            imgUrl: {
              type: 'string'
            },
            users: {
              type: 'array',
              items: {
                type: 'string'
              }
            }
          }
        },
        userAvailable: {
          type: 'object',
          properties: {
            isUsernameAvailable: {
              type: 'boolean'
            }
          }
        },
        stocks: {
          type: 'object',
          properties: {
            name: {
              type: 'string'
            },
            price: {
              type: 'number'
            },
            quantity: {
              type: 'number'
            }
          }
        },
        trading: {
          type: 'object',
          properties: {
            stockId: {
              type: 'string'
            },
            tradeType: {
              type: 'string'
            },
            stockName: {
              type: 'string'
            },
            quantity: {
              type: 'number'
            },
            listedPrice: {
              type: 'number'
            },
            totalPrice: {
              type: 'number'
            }
          }
        },
        tradingSuccess: {
          type: 'object',
          properties: {
            userBalance: {
              type: 'number'
            }
          }
        },
        userStocks: {
          type: 'object',
          properties: {
            userId: {
              type: 'string'
            },
            stockId: {
              type: 'string'
            },
            stockName: {
              type: 'string'
            },
            quantity: {
              type: 'number'
            },
            orderValue: {
              type: 'number'
            },
            initialStockValue: {
              type: 'number'
            }
          }
        },
        auctions: {
          type: 'object',
          properties: {
            id: {
              type: 'string'
            },
            seller: {
              type: 'string'
            },
            item_type: {
              type: 'string'
            },
            quantity: {
              type: 'number'
            },
            highest_bid: {
              type: 'number'
            },
            highest_bidder: {
              type: 'number'
            },
            start_time: {
              type: 'number'
            },
            end_time: {
              type: 'number'
            },
            bidders_and_bids: {
              type: 'array'
            }
          }
        },
        featureFlag: {
          type: 'object',
          properties: {
            name: {
              type: 'string'
            },
            id: {
              type: 'string'
            },
            title: {
              type: 'string'
            },
            created_at: {
              type: 'number'
            },
            updated_at: {
              type: 'number'
            },
            config: {
              type: 'object'
            },
            owner: {
              type: 'string'
            },
            launched_at: {
              type: 'number'
            }

          }
        },
        featureFlagsConfig: {
          type: 'object',
          properties: {
            name: {
              type: 'string'
            },
            enabled: {
              type: 'boolean'
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
          forbidden: {
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
          },
          entityTooLarge: {
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
          unsupportedMediaType: {
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
          serverUnavailable: {
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
  apis: ['./routes/*.js']
}

const swaggerDocs = swaggerJsDoc(swaggerOptions)
module.exports = swaggerDocs
