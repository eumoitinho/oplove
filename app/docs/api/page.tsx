'use client';

import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">OpenLove API Documentation</h1>
          <p className="mt-2 text-gray-600">
            Documentação completa da API REST v1.0
          </p>
        </div>
      </div>
      
      <div className="swagger-ui-wrapper">
        <SwaggerUI 
          url="/api/v1/docs"
          docExpansion="none"
          defaultModelsExpandDepth={-1}
          displayRequestDuration={true}
          filter={true}
          showExtensions={true}
          showCommonExtensions={true}
          tryItOutEnabled={true}
        />
      </div>

      <style jsx global>{`
        .swagger-ui .topbar {
          display: none;
        }
        
        .swagger-ui .info {
          margin-bottom: 2rem;
        }
        
        .swagger-ui .scheme-container {
          background: #f8f9fa;
          padding: 1rem;
          border-radius: 0.5rem;
          margin-bottom: 2rem;
        }
        
        .swagger-ui .btn.authorize {
          background-color: #9333ea;
          border-color: #9333ea;
        }
        
        .swagger-ui .btn.authorize:hover {
          background-color: #7c3aed;
          border-color: #7c3aed;
        }
        
        .swagger-ui .opblock.opblock-post .opblock-summary {
          border-color: #10b981;
        }
        
        .swagger-ui .opblock.opblock-post .opblock-summary-method {
          background: #10b981;
        }
        
        .swagger-ui .opblock.opblock-get .opblock-summary {
          border-color: #3b82f6;
        }
        
        .swagger-ui .opblock.opblock-get .opblock-summary-method {
          background: #3b82f6;
        }
        
        .swagger-ui .opblock.opblock-put .opblock-summary {
          border-color: #f59e0b;
        }
        
        .swagger-ui .opblock.opblock-put .opblock-summary-method {
          background: #f59e0b;
        }
        
        .swagger-ui .opblock.opblock-delete .opblock-summary {
          border-color: #ef4444;
        }
        
        .swagger-ui .opblock.opblock-delete .opblock-summary-method {
          background: #ef4444;
        }
      `}</style>
    </div>
  );
}