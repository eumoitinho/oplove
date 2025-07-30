'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, ChevronRight, Copy, Check, ExternalLink } from 'lucide-react';

interface ApiDocs {
  openapi: string;
  info: {
    title: string;
    version: string;
    description: string;
  };
  servers: Array<{
    url: string;
    description: string;
  }>;
  tags: Array<{
    name: string;
    description: string;
  }>;
  paths?: Record<string, any>;
}

interface ParsedEndpoint {
  path: string;
  method: string;
  summary: string;
  description?: string;
  tags: string[];
  security?: any[];
  parameters?: any[];
  requestBody?: any;
  responses?: any;
}

export default function ApiDocumentation() {
  const [apiDocs, setApiDocs] = useState<ApiDocs | null>(null);
  const [endpoints, setEndpoints] = useState<Map<string, ParsedEndpoint[]>>(new Map());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedEndpoints, setExpandedEndpoints] = useState<Set<string>>(new Set());
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchApiDocs();
  }, []);

  const fetchApiDocs = async () => {
    try {
      const response = await fetch('/api/v1/docs');
      if (!response.ok) {
        throw new Error('Failed to fetch API documentation');
      }
      
      const data = await response.json();
      setApiDocs(data);
      
      // Parse endpoints from all .docs.ts files
      const endpointsByTag = new Map<string, ParsedEndpoint[]>();
      
      // For now, we'll use the mock data structure
      // In production, this would parse the actual OpenAPI spec
      if (data.tags) {
        data.tags.forEach((tag: any) => {
          endpointsByTag.set(tag.name, []);
        });
      }
      
      setEndpoints(endpointsByTag);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load documentation');
    } finally {
      setLoading(false);
    }
  };

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
    const baseUrl = apiDocs?.servers?.[0]?.url || 'https://openlove.com.br/api/v1';
    await navigator.clipboard.writeText(`${baseUrl}${path}`);
    setCopiedEndpoint(path);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const getMethodColor = (method: string) => {
    const colors: Record<string, string> = {
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
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
            {apiDocs?.info?.title || 'API Documentation'}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {apiDocs?.info?.description || 'Complete API reference'}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
            {apiDocs?.servers?.map((server, index) => (
              <div key={index} className="flex items-center">
                <span className="text-gray-500 dark:text-gray-400">{server.description}:</span>
                <code className="ml-2 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-purple-600 dark:text-purple-400">
                  {server.url}
                </code>
              </div>
            ))}
            <div className="flex items-center">
              <span className="text-gray-500 dark:text-gray-400">Version:</span>
              <span className="ml-2 font-semibold">{apiDocs?.info?.version || '1.0.0'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Info Box */}
        <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <h2 className="text-xl font-bold text-purple-900 dark:text-purple-100 mb-4">
            🚀 Como usar a API
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">
                1. Autenticação
              </h3>
              <pre className="bg-white dark:bg-gray-800 p-3 rounded text-sm overflow-x-auto">
{`POST /api/v1/auth/login
{
  "email": "user@example.com",
  "password": "password"
}`}
              </pre>
            </div>
            <div>
              <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">
                2. Use o token
              </h3>
              <pre className="bg-white dark:bg-gray-800 p-3 rounded text-sm overflow-x-auto">
{`GET /api/v1/posts
Authorization: Bearer <token>`}
              </pre>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-4">
            <a 
              href="/api/v1/docs/README.md" 
              className="inline-flex items-center text-purple-600 dark:text-purple-400 hover:underline"
            >
              📖 Guia completo
              <ExternalLink className="w-3 h-3 ml-1" />
            </a>
            <a 
              href="/api/v1/docs/api-client-examples.md" 
              className="inline-flex items-center text-purple-600 dark:text-purple-400 hover:underline"
            >
              💻 Exemplos de código
              <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </div>
        </div>

        {/* Tags/Categories */}
        <div className="space-y-6">
          {apiDocs?.tags?.map((tag) => {
            const isExpanded = expandedCategories.has(tag.name);
            const tagEndpoints = endpoints.get(tag.name) || [];
            
            return (
              <div 
                key={tag.name}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <button
                  onClick={() => toggleCategory(tag.name)}
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
                        {tag.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {tag.description}
                      </p>
                    </div>
                  </div>
                </button>

                {isExpanded && tagEndpoints.length === 0 && (
                  <div className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
                    <p>Consulte a documentação completa em <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">/api/v1/docs/endpoints/{tag.name.toLowerCase()}.docs.ts</code></p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* OpenAPI JSON Link */}
        <div className="mt-12 p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Ferramentas para desenvolvedores
          </h3>
          <div className="space-y-3">
            <a 
              href="/api/v1/docs" 
              target="_blank"
              className="flex items-center text-purple-600 dark:text-purple-400 hover:underline"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              OpenAPI JSON Specification
            </a>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Use esta especificação para gerar SDKs, importar no Postman/Insomnia, ou integrar com suas ferramentas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}