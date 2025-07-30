import { getApiDocs } from '@/lib/swagger';

/**
 * Configuração do Swagger/OpenAPI para documentação da API
 */
export const swaggerConfig = {
  openapi: '3.0.0',
  info: {
    title: 'OpenLove API',
    version: '1.0.0',
    description: 'API completa para a plataforma OpenLove - Rede social focada em conexões autênticas',
    contact: {
      name: 'OpenLove Support',
      email: 'contato@openlove.com.br',
      url: 'https://openlove.com.br'
    },
    license: {
      name: 'Proprietary',
      url: 'https://openlove.com.br/terms'
    }
  },
  servers: [
    {
      url: 'https://openlove.com.br/api/v1',
      description: 'Production server'
    },
    {
      url: 'http://localhost:3000/api/v1',
      description: 'Development server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token obtido através do endpoint de login'
      },
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'sb-access-token',
        description: 'Cookie de autenticação do Supabase'
      }
    },
    schemas: {
      // Schemas comuns
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            description: 'Mensagem de erro'
          },
          code: {
            type: 'string',
            description: 'Código do erro'
          },
          details: {
            type: 'object',
            description: 'Detalhes adicionais do erro'
          }
        },
        required: ['error']
      },
      Pagination: {
        type: 'object',
        properties: {
          page: {
            type: 'integer',
            minimum: 1,
            default: 1
          },
          limit: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 20
          },
          total: {
            type: 'integer'
          },
          totalPages: {
            type: 'integer'
          }
        }
      },
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid'
          },
          username: {
            type: 'string'
          },
          full_name: {
            type: 'string'
          },
          avatar_url: {
            type: 'string',
            format: 'uri'
          },
          bio: {
            type: 'string'
          },
          is_verified: {
            type: 'boolean'
          },
          premium_type: {
            type: 'string',
            enum: ['free', 'gold', 'diamond', 'couple']
          },
          created_at: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      Post: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid'
          },
          content: {
            type: 'string'
          },
          media_urls: {
            type: 'array',
            items: {
              type: 'string',
              format: 'uri'
            }
          },
          author: {
            $ref: '#/components/schemas/User'
          },
          likes_count: {
            type: 'integer'
          },
          comments_count: {
            type: 'integer'
          },
          is_liked: {
            type: 'boolean'
          },
          created_at: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      Story: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid'
          },
          user_id: {
            type: 'string',
            format: 'uuid'
          },
          media_url: {
            type: 'string',
            format: 'uri'
          },
          media_type: {
            type: 'string',
            enum: ['image', 'video']
          },
          caption: {
            type: 'string'
          },
          views_count: {
            type: 'integer'
          },
          is_boosted: {
            type: 'boolean'
          },
          expires_at: {
            type: 'string',
            format: 'date-time'
          },
          created_at: {
            type: 'string',
            format: 'date-time'
          }
        }
      }
    }
  },
  tags: [
    {
      name: 'Auth',
      description: 'Endpoints de autenticação e autorização'
    },
    {
      name: 'Users',
      description: 'Gerenciamento de usuários e perfis'
    },
    {
      name: 'Posts',
      description: 'Criação e interação com posts'
    },
    {
      name: 'Stories',
      description: 'Sistema de stories (conteúdo efêmero)'
    },
    {
      name: 'Messages',
      description: 'Sistema de mensagens e chat'
    },
    {
      name: 'Payments',
      description: 'Processamento de pagamentos e assinaturas'
    },
    {
      name: 'Business',
      description: 'Funcionalidades para contas business'
    },
    {
      name: 'Credits',
      description: 'Sistema de créditos e moedas virtuais'
    },
    {
      name: 'Verification',
      description: 'Verificação de identidade'
    }
  ]
};

export default swaggerConfig;