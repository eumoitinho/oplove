# CLAUDE.md - OpenLove Project Context

## 🎯 Project Overview

OpenLove is a modern social network focused on authentic connections and meaningful relationships. Currently in version 0.3.2-alpha, it's a fully functional platform comparable to major social networks with a focus on adult content monetization and premium features.

### Key Information
- **Tech Stack**: Next.js 15, React 19, TypeScript, Supabase, Tailwind CSS
- **Status**: Production-ready MVP with real payment processing
- **Monetization**: Subscription plans + content sales with commission model
- **Target**: Brazilian market initially, Portuguese language

## 🏗️ Project Structure

```
/openlove
├── /app                    # Next.js 15 App Router
│   ├── /(auth)            # Authentication routes
│   ├── /(main)            # Main app routes
│   ├── /(business)        # Business accounts
│   └── /api               # API endpoints
├── /components            # React components
│   ├── /auth             # Authentication components
│   ├── /feed             # Timeline and posts
│   ├── /chat             # Messaging system
│   ├── /premium          # Paywall and subscriptions
│   ├── /business         # Business profiles
│   └── /common           # Shared components
├── /hooks                # Custom React hooks
├── /lib                  # Core libraries
├── /services             # API services
├── /types                # TypeScript definitions
├── /utils                # Helper functions
└── /supabase            # Database migrations
```

## 💼 Business Rules

### User Plans

#### Free Plan
- Cannot send messages (can reply if premium user messages first)
- Cannot upload images/videos in posts
- Cannot join communities
- Cannot create events
- Sees ads every 5 posts
- 3 photos/month upload limit

#### Gold Plan (R$25/month)
- 10 messages/day (unverified), unlimited (verified)
- Up to 5 images per post
- Can create events (3/month unverified, unlimited verified)
- Can join up to 5 communities
- Cannot create group chats
- Sees ads every 10 posts

#### Diamond Plan (R$45/month)
- Unlimited everything
- Can create group chats (50 members max)
- Voice/video calls
- 24h Stories
- Profile analytics
- Can monetize content
- No ads

#### Dupla Hot Plan (R$69.90/month)
- All Diamond features for 2 accounts
- Perfis sincronizados automaticamente
- Posts aparecem nos dois perfis em tempo real
- Timeline compartilhada
- Lives e transmissões conjuntas
- Monetização em conjunto
- Badge especial de 'Dupla Verificada'

### Messaging Rules (v0.3.2 Update)
- Free users CANNOT initiate conversations
- Free users CAN reply if a premium user messages them first
- Only Diamond/Couple users can create group chats
- Events and communities have automatic group chats
- Gold users cannot create custom groups

### Content Monetization
- Only Diamond+ users can sell content
- Commission: 20% (unverified), 15% (verified), 10% (business verified)
- Minimum payout: R$50
- Weekly payments via PIX

### Verification System
- Required for full Gold features
- Document + selfie + liveness detection
- 48h processing time
- Blue checkmark badge

## 🗄️ Database Schema Updates

### Key Tables
- `users` - with premium_type, is_verified, daily_message_limit
- `conversations` - with initiated_by, initiated_by_premium, group_type
- `messages` - with sender validation
- `posts` - with media restrictions by plan
- `subscriptions` - payment and plan management
- `businesses` - business accounts
- `paid_content` - monetizable content
- `advertisements` - ad system

### Recent Changes (v0.3.2)
```sql
-- Added to conversations table
ALTER TABLE conversations 
ADD COLUMN initiated_by UUID REFERENCES users(id),
ADD COLUMN initiated_by_premium BOOLEAN DEFAULT false,
ADD COLUMN group_type VARCHAR(50) CHECK (group_type IN ('user_created', 'event', 'community'));
```

## 🎨 Design System

