# Sistema de Autenticação OpenLove - Configuração Otimizada

## Arquitetura Implementada

### 1. Auth Store (Zustand)
- **Arquivo**: `/lib/stores/auth-store.ts`
- **Features**:
  - Persiste usuário e sessão no localStorage
  - Estado inicial `isLoading: true` para evitar flickers
  - Armazena tokens de acesso para uso em APIs

### 2. Auth Provider Otimizado
- **Arquivo**: `/components/auth/providers/AuthProviderOptimized.tsx`
- **Features**:
  - Usa hook `useAuthState` para gerenciar estado sem loops
  - Callbacks memoizados com `useCallback`
  - Atualização imediata de tokens após login

### 3. Hook useAuthState
- **Arquivo**: `/hooks/useAuthState.ts`
- **Features**:
  - Inicialização única com flag `isInitialized`
  - Listener de mudanças de autenticação
  - Previne re-renderizações desnecessárias

### 4. Auth Guard Otimizado
- **Arquivo**: `/components/auth/guards/AuthGuard.tsx`
- **Features**:
  - Flag `hasRedirected` previne loops de redirecionamento
  - Salva rota anterior para redirect após login
  - Loading state elegante com Framer Motion

### 5. API Client
- **Arquivo**: `/lib/api-client.ts`
- **Features**:
  - Busca token automaticamente do Supabase
  - Headers de autorização automáticos
  - Métodos convenientes (get, post, put, delete)

### 6. Server-side Auth
- **Arquivo**: `/lib/auth/server.ts`
- **Features**:
  - Função `withAuth` para proteger rotas de API
  - Busca usuário completo do banco
  - Respostas padronizadas

## Uso Correto

### Em Componentes Client
```typescript
import { useAuth } from "@/components/auth/providers/AuthProviderOptimized"

function MyComponent() {
  const { user, isLoading, isAuthenticated } = useAuth()
  
  if (isLoading) return <LoadingSpinner />
  if (!isAuthenticated) return <LoginPrompt />
  
  return <div>Welcome, {user.name}!</div>
}
```

### Em API Routes
```typescript
import { withAuth } from '@/lib/auth/server'

export async function GET(request: NextRequest) {
  return withAuth(async (user) => {
    // user está autenticado aqui
    return {
      success: true,
      data: { userId: user.id }
    }
  })
}
```

### Para Chamadas de API do Cliente
```typescript
import { apiClient } from '@/lib/api-client'

// Com autenticação (padrão)
const { data, error } = await apiClient.get('/posts')

// Sem autenticação
const { data, error } = await apiClient.get('/public/data', { 
  requireAuth: false 
})
```

## Configuração de Layouts

### Layout Principal (Rotas Protegidas)
```typescript
// app/(main)/layout.tsx
import { AuthProviderOptimized } from "@/components/auth/providers/AuthProviderOptimized"
import { ProtectedRoute } from "@/components/auth/guards/AuthGuard"

export default function MainLayout({ children }) {
  return (
    <AuthProviderOptimized>
      <ProtectedRoute>
        {children}
      </ProtectedRoute>
    </AuthProviderOptimized>
  )
}
```

### Layout de Autenticação (Rotas Públicas)
```typescript
// app/(auth)/layout.tsx
import { AuthProviderOptimized } from "@/components/auth/providers/AuthProviderOptimized"
import { PublicRoute } from "@/components/auth/guards/AuthGuard"

export default function AuthLayout({ children }) {
  return (
    <AuthProviderOptimized>
      <PublicRoute>
        {children}
      </PublicRoute>
    </AuthProviderOptimized>
  )
}
```

## Prevenção de Loops

### 1. Estado Inicial Correto
- Auth store inicia com `isLoading: true`
- Evita renderizações antes da verificação de sessão

### 2. Flags de Controle
- `isInitialized` no useAuthState previne múltiplas inicializações
- `hasRedirected` no AuthGuard previne loops de redirect

### 3. Dependências Corretas
- useEffects com arrays de dependência apropriados
- Callbacks memoizados para evitar re-criações

### 4. Cleanup Adequado
- Flags `mounted` para evitar atualizações após desmontagem
- Unsubscribe de listeners ao desmontar

## Troubleshooting

### Loop de Renderização
- Verifique se está usando `AuthProviderOptimized` ao invés do antigo
- Confirme que não há múltiplos providers aninhados
- Use React DevTools para verificar re-renderizações

### Token não Disponível
- Confirme que o login está salvando a sessão corretamente
- Verifique se o auth store está persistindo
- Use o hook `useAuthToken` para debug

### Redirect não Funciona
- Verifique se o middleware está configurado corretamente
- Confirme que as rotas estão nos matchers do middleware
- Teste com console.log no AuthGuard

## Melhorias Futuras
1. Implementar refresh token automático
2. Adicionar cache de perfil de usuário
3. Implementar logout em todas as abas
4. Adicionar telemetria de autenticação