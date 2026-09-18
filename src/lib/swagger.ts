import { createSwaggerSpec } from 'next-swagger-doc';

export const getApiDocs = async () => {
  const spec = createSwaggerSpec({
    apiFolder: 'src/app/api',
    definition: {
      openapi: '3.0.3',
      info: {
        title: 'Range Bulk SMS Public API',
        version: '1.0.0',
        description:
          'Enterprise Public Bulk SMS & Messaging Platform API Contract for Developers. Integrate high-throughput SMS messaging, scheduled dispatches, real-time delivery webhooks (DLR), and balance monitoring into your applications. Developed by Range View Technology Services Uganda Limited.',
        termsOfService: 'https://rangesms.com/terms',
        contact: {
          name: 'Range Bulk SMS Developer Support',
          email: 'support@rangesms.com',
          url: 'https://rangesms.com/support',
        },
        license: {
          name: 'Proprietary',
          url: 'https://rangesms.com/license',
        },
      },
      servers: [
        {
          url: '/api/v1',
          description: '🧪 Sandbox Environment (Default: Deterministic non-routable numbers +999000000001 - +999000000006, non-billable)',
        },
        {
          url: 'https://api.rangesms.com/v1',
          description: '⚠️ Production Environment (Real carrier network dispatch, billable)',
        },
      ],
      tags: [
        { name: 'SMS', description: 'Single, bulk, and scheduled SMS message dispatch and lifecycle' },
        { name: 'Delivery Reports', description: 'Real-time message delivery status queries and history' },
        { name: 'Webhooks & DLR', description: 'Signed webhook delivery events and event simulator' },
        { name: 'Wallet', description: 'Account balance, currency, and usage quotas' },
        { name: 'Contacts', description: 'Contact management and address book entries' },
        { name: 'Sender IDs', description: 'Alphanumeric sender ID registry and approval status' },
        { name: 'Sandbox', description: 'Deterministic testing and simulation tools' },
      ],
      components: {
        securitySchemes: {
          BearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'API Key',
            description: 'Provide your API key in the Authorization header: `Bearer rsms_test_...` or `Bearer rsms_live_...`',
          },
          ApiKeyAuth: {
            type: 'apiKey',
            in: 'header',
            name: 'Authorization',
            description: 'API key authentication format: `Bearer {api_key}`',
          },
        },
        schemas: {
          ProblemDetails: {
            type: 'object',
            description: 'RFC 9457 Standardized HTTP Problem Details for Machine-Readable API Errors',
            required: ['type', 'title', 'status', 'detail', 'code'],
            properties: {
              type: { type: 'string', example: 'https://docs.rangesms.com/errors/invalid-recipient' },
              title: { type: 'string', example: 'Invalid recipient phone number' },
              status: { type: 'integer', example: 400 },
              detail: { type: 'string', example: 'The recipient phone number must be in E.164 international format.' },
              code: { type: 'string', example: 'invalid_recipient' },
              instance: { type: 'string', example: '/api/v1/sms/send' },
              requestId: { type: 'string', example: 'req_01jabc123456' },
              errors: { type: 'object', additionalProperties: true, description: 'Field-level validation error details' },
            },
          },
          SmsRequest: {
            type: 'object',
            required: ['to', 'message'],
            properties: {
              to: {
                type: 'string',
                example: '+256700123456',
                description: 'Destination telephone number in E.164 format. In Sandbox, use +999000000001 for guaranteed success.',
              },
              recipients: {
                type: 'array',
                items: { type: 'string' },
                description: 'Optional array of recipient phone numbers (alternative to "to")',
                example: ['+256700123456'],
              },
              message: {
                type: 'string',
                minLength: 1,
                maxLength: 3200,
                example: 'Your Range verification code is 849201. Valid for 5 minutes.',
                description: 'SMS message text content. Standard GSM-7 messages are billed in 160-character segments.',
              },
              senderId: {
                type: 'string',
                maxLength: 11,
                example: 'RANGE',
                description: 'Approved alphanumeric Sender ID. If omitted, default platform sender ID is used.',
              },
              idempotencyKey: {
                type: 'string',
                example: '550e8400-e29b-41d4-a716-446655440000',
                description: 'Unique client-supplied UUID to guarantee exactly-once processing and prevent duplicate charges.',
              },
            },
          },
          BulkSmsRequest: {
            type: 'object',
            required: ['messages'],
            properties: {
              messages: {
                type: 'array',
                maxItems: 100,
                items: {
                  type: 'object',
                  required: ['recipients', 'message'],
                  properties: {
                    senderId: { type: 'string', example: 'RANGE' },
                    recipients: {
                      type: 'array',
                      items: { type: 'string' },
                      example: ['+256700111111', '+256700222222'],
                      description: 'List of recipient phone numbers (up to 1,000 per message object)',
                    },
                    message: { type: 'string', example: 'Monthly statement ready for download.' },
                    idempotencyKey: { type: 'string', example: 'batch-msg-001' },
                  },
                },
              },
              batchIdempotencyKey: {
                type: 'string',
                example: 'batch-2026-09-18-run-1',
                description: 'Deduplication key for the entire batch submission',
              },
            },
          },
          ScheduleSmsRequest: {
            type: 'object',
            required: ['to', 'message', 'scheduledAt'],
            properties: {
              to: { type: 'string', example: '+256700123456' },
              recipients: { type: 'array', items: { type: 'string' }, example: ['+256700123456'] },
              message: { type: 'string', example: 'Reminder: Scheduled appointment tomorrow at 10:00 AM.' },
              senderId: { type: 'string', example: 'RANGE' },
              scheduledAt: {
                type: 'string',
                format: 'date-time',
                example: '2026-09-19T09:00:00Z',
                description: 'Future delivery timestamp in ISO 8601 UTC format',
              },
              timezone: { type: 'string', example: 'Africa/Kampala', default: 'Africa/Kampala' },
              isRecurring: { type: 'boolean', default: false },
              cronExpression: { type: 'string', example: '0 9 * * 1', description: 'Standard 5-part cron expression for recurring dispatches' },
            },
          },
          SmsResponse: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              messageId: { type: 'string', format: 'uuid', example: 'msg_01j7abc98124' },
              status: {
                type: 'string',
                enum: ['QUEUED', 'SUBMITTED', 'SENT', 'DELIVERED', 'FAILED', 'REJECTED'],
                example: 'QUEUED',
              },
              recipientCount: { type: 'integer', example: 1 },
              cost: { type: 'number', example: 10.0 },
              currency: { type: 'string', example: 'UGX' },
              sandbox: { type: 'boolean', example: false },
              timestamp: { type: 'string', format: 'date-time' },
            },
          },
          DeliveryReport: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              messageId: { type: 'string', format: 'uuid', example: 'msg_01j7abc98124' },
              status: {
                type: 'string',
                enum: ['QUEUED', 'SUBMITTED', 'SENT', 'DELIVERED', 'UNDELIVERED', 'FAILED', 'REJECTED'],
                example: 'DELIVERED',
              },
              recipientCount: { type: 'integer', example: 1 },
              totalUnits: { type: 'integer', example: 1 },
              totalCost: { type: 'number', example: 10.0 },
              createdAt: { type: 'string', format: 'date-time' },
              deliveredAt: { type: 'string', format: 'date-time', nullable: true },
              failedAt: { type: 'string', format: 'date-time', nullable: true },
              recipients: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    phone: { type: 'string', example: '+256700123456' },
                    status: { type: 'string', example: 'DELIVERED' },
                    deliveredAt: { type: 'string', format: 'date-time', nullable: true },
                    failureReason: { type: 'string', nullable: true },
                  },
                },
              },
            },
          },
          WalletBalance: {
            type: 'object',
            properties: {
              data: {
                type: 'object',
                properties: {
                  balance: { type: 'number', example: 45000.0 },
                  currency: { type: 'string', example: 'UGX' },
                  status: { type: 'string', example: 'ACTIVE' },
                },
              },
            },
          },
          Contact: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid', example: '7d34bc12-98aa-43e1-b45e-8490a0c4f821' },
              phone: { type: 'string', example: '+256700123456' },
              name: { type: 'string', example: 'Sarah Namubiru' },
              email: { type: 'string', example: 'sarah@example.ug', nullable: true },
              createdAt: { type: 'string', format: 'date-time' },
            },
          },
          SenderId: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              senderId: { type: 'string', example: 'RANGE' },
              status: { type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED'], example: 'APPROVED' },
              purpose: { type: 'string', example: 'Transactional verification notifications' },
              createdAt: { type: 'string', format: 'date-time' },
            },
          },
          WebhookSimulateRequest: {
            type: 'object',
            properties: {
              webhookUrl: { type: 'string', format: 'uri', example: 'https://webhook.site/test-endpoint' },
              webhookSecret: { type: 'string', example: 'whsec_test_secret_key_123' },
              status: { type: 'string', enum: ['DELIVERED', 'FAILED', 'UNDELIVERED', 'REJECTED'], default: 'DELIVERED' },
              recipientPhone: { type: 'string', example: '+256700123456' },
            },
          },
          WebhookDeliveryEvent: {
            type: 'object',
            description: 'Canonical Webhook Delivery Receipt Event emitted to configured endpoints upon message carrier status updates',
            properties: {
              id: { type: 'string', example: 'evt_test_98f12a4b89c0' },
              type: {
                type: 'string',
                enum: ['message.delivered', 'message.failed', 'message.undelivered', 'message.sent'],
                example: 'message.delivered',
              },
              createdAt: { type: 'string', format: 'date-time', example: '2026-09-18T18:30:00Z' },
              data: {
                type: 'object',
                properties: {
                  messageId: { type: 'string', example: 'msg_01j7abc98124' },
                  recipient: { type: 'string', example: '+256700123456' },
                  status: { type: 'string', example: 'DELIVERED' },
                  deliveredAt: { type: 'string', format: 'date-time' },
                  failureReason: { type: 'string', nullable: true },
                  simulated: { type: 'boolean', example: false },
                },
              },
            },
          },
        },
      },
      security: [{ BearerAuth: [] }],
      paths: {
        '/api/v1/sms/send': {
          post: {
            tags: ['SMS'],
            operationId: 'sendSingleSms',
            summary: 'Send a single SMS message',
            description:
              'Submit an outbound SMS message for immediate queuing and delivery. In Sandbox mode or when using deterministic test numbers (+999000000001 to +999000000006), requests are simulated safely without carrier dispatch or wallet deductions.',
            security: [{ BearerAuth: [] }, { ApiKeyAuth: [] }],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/SmsRequest' },
                },
              },
            },
            responses: {
              '201': {
                description: 'SMS accepted for delivery',
                content: { 'application/json': { schema: { $ref: '#/components/schemas/SmsResponse' } } },
              },
              '400': {
                description: 'Validation error or invalid sender ID',
                content: { 'application/json': { schema: { $ref: '#/components/schemas/ProblemDetails' } } },
              },
              '401': {
                description: 'Unauthorized - Invalid or missing API key',
                content: { 'application/json': { schema: { $ref: '#/components/schemas/ProblemDetails' } } },
              },
              '402': {
                description: 'Payment required - Insufficient account balance',
                content: { 'application/json': { schema: { $ref: '#/components/schemas/ProblemDetails' } } },
              },
              '429': {
                description: 'Too Many Requests - Rate limit exceeded',
                content: { 'application/json': { schema: { $ref: '#/components/schemas/ProblemDetails' } } },
              },
            },
          },
        },
        '/api/v1/sms/bulk': {
          post: {
            tags: ['SMS'],
            operationId: 'sendBulkSms',
            summary: 'Send bulk SMS messages',
            description: 'Submit multiple recipient collections or grouped messages for asynchronous batch dispatch.',
            security: [{ BearerAuth: [] }, { ApiKeyAuth: [] }],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/BulkSmsRequest' },
                },
              },
            },
            responses: {
              '201': {
                description: 'Bulk batch accepted for asynchronous processing',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: true },
                        batchId: { type: 'string', example: 'batch-2026-09-18-run-1' },
                        messagesCount: { type: 'integer', example: 50 },
                        totalRecipients: { type: 'integer', example: 1200 },
                      },
                    },
                  },
                },
              },
              '400': {
                description: 'Invalid bulk payload',
                content: { 'application/json': { schema: { $ref: '#/components/schemas/ProblemDetails' } } },
              },
              '401': { description: 'Unauthorized' },
              '402': { description: 'Insufficient balance' },
            },
          },
        },
        '/api/v1/sms/schedule': {
          post: {
            tags: ['SMS'],
            operationId: 'scheduleSms',
            summary: 'Schedule SMS message for future dispatch',
            description: 'Schedule a single or recurring SMS dispatch at a specified UTC timestamp.',
            security: [{ BearerAuth: [] }, { ApiKeyAuth: [] }],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ScheduleSmsRequest' },
                },
              },
            },
            responses: {
              '201': {
                description: 'Message scheduled successfully',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: true },
                        scheduledMessageId: { type: 'string', format: 'uuid' },
                        status: { type: 'string', example: 'SCHEDULED' },
                        scheduledAt: { type: 'string', format: 'date-time' },
                      },
                    },
                  },
                },
              },
              '400': { description: 'Bad Request' },
              '401': { description: 'Unauthorized' },
            },
          },
        },
        '/api/v1/sms/status/{id}': {
          get: {
            tags: ['SMS', 'Delivery Reports'],
            operationId: 'getMessageStatus',
            summary: 'Get message status and delivery report',
            description: 'Retrieve real-time carrier status, recipient records, and delivery timestamps for a specific message.',
            security: [{ BearerAuth: [] }, { ApiKeyAuth: [] }],
            parameters: [
              {
                name: 'id',
                in: 'path',
                required: true,
                description: 'Message UUID or sandbox message ID',
                schema: { type: 'string' },
              },
            ],
            responses: {
              '200': {
                description: 'Delivery report retrieved successfully',
                content: { 'application/json': { schema: { $ref: '#/components/schemas/DeliveryReport' } } },
              },
              '404': {
                description: 'Message not found',
                content: { 'application/json': { schema: { $ref: '#/components/schemas/ProblemDetails' } } },
              },
            },
          },
        },
        '/api/v1/balance': {
          get: {
            tags: ['Wallet'],
            operationId: 'getWalletBalance',
            summary: 'Get account wallet balance',
            description: 'Fetch the real-time available credits and currency in your Range Bulk SMS wallet.',
            security: [{ BearerAuth: [] }, { ApiKeyAuth: [] }],
            responses: {
              '200': {
                description: 'Wallet balance retrieved',
                content: { 'application/json': { schema: { $ref: '#/components/schemas/WalletBalance' } } },
              },
            },
          },
        },
        '/api/v1/contacts': {
          get: {
            tags: ['Contacts'],
            operationId: 'listContacts',
            summary: 'List contacts',
            description: 'Retrieve a paginated list of contacts from your account address book.',
            security: [{ BearerAuth: [] }, { ApiKeyAuth: [] }],
            parameters: [
              { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
              { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
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
                      },
                    },
                  },
                },
              },
            },
          },
          post: {
            tags: ['Contacts'],
            operationId: 'createContact',
            summary: 'Create a new contact',
            description: 'Add a new phone number and recipient details to your contacts list.',
            security: [{ BearerAuth: [] }, { ApiKeyAuth: [] }],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['phone'],
                    properties: {
                      phone: { type: 'string', example: '+256700123456' },
                      name: { type: 'string', example: 'Sarah Namubiru' },
                      email: { type: 'string', example: 'sarah@example.ug' },
                    },
                  },
                },
              },
            },
            responses: {
              '201': {
                description: 'Contact created successfully',
                content: { 'application/json': { schema: { $ref: '#/components/schemas/Contact' } } },
              },
            },
          },
        },
        '/api/v1/sender-ids': {
          get: {
            tags: ['Sender IDs'],
            operationId: 'listSenderIds',
            summary: 'List approved sender IDs',
            description: 'Retrieve all approved alphanumeric Sender IDs registered to your account.',
            security: [{ BearerAuth: [] }, { ApiKeyAuth: [] }],
            responses: {
              '200': {
                description: 'List of approved Sender IDs',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        data: { type: 'array', items: { $ref: '#/components/schemas/SenderId' } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        '/api/v1/sandbox/simulate-delivery': {
          post: {
            tags: ['Sandbox', 'Webhooks & DLR'],
            operationId: 'simulateDeliveryCallback',
            summary: 'Simulate delivery receipt callback (Webhook DLR)',
            description:
              'Generate a simulated carrier delivery receipt event with HMAC SHA-256 signature and test delivery to your webhook endpoint.',
            security: [{ BearerAuth: [] }, { ApiKeyAuth: [] }],
            requestBody: {
              required: false,
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/WebhookSimulateRequest' },
                },
              },
            },
            responses: {
              '200': {
                description: 'Simulated event generated and optionally dispatched',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: true },
                        simulatedEvent: { $ref: '#/components/schemas/WebhookDeliveryEvent' },
                        dispatchResult: {
                          type: 'object',
                          properties: {
                            attempted: { type: 'boolean' },
                            statusCode: { type: 'integer' },
                            durationMs: { type: 'integer' },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
  return spec;
};