### Colors
- Primary: `purple-600` (#9333ea)
- Secondary: `pink-500` (#ec4899)  
- Accent: `cyan-600` (#0891b2)
- Dark mode by default

### UI Patterns
- Glass morphism effects
- Smooth Framer Motion animations
- Plan badges (Gold star, Diamond gem)
- Verification checkmarks
- Loading skeletons
- Toast notifications

### Component Architecture
- Modular structure with .context files
- Barrel exports (index.ts)
- TypeScript strict mode
- Accessibility (ARIA labels)

## 🔧 Technical Implementation

### State Management
- Zustand for global state
- SWR for data fetching and caching
- React Hook Form for forms
- Real-time updates via Supabase

### Key Hooks
```typescript
useAuth() - Authentication state
usePremiumFeatures() - Feature flags by plan
useMessagePermissions() - Chat restrictions
usePaywall() - Premium content gating
useRealtime() - WebSocket subscriptions
```

### API Structure
```
/api/auth/* - Authentication endpoints
/api/posts/* - Content CRUD
/api/messages/* - Chat system
/api/payments/* - Stripe/PIX integration
/api/users/* - Profile management
```

### Security
- Row Level Security (RLS) on all tables
- JWT authentication
- Rate limiting
- Input sanitization
- HTTPS only

## 📋 Current Tasks & Priorities

### Completed ✅
- Authentication system
- Post creation with media
- Real-time chat
- Payment integration (Stripe + PIX)
- Verification system
- Free user reply feature
- Group chat restrictions

### In Progress 🚧
- Stories feature (Diamond+)
- Video calls (WebRTC)
- Business profiles
- Ad system implementation
- Content moderation AI

### Pending 📝
- Live streaming
- Marketplace
- Mobile app (React Native)
- Advanced analytics
- International expansion

## 🚨 Important Considerations

### Content Policy
- Permissive adult content approach
- 18+ only platform
- Instant ban for minor-related content
- DMCA protection for creators

### Legal Compliance
- LGPD compliant
- Data retention policies
- Privacy by design
- Terms of service updated

### Performance
- Lazy loading routes
- Image optimization with next/image
- Virtual scrolling for long lists
- Caching strategies per user plan

### Testing
- Unit tests for utilities
- Integration tests for hooks
- E2E for critical user flows
- Manual QA before deploy

## 🔗 Key Integrations

### Payment Providers
- **Stripe**: International cards
- **AbacatePay**: Brazilian PIX

### Infrastructure
- **Supabase**: Database, auth, storage, realtime
- **Vercel**: Hosting and deployment
- **AWS S3**: Media storage (via Supabase)

### External APIs
- **IBGE**: Brazilian location data
- **WebRTC**: Voice/video calls
- **AI Moderation**: Content filtering

## 📞 Support Contacts

- **General**: contato@openlove.com.br
- **Legal**: juridico@openlove.com.br
- **WhatsApp**: (41) 99503-4442

## 🚀 Development Workflow

### Local Setup
```bash
# Clone repository
git clone [repo-url]

# Install dependencies
pnpm install

# Setup environment variables
cp .env.example .env.local

# Run migrations
pnpm supabase:migrate

# Start development
pnpm dev
```

### Deployment
- Push to main branch
- Vercel auto-deploys
- Preview deployments for PRs
- Environment variables in Vercel

### Code Standards
- TypeScript strict mode
- ESLint + Prettier
- Conventional commits
- PR reviews required
- No console.logs in production

## 💡 Context for Claude

When working on OpenLove:

1. **Always consider user plan restrictions** - Features vary significantly by plan
2. **Implement proper paywalls** - Use PremiumTooltip component for locked features
3. **Follow the modular structure** - Each feature should be self-contained
4. **Respect content policies** - Adult content is allowed but must be properly gated
5. **Test messaging flows** - Complex rules for who can message whom
6. **Use established patterns** - Check existing components before creating new ones
7. **Consider mobile UX** - Many users will be on phones
8. **Implement loading states** - Never show blank screens
9. **Handle errors gracefully** - Show user-friendly error messages
10. **Keep security in mind** - Validate on both client and server

### Common Patterns

#### Feature Gating
```typescript
const { canCreateStories } = usePremiumFeatures()
if (!canCreateStories) {
  return <PaywallModal feature="stories" requiredPlan="diamond" />
}
```

#### Message Permissions
```typescript
const { canSendMessage } = useMessagePermissions()
const canSend = canSendMessage(conversation)
```

#### Plan Badges
```tsx
<PlanBadge plan={user.premium_type} />
```

#### Verification Check
```typescript
if (requiresVerification && !user.is_verified) {
  return <VerificationPrompt />
}
```
# Convenções de Código - OpenLove

## TypeScript

### Tipos e Interfaces
```typescript
// ✅ Bom: Types para unions, Interfaces para objetos
type Status = 'active' | 'inactive' | 'pending';

interface User {
  id: string;
  name: string;
  status: Status;
}

// ❌ Evitar: any, tipos muito genéricos
const data: any = fetchData(); // Evitar
```

### Imports
```typescript
// Ordem: React → Next → Libs externas → Aliases → Relativos
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { formatDate } from './utils';
```

## React/Next.js

### Componentes
```typescript
// ✅ Bom: Componente funcional com tipos explícitos
interface PostCardProps {
  title: string;
  content: string;
  author: User;
}

export function PostCard({ title, content, author }: PostCardProps) {
  return (
    <article className="rounded-lg border p-4">
      <h2 className="text-xl font-bold">{title}</h2>
      <p className="mt-2">{content}</p>
      <span className="text-sm text-gray-500">por {author.name}</span>
    </article>
  );
}
```

### Hooks Customizados
```typescript
// Nome sempre com 'use' prefix
export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    // lógica
  }, []);
  
  return { user };
}
```

### Server Components vs Client Components
```typescript
// Server Component (padrão)
// app/posts/page.tsx
export default async function PostsPage() {
  const posts = await fetchPosts(); // OK em server component
  return <PostList posts={posts} />;
}

// Client Component (quando necessário)
// app/posts/components/post-form.tsx
'use client';

export function PostForm() {
  const [text, setText] = useState(''); // Precisa de 'use client'
  // ...
}
```

## Estilização (Tailwind CSS)

### Classes
```typescript
// ✅ Bom: Classes organizadas e legíveis
<div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md">

// ✅ Melhor: Usar cn() para classes condicionais
import { cn } from '@/lib/utils';

<div className={cn(
  "rounded-lg border p-4",
  isActive && "border-blue-500 bg-blue-50",
  isDisabled && "opacity-50 cursor-not-allowed"
)}>
```

## Estrutura de Arquivos

### Organização de Componentes
```
app/
└── posts/
    ├── page.tsx              # Página principal
    ├── layout.tsx            # Layout do módulo
    ├── components/           # Componentes locais
    │   ├── post-card.tsx
    │   ├── post-form.tsx
    │   └── post-list.tsx
    └── utils/               # Utilidades locais
        └── format-post.ts
```

### Naming
- Arquivos: kebab-case (`user-profile.tsx`)
- Componentes: PascalCase (`UserProfile`)
- Hooks: camelCase com 'use' (`useUserProfile`)
- Utils: camelCase (`formatUserName`)

## Banco de Dados (Supabase)

### Queries
```typescript
// ✅ Bom: Queries tipadas e com tratamento de erro
const { data, error } = await supabase
  .from('posts')
  .select('*, author:users(id, name, avatar_url)')
  .eq('is_public', true)
  .order('created_at', { ascending: false })
  .limit(10);

if (error) {
  console.error('Error fetching posts:', error);
  return [];
}

return data;
```

### Row Level Security (RLS)
```sql
-- Sempre usar RLS nas tabelas
CREATE POLICY "Users can view public posts" ON posts
  FOR SELECT USING (is_public = true);
```

## Error Handling

### Try-Catch Pattern
```typescript
export async function createPost(data: PostData) {
  try {
    const result = await supabase.from('posts').insert(data);
    if (result.error) throw result.error;
    return { success: true, data: result.data };
  } catch (error) {
    console.error('Failed to create post:', error);
    return { success: false, error: error.message };
  }
}
```

## Performance

### Imagens
```typescript
// ✅ Sempre usar next/image
import Image from 'next/image';

<Image
  src={avatarUrl}
  alt={`${userName} avatar`}
  width={40}
  height={40}
  className="rounded-full"
/>
```

### Lazy Loading
```typescript
// Para componentes pesados
const HeavyComponent = dynamic(() => import('./heavy-component'), {
  loading: () => <Skeleton />,
});
```

## Testes

### Naming
```typescript
// describe: o que está sendo testado
// it/test: o que deve fazer
describe('PostCard', () => {
  it('should display post title and content', () => {
    // teste
  });
  
  it('should show author name', () => {
    // teste
  });
});
```

## Git Commits

### Formato
```
tipo(escopo): descrição curta

Descrição detalhada se necessário

Fixes #123
```

### Tipos
- `feat`: nova funcionalidade
- `fix`: correção de bug
- `docs`: documentação
- `style`: formatação
- `refactor`: refatoração
- `test`: testes
- `chore`: tarefas gerais
---

**Remember**: OpenLove is a production system with real users and real money. Always test thoroughly and consider edge cases.