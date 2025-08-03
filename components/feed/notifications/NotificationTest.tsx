'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Bell, Plus, AlertCircle, CheckCircle } from 'lucide-react'

export function NotificationTest() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)
  const [createResult, setCreateResult] = useState<any>(null)

  const testNotifications = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/v1/notifications/test')
      const data = await response.json()
      setTestResult(data)
      console.log('Test result:', data)
    } catch (error) {
      console.error('Test error:', error)
      setTestResult({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  const createTestNotification = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/v1/notifications/test', {
        method: 'POST'
      })
      const data = await response.json()
      setCreateResult(data)
      console.log('Create result:', data)
    } catch (error) {
      console.error('Create error:', error)
      setCreateResult({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="bg-white rounded-lg border p-6 space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Bell className="h-5 w-5" />
        Teste de Notificações
      </h3>

      <div className="space-y-4">
        <div className="flex gap-2">
          <Button
            onClick={testNotifications}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            Testar Query de Notificações
          </Button>
          
          <Button
            onClick={createTestNotification}
            disabled={loading}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            Criar Notificação de Teste
          </Button>
        </div>

        {testResult && (
          <div className="border rounded-lg p-4 space-y-2">
            <h4 className="font-medium">Resultado do Teste:</h4>
            
            {testResult.success ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>Sucesso!</span>
                </div>
                
                <div className="text-sm space-y-1">
                  <p>Usuário: {testResult.user?.email}</p>
                  <p>Tabela existe: {testResult.tests?.tableExists ? 'Sim' : 'Não'}</p>
                  <p>Total no sistema: {testResult.tests?.totalNotificationsInSystem || 0}</p>
                  <p>Suas notificações: {testResult.tests?.basicQuery?.count || 0}</p>
                  
                  {testResult.tests?.basicQuery?.data?.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <p className="font-medium">Últimas notificações:</p>
                      {testResult.tests.basicQuery.data.slice(0, 3).map((n: any) => (
                        <div key={n.id} className="text-xs bg-gray-50 p-2 rounded">
                          <p>{n.title} - {n.message}</p>
                          <p className="text-gray-500">{new Date(n.created_at).toLocaleString('pt-BR')}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span>Erro: {testResult.error}</span>
              </div>
            )}
            
            <details className="mt-2">
              <summary className="cursor-pointer text-sm text-gray-600">Ver JSON completo</summary>
              <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </details>
          </div>
        )}

        {createResult && (
          <div className="border rounded-lg p-4 space-y-2">
            <h4 className="font-medium">Resultado da Criação:</h4>
            
            {createResult.success ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>{createResult.message}</span>
                </div>
                
                {createResult.data && (
                  <div className="text-sm space-y-1 bg-gray-50 p-2 rounded">
                    <p>ID: {createResult.data.id}</p>
                    <p>Título: {createResult.data.title}</p>
                    <p>Mensagem: {createResult.data.message}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>Erro: {createResult.error}</span>
                </div>
                {createResult.details && (
                  <p className="text-sm text-gray-600">Detalhes: {createResult.details}</p>
                )}
                {createResult.hint && (
                  <p className="text-sm text-gray-600">Dica: {createResult.hint}</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}