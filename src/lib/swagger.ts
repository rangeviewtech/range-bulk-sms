import { createSwaggerSpec } from 'next-swagger-doc';

export const getApiDocs = async () => {
  const spec = createSwaggerSpec({
    apiFolder: 'src/app/api',
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Range Bulk SMS API',
        version: '1.0.0',
        description: 'Enterprise Bulk SMS Platform API Documentation for Developers. Integrate seamless SMS capabilities into your applications.',
        contact: {
          name: 'API Support',
          email: 'support@rangesms.com'
        }
      },
      tags: [
        { name: 'SMS', description: 'Send and manage SMS messages' },
        { name: 'Contacts', description: 'Contact and group management' },
        { name: 'Wallet', description: 'Balance and transactions' },
        { name: 'System', description: 'System health and maintenance' },
        { name: 'Webhooks', description: 'Webhook configuration and events' },
        { name: 'Users', description: 'User management and authentication' },
        { name: 'Campaigns', description: 'SMS campaign management' },
        { name: 'Sender IDs', description: 'Sender ID management' },
        { name: 'Delivery Reports', description: 'Message delivery status' }
      ],
      components: {
        securitySchemes: {
          BearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'Standard Bearer token or Cron endpoint secret.'
          },
          ApiKeyAuth: {
            type: 'apiKey',
            in: 'header',
            name: 'Authorization',
            description: 'Developer API key. Format: "Bearer {api_key}" or simply "{api_key}" depending on integration.'
          }
        },
        schemas: {
          ErrorResponse: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: false },
              error: {
                type: 'object',
                properties: {
                  code: { type: 'string', example: 'VALIDATION_ERROR' },
                  message: { type: 'string', example: 'Invalid parameters provided' }
                }
              },
              timestamp: { type: 'string', format: 'date-time' }
            }
          },
          SmsRequest: {
            type: 'object',
            required: ['to', 'message', 'senderId'],
            properties: {
              to: { type: 'string', example: '+256700123456', description: 'Recipient phone number' },
              message: { type: 'string', example: 'Hello from Range Bulk SMS!', description: 'The SMS content' },
              senderId: { type: 'string', example: 'RANGE', description: 'Approved alphanumeric sender ID' },
              idempotencyKey: { type: 'string', example: 'uniq-msg-1234', description: 'Optional key to prevent duplicate sends' }
            }
          },
          BulkSmsRequest: {
            type: 'object',
            required: ['messages'],
            properties: {
              messages: {
                type: 'array',
                items: { $ref: '#/components/schemas/SmsRequest' }
              }
            }
          },
          SmsResponse: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              messageId: { type: 'string', format: 'uuid', example: 'msg-456' },
              status: { type: 'string', example: 'SUBMITTED' },
              cost: { type: 'number', example: 35.0 },
              timestamp: { type: 'string', format: 'date-time' }
            }
          },
          DeliveryReport: {
            type: 'object',
            properties: {
              messageId: { type: 'string', format: 'uuid' },
              status: { type: 'string', enum: ['DELIVERED', 'FAILED', 'REJECTED'], example: 'DELIVERED' },
              deliveredAt: { type: 'string', format: 'date-time' },
              errorReason: { type: 'string', nullable: true }
            }
          },
          WalletBalance: {
            type: 'object',
            properties: {
              balance: { type: 'number', example: 15400.50 },
              currency: { type: 'string', example: 'UGX' },
              status: { type: 'string', example: 'ACTIVE' }
            }
          },
          Contact: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              firstName: { type: 'string', example: 'John', nullable: true },
              lastName: { type: 'string', example: 'Doe', nullable: true },
              phone: { type: 'string', example: '+256700123456' },
              email: { type: 'string', example: 'john@example.com', nullable: true },
              countryCode: { type: 'string', example: '+256' },
              createdAt: { type: 'string', format: 'date-time' }
            }
          }
        }
      },
      security: [
        { ApiKeyAuth: [] }
      ],
      paths: {
        '/api/v1/sms/send': {
          post: {
            tags: ['SMS'],
            summary: 'Send a single SMS',
            description: 'Submit a single SMS message for delivery.',
            security: [{ ApiKeyAuth: [] }],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/SmsRequest' }
                }
              }
            },
            responses: {
              '201': {
                description: 'SMS accepted for delivery',
                content: { 'application/json': { schema: { $ref: '#/components/schemas/SmsResponse' } } }
              },
              '400': {
                description: 'Bad Request',
                content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
              },
              '401': { description: 'Unauthorized' }
            }
          }
        },
        '/api/v1/sms/bulk': {
          post: {
            tags: ['SMS'],
            summary: 'Send bulk SMS',
            description: 'Submit multiple SMS messages for delivery in a single request.',
            security: [{ ApiKeyAuth: [] }],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/BulkSmsRequest' }
                }
              }
            },
            responses: {
              '201': {
                description: 'Bulk SMS accepted for delivery',
                content: { 
                  'application/json': { 
                    schema: { 
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: true },
                        batchId: { type: 'string' },
                        messagesCount: { type: 'integer' }
                      }
                    } 
                  } 
                }
              }
            }
          }
        },
        '/api/v1/sms/status/{id}': {
          get: {
            tags: ['SMS', 'Delivery Reports'],
            summary: 'Get message status',
            description: 'Retrieve the current delivery status of a specific message.',
            security: [{ ApiKeyAuth: [] }],
            parameters: [
              {
                name: 'id',
                in: 'path',
                required: true,
                description: 'Message ID',
                schema: { type: 'string', format: 'uuid' }
              }
            ],
            responses: {
              '200': {
                description: 'Delivery report retrieved',
                content: { 'application/json': { schema: { $ref: '#/components/schemas/DeliveryReport' } } }
              },
              '404': { description: 'Message not found' }
            }
          }
        },
        '/api/v1/balance': {
          get: {
            tags: ['Wallet'],
            summary: 'Get wallet balance',
            description: 'Retrieve the current account balance and status.',
            security: [{ ApiKeyAuth: [] }],
            responses: {
              '200': {
                description: 'Balance retrieved successfully',
                content: { 'application/json': { schema: { $ref: '#/components/schemas/WalletBalance' } } }
              }
            }
          }
        },
        '/api/v1/contacts': {
          get: {
            tags: ['Contacts'],
            summary: 'List contacts',
            description: 'Retrieve a paginated list of contacts.',
            security: [{ ApiKeyAuth: [] }],
            parameters: [
              { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
              { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } }
            ],
            responses: {
              '200': {
                description: 'List of contacts',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        data: { type: 'array', items: { $ref: '#/components/schemas/Contact' } },
                        meta: { 
                          type: 'object',
                          properties: {
                            total: { type: 'integer' },
                            page: { type: 'integer' },
                            limit: { type: 'integer' }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          post: {
            tags: ['Contacts'],
            summary: 'Create contact',
            description: 'Add a new contact to your database.',
            security: [{ ApiKeyAuth: [] }],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['phone'],
                    properties: {
                      phone: { type: 'string', example: '+256700123456' },
                      firstName: { type: 'string' },
                      lastName: { type: 'string' },
                      email: { type: 'string' }
                    }
                  }
                }
              }
            },
            responses: {
              '201': {
                description: 'Contact created',
                content: { 'application/json': { schema: { $ref: '#/components/schemas/Contact' } } }
              }
            }
          }
        }
      }
    },
  });
  return spec;
};
