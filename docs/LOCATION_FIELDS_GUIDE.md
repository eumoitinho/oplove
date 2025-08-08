# Guia de Campos de Localização - OpenLove

**Data**: 08/01/2025
**Versão**: 0.3.4

## 📍 Campos de Localização no Banco de Dados

### Tabela `users`

Os campos de localização corretos na tabela `users` são:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `latitude` | numeric(10,8) | Latitude da localização do usuário |
| `longitude` | numeric(11,8) | Longitude da localização do usuário |
| `city` | varchar(100) | Nome da cidade |
| `uf` | varchar(2) | Sigla do estado (ex: PR, SP, RJ) |
| `state` | varchar(100) | Nome completo do estado |
| `country` | varchar(100) | País (padrão: Brazil) |

❌ **IMPORTANTE**: Não existe campo `location` na tabela `users`

### Tabela `posts`

Os campos de localização na tabela `posts` são:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `location` | varchar(255) | Descrição textual da localização |
| `latitude` | numeric(10,8) | Latitude da localização do post |
| `longitude` | numeric(11,8) | Longitude da localização do post |

✅ **Nota**: Posts têm campo `location` para texto livre

### Tabela `events`

Os campos de localização na tabela `events` são:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `location_name` | varchar(200) | Nome do local do evento |
| `location_address` | text | Endereço completo |
| `latitude` | numeric(10,8) | Latitude do local |
| `longitude` | numeric(11,8) | Longitude do local |

## 🔧 Uso Correto nos Endpoints

### Buscar Perfil de Usuário

```typescript
// ✅ CORRETO
const { data: profile } = await supabase
  .from("users")
  .select("id, username, city, uf, latitude, longitude")
  .eq("id", userId)
  .single()

// ❌ INCORRETO - campo location não existe
const { data: profile } = await supabase
  .from("users")
  .select("id, username, location")  // ERRO!
  .eq("id", userId)
  .single()
```

### Criar Post com Localização

```typescript
// Construir localização a partir dos campos do usuário
const userLocation = profile.city && profile.uf 
  ? `${profile.city}, ${profile.uf}` 
  : null

const postData = {
  content: "...",
  location: formData.get('location') || userLocation,  // Texto livre
  latitude: profile.latitude,   // Coordenadas do usuário
  longitude: profile.longitude
}
```

## 🗺️ Geolocalização no Frontend

No frontend, fazemos geolocalização reversa:

```typescript
// 1. Obtemos latitude e longitude do banco
const { latitude, longitude, city, uf } = user

// 2. Se temos coordenadas mas não cidade/uf, fazemos geocoding reverso
if (latitude && longitude && (!city || !uf)) {
  const location = await reverseGeocode(latitude, longitude)
  // Atualiza city e uf no perfil
}

// 3. Exibimos a localização formatada
const displayLocation = city && uf ? `${city}, ${uf}` : "Localização não definida"
```

## 📝 Migração de Código

Se você encontrar código usando `user.location`:

```typescript
// ❌ ANTES (incorreto)
const location = user.location || "Não informado"

// ✅ DEPOIS (correto)
const location = user.city && user.uf 
  ? `${user.city}, ${user.uf}` 
  : "Não informado"
```

## 🎯 Padrão Recomendado

Para trabalhar com localização de usuários:

```typescript
interface UserLocation {
  latitude?: number
  longitude?: number
  city?: string
  uf?: string
  state?: string
  country?: string
}

function formatUserLocation(user: UserLocation): string {
  if (user.city && user.uf) {
    return `${user.city}, ${user.uf}`
  }
  if (user.city) {
    return user.city
  }
  if (user.state) {
    return user.state
  }
  return user.country || "Brasil"
}

// Uso
const locationText = formatUserLocation(userProfile)
```

## ⚠️ Erros Comuns

1. **Tentar acessar `users.location`**
   - Solução: Use `city` e `uf` concatenados

2. **Salvar localização formatada no banco**
   - Solução: Salve campos separados (city, uf, lat, long)

3. **Não verificar campos null**
   - Solução: Sempre verificar se city e uf existem antes de concatenar

## 🔄 Atualização de Localização

Para atualizar localização do usuário:

```typescript
// Via coordenadas (GPS)
await supabase
  .from("users")
  .update({
    latitude: coords.latitude,
    longitude: coords.longitude,
    // Fazer reverse geocoding para obter city/uf
    city: geoResult.city,
    uf: geoResult.state
  })
  .eq("id", userId)

// Via formulário
await supabase
  .from("users")
  .update({
    city: formData.city,
    uf: formData.uf,
    // Opcionalmente fazer geocoding para obter lat/long
    latitude: geoResult?.lat,
    longitude: geoResult?.lng
  })
  .eq("id", userId)
```

## ✅ Checklist de Correção

- [x] Remover `location` de queries na tabela `users`
- [x] Usar `city, uf` para localização textual
- [x] Usar `latitude, longitude` para coordenadas
- [x] Atualizar função `getUserProfileOrError`
- [x] Documentar campos corretos

## 📚 Referências

- Tabela users: `/supabase/migrations/db_cluster.sql`
- Endpoint posts: `/app/api/v1/posts/route.ts`
- Função utilitária: `/lib/api/user-profile.ts`