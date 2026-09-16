import { createSwaggerSpec } from 'next-swagger-doc';

export const getApiDocs = async () => {
  const spec = createSwaggerSpec({
    apiFolder: 'src/app/api',
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Trakzee Master Project API',
        version: '1.0.0',
        description: 'Comprehensive API documentation for Trakzee telematics, user management, and system webhooks.',
        contact: {
          name: 'API Support',
          email: 'support@trakzee.com'
        }
      },
      tags: [
        { name: 'System', description: 'System health and maintenance' },
        { name: 'Webhooks', description: 'External integrations and event hooks' },
        { name: 'Users', description: 'User management and authentication' },
        { name: 'Devices', description: 'Telematics device management' }
      ],
      components: {
        securitySchemes: {
          BearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'CRON_SECRET',
            description: 'Cron endpoint secret; browser sessions use an HttpOnly cookie.'
          },
          ApiKeyAuth: {
            type: 'apiKey',
            in: 'header',
            name: 'X-API-Key',
            description: 'Static API key for backend services'
          }
        },
        schemas: {
          ErrorResponse: {
            type: 'object',
            properties: {
              error: { type: 'string', example: 'Unauthorized access' },
              code: { type: 'integer', example: 401 }
            }
          },
          User: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000' },
              name: { type: 'string', example: 'Ali Fleet Admin' },
              email: { type: 'string', format: 'email', example: 'admin@trakzee.com' },
              role: { type: 'string', enum: ['ADMIN', 'MANAGER', 'USER'], example: 'ADMIN' },
              createdAt: { type: 'string', format: 'date-time' }
            }
          },
          Device: {
            type: 'object',
            properties: {
              imei: { type: 'string', example: '864332049999999' },
              name: { type: 'string', example: 'Truck 01' },
              status: { type: 'string', enum: ['ONLINE', 'OFFLINE', 'IDLE'], example: 'ONLINE' },
              lastPing: { type: 'string', format: 'date-time' }
            }
          }
        }
      },
      security: [
        { BearerAuth: [] }
      ],
    },
  });
  return spec;
};
