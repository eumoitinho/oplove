'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, ChevronRight, Copy, Check } from 'lucide-react';

interface ApiEndpoint {
  path: string;
  method: string;
  summary: string;
  description?: string;
  tags: string[];
  parameters?: any[];
  requestBody?: any;
  responses?: any;
}

interface ApiCategory {
  name: string;
  description: string;
  endpoints: ApiEndpoint[];
}

export default function ApiDocsPage() {
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedEndpoints, setExpandedEndpoints] = useState<Set<string>>(new Set());
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carregamento dos dados da API
    // Em produção, isso viria do endpoint /api/v1/docs
    const mockCategories: ApiCategory[] = [
      {
        name: 'Auth',
        description: 'Endpoints de autenticação e autorização',
        endpoints: [
          {
            path: '/api/v1/auth/register',
            method: 'POST',
            summary: 'Registrar novo usuário',
            description: 'Cria uma nova conta de usuário na plataforma',
            tags: ['Auth'],
          },
          {
            path: '/api/v1/auth/login',
            method: 'POST',
            summary: 'Fazer login',
            description: 'Autentica o usuário e retorna tokens de acesso',
            tags: ['Auth'],
          },
        ],
      },
      {
        name: 'Posts',
        description: 'Criação e interação com posts',
        endpoints: [
          {
            path: '/api/v1/posts',
            method: 'GET',
            summary: 'Listar posts do feed',
            description: 'Retorna lista paginada de posts baseado no usuário e seus filtros',
            tags: ['Posts'],
          },
          {
            path: '/api/v1/posts/create',
            method: 'POST',
            summary: 'Criar novo post',
            description: 'Cria um novo post no feed do usuário',
            tags: ['Posts'],
          },
        ],
      },
      {
        name: 'Stories',
        description: 'Sistema de stories (conteúdo efêmero)',
        endpoints: [
          {
            path: '/api/v1/stories',
            method: 'GET',
            summary: 'Listar stories disponíveis',
            tags: ['Stories'],
          },
          {
            path: '/api/v1/stories',
            method: 'POST',
            summary: 'Criar novo story',
            tags: ['Stories'],
          },
        ],
      },
    ];

    setTimeout(() => {
      setCategories(mockCategories);
      setLoading(false);
    }, 500);
  }, []);

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const toggleEndpoint = (endpoint: string) => {
    const newExpanded = new Set(expandedEndpoints);
    if (newExpanded.has(endpoint)) {
      newExpanded.delete(endpoint);
    } else {
      newExpanded.add(endpoint);
    }
    setExpandedEndpoints(newExpanded);
  };

  const copyEndpoint = async (path: string) => {
    await navigator.clipboard.writeText(`https://openlove.com.br${path}`);
    setCopiedEndpoint(path);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const getMethodColor = (method: string) => {
    const colors = {
      GET: 'bg-blue-500',
      POST: 'bg-green-500',
      PUT: 'bg-orange-500',
      DELETE: 'bg-red-500',
      PATCH: 'bg-yellow-500',
    };
    return colors[method] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando documentação...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            OpenLove API Documentation
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Documentação completa da API REST v1.0
          </p>
          <div className="mt-4 flex items-center space-x-4 text-sm">
            <div className="flex items-center">
              <span className="text-gray-500 dark:text-gray-400">Base URL:</span>
              <code className="ml-2 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-purple-600 dark:text-purple-400">
                https://openlove.com.br/api/v1
              </code>
            </div>
            <div className="flex items-center">
              <span className="text-gray-500 dark:text-gray-400">Versão:</span>
              <span className="ml-2 font-semibold">1.0.0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Quick Links */}
        <div className="mb-8 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <h2 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2">
            Links Rápidos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <a 
              href="/api/v1/docs/README.md" 
              target="_blank"
              className="text-purple-600 dark:text-purple-400 hover:underline"
            >
              📖 Guia de Início Rápido
            </a>
            <a 
              href="/api/v1/docs/api-client-examples.md" 
              target="_blank"
              className="text-purple-600 dark:text-purple-400 hover:underline"
            >
              💻 Exemplos de Código
            </a>
            <a 
              href="https://github.com/openlove/api-sdk" 
              target="_blank"
              className="text-purple-600 dark:text-purple-400 hover:underline"
            >
              🔧 SDK Oficial
            </a>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-6">
          {categories.map((category) => {
            const isExpanded = expandedCategories.has(category.name);
            
            return (
              <div 
                key={category.name}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
              >
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category.name)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-gray-500 mr-3" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-500 mr-3" />
                    )}
                    <div className="text-left">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {category.description}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {category.endpoints.length} endpoints
                  </span>
                </button>

                {/* Endpoints */}
                {isExpanded && (
                  <div className="border-t border-gray-200 dark:border-gray-700">
                    {category.endpoints.map((endpoint, index) => {
                      const endpointKey = `${endpoint.method}-${endpoint.path}`;
                      const isEndpointExpanded = expandedEndpoints.has(endpointKey);
                      
                      return (
                        <div 
                          key={endpointKey}
                          className={`${
                            index > 0 ? 'border-t border-gray-100 dark:border-gray-700' : ''
                          }`}
                        >
                          {/* Endpoint Header */}
                          <div className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                            <div className="flex items-start justify-between">
                              <button
                                onClick={() => toggleEndpoint(endpointKey)}
                                className="flex-1 flex items-start text-left"
                              >
                                <span className={`
                                  inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium text-white
                                  ${getMethodColor(endpoint.method)} mr-3 mt-0.5
                                `}>
                                  {endpoint.method}
                                </span>
                                <div className="flex-1">
                                  <code className="text-sm font-mono text-gray-900 dark:text-gray-100">
                                    {endpoint.path}
                                  </code>
                                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                    {endpoint.summary}
                                  </p>
                                </div>
                              </button>
                              <button
                                onClick={() => copyEndpoint(endpoint.path)}
                                className="ml-4 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                title="Copiar endpoint"
                              >
                                {copiedEndpoint === endpoint.path ? (
                                  <Check className="w-4 h-4 text-green-500" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Endpoint Details */}
                          {isEndpointExpanded && (
                            <div className="px-6 pb-4 bg-gray-50 dark:bg-gray-700/20">
                              <div className="pl-12 space-y-4">
                                {endpoint.description && (
                                  <div>
                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                      Descrição
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      {endpoint.description}
                                    </p>
                                  </div>
                                )}
                                
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Exemplo de Requisição
                                  </h4>
                                  <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto">
{`curl -X ${endpoint.method} https://openlove.com.br${endpoint.path} \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json"${endpoint.method === 'POST' ? ` \\
  -d '{
    "example": "data"
  }'` : ''}`}
                                  </pre>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            Para documentação completa com todos os parâmetros e schemas, 
            consulte o{' '}
            <a 
              href="/api/v1/docs" 
              target="_blank"
              className="text-purple-600 dark:text-purple-400 hover:underline"
            >
              arquivo OpenAPI
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}