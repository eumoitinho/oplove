# 🚀 Exemplos de Uso da API OpenLove

## JavaScript/TypeScript

### Instalação
```bash
npm install axios
# ou
yarn add axios
```

### Cliente Base
```typescript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://openlove.com.br/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Autenticação
```typescript
// Login
async function login(email: string, password: string) {
  try {
    const response = await apiClient.post('/auth/login', {
      email,
      password,
    });
    
    const { user, session } = response.data;
    localStorage.setItem('access_token', session.access_token);
    localStorage.setItem('refresh_token', session.refresh_token);
    
    return user;
  } catch (error) {
    console.error('Login failed:', error.response?.data);
    throw error;
  }
}

// Registro
async function register(userData: {
  email: string;
  password: string;
  username: string;
  fullName: string;
  birthDate: string;
}) {
  const response = await apiClient.post('/auth/register', userData);
  return response.data;
}
```

### Posts
```typescript
// Listar posts do feed
async function getFeed(page = 1, feedType = 'for-you') {
  const response = await apiClient.get('/posts', {
    params: { page, feed_type: feedType, limit: 20 }
  });
  return response.data;
}

// Criar post com imagem
async function createPost(content: string, images: File[]) {
  const formData = new FormData();
  formData.append('content', content);
  
  images.forEach((image, index) => {
    formData.append(`media`, image);
  });
  
  const response = await apiClient.post('/posts/create', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  
  return response.data.post;
}

// Curtir post
async function toggleLike(postId: string) {
  const response = await apiClient.post(`/posts/${postId}/like`);
  return response.data;
}
```

### Stories
```typescript
// Criar story
async function createStory(media: File, caption?: string) {
  const formData = new FormData();
  formData.append('media', media);
  if (caption) formData.append('caption', caption);
  
  const response = await apiClient.post('/stories', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  
  return response.data.story;
}

// Boost story
async function boostStory(storyId: string, duration: 6 | 12 | 24) {
  const response = await apiClient.post(`/stories/${storyId}/boost`, {
    duration
  });
  return response.data;
}

// Marcar como visto
async function viewStory(storyId: string) {
  const response = await apiClient.post(`/stories/${storyId}/view`);
  return response.data.next_story_id;
}
```

### Mensagens
```typescript
// Listar conversas
async function getConversations(page = 1) {
  const response = await apiClient.get('/messages/conversations', {
    params: { page, limit: 20 }
  });
  return response.data;
}

// Enviar mensagem
async function sendMessage(conversationId: string, content: string) {
  try {
    const response = await apiClient.post(
      `/messages/conversations/${conversationId}/messages`,
      { content }
    );
    return response.data.message;
  } catch (error) {
    if (error.response?.status === 403) {
      throw new Error('Limite de mensagens atingido ou plano não permite');
    }
    throw error;
  }
}
```

## Python

### Instalação
```bash
pip install requests
```

### Cliente Base
```python
import requests
from typing import Optional, Dict, Any

class OpenLoveAPI:
    def __init__(self, base_url: str = "https://openlove.com.br/api/v1"):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            "Content-Type": "application/json"
        })
    
    def set_token(self, token: str):
        self.session.headers["Authorization"] = f"Bearer {token}"
    
    def _request(self, method: str, endpoint: str, **kwargs) -> Dict[str, Any]:
        url = f"{self.base_url}{endpoint}"
        response = self.session.request(method, url, **kwargs)
        response.raise_for_status()
        return response.json()
```

### Exemplos de Uso
```python
# Inicializar cliente
api = OpenLoveAPI()

# Login
def login(email: str, password: str):
    data = api._request("POST", "/auth/login", json={
        "email": email,
        "password": password
    })
    
    api.set_token(data["session"]["access_token"])
    return data["user"]

# Criar post
def create_post(content: str, images: Optional[List[str]] = None):
    files = {}
    data = {"content": content}
    
    if images:
        for i, image_path in enumerate(images):
            with open(image_path, 'rb') as f:
                files[f"media"] = f
    
    return api._request("POST", "/posts/create", data=data, files=files)

# Listar stories
def get_stories(page: int = 1):
    return api._request("GET", "/stories", params={"page": page})
```

## cURL

### Autenticação
```bash
# Login
curl -X POST https://openlove.com.br/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@exemplo.com",
    "password": "senhaSegura123!"
  }'

# Usar token nas requisições
export TOKEN="seu-token-aqui"
```

### Posts
```bash
# Listar feed
curl -X GET "https://openlove.com.br/api/v1/posts?page=1&feed_type=for-you" \
  -H "Authorization: Bearer $TOKEN"

# Criar post com imagem
curl -X POST https://openlove.com.br/api/v1/posts/create \
  -H "Authorization: Bearer $TOKEN" \
  -F "content=Meu novo post!" \
  -F "media=@/path/to/image.jpg"

# Curtir post
curl -X POST https://openlove.com.br/api/v1/posts/123/like \
  -H "Authorization: Bearer $TOKEN"
```

### Stories
```bash
# Criar story
curl -X POST https://openlove.com.br/api/v1/stories \
  -H "Authorization: Bearer $TOKEN" \
  -F "media=@/path/to/video.mp4" \
  -F "caption=Confira meu story!"

# Boost story
curl -X POST https://openlove.com.br/api/v1/stories/456/boost \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"duration": 12}'
```

## React Hook Personalizado

```typescript
import { useState, useCallback } from 'react';
import { apiClient } from './api-client';

// Hook para posts
export function usePosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const fetchPosts = useCallback(async (page = 1, feedType = 'for-you') => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await apiClient.get('/posts', {
        params: { page, feed_type: feedType }
      });
      setPosts(prev => page === 1 ? data.posts : [...prev, ...data.posts]);
      return data;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);
  
  const createPost = useCallback(async (content: string, media?: File[]) => {
    const formData = new FormData();
    formData.append('content', content);
    media?.forEach(file => formData.append('media', file));
    
    const response = await apiClient.post('/posts/create', formData);
    setPosts(prev => [response.data.post, ...prev]);
    return response.data.post;
  }, []);
  
  return {
    posts,
    loading,
    error,
    fetchPosts,
    createPost,
  };
}
```

## Tratamento de Erros

```typescript
// Interceptor global para erros
apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    // Token expirado - tentar renovar
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await apiClient.post('/auth/refresh', {
          refresh_token: refreshToken
        });
        
        const { access_token } = response.data;
        localStorage.setItem('access_token', access_token);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh falhou - redirecionar para login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    // Tratar erros específicos
    if (error.response?.status === 403) {
      console.error('Ação não permitida pelo plano atual');
    } else if (error.response?.status === 429) {
      console.error('Muitas requisições - tente novamente em breve');
    }
    
    return Promise.reject(error);
  }
);
```

## WebSocket para Real-time

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Escutar novas mensagens
function subscribeToMessages(conversationId: string, onMessage: (message: any) => void) {
  const subscription = supabase
    .channel(`conversation:${conversationId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `conversation_id=eq.${conversationId}`
    }, payload => {
      onMessage(payload.new);
    })
    .subscribe();
  
  return () => subscription.unsubscribe();
}

// Escutar atualizações de stories
function subscribeToStoryUpdates(userId: string, onUpdate: (story: any) => void) {
  const subscription = supabase
    .channel(`stories:${userId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'stories',
      filter: `user_id=eq.${userId}`
    }, payload => {
      onUpdate(payload);
    })
    .subscribe();
  
  return () => subscription.unsubscribe();
}
```