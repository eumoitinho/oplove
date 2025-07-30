# CLAUDE.md - OpenLove Project Context

## 🎯 Project Overview

OpenLove is a modern social network focused on authentic connections and meaningful relationships. Currently in version 0.3.3-alpha, it's a fully functional platform comparable to major social networks with a focus on adult content monetization and premium features.

### Key Information
- **Tech Stack**: Next.js 15, React 19, TypeScript, Supabase, Tailwind CSS, Redis Upstash
- **Status**: Production-ready MVP with real payment processing
- **Monetization**: Subscription plans + content sales + credits system with commission model
- **Target**: Brazilian market initially, Portuguese language
- **Cache**: Advanced Redis caching with SWR, compression, analytics, and auto-invalidation
- **Latest Feature**: Stories system with boosts and gift seals (v0.3.3)

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
│   ├── /stories          # Stories system (new)
│   ├── /premium          # Paywall and subscriptions
│   ├── /business         # Business profiles
│   └── /common           # Shared components
├── /hooks                # Custom React hooks
├── /lib                  # Core libraries
│   ├── /cache           # Redis caching layer
│   ├── /services        # Business logic services
│   ├── /stores         # Zustand state management
│   └── /utils          # Helper utilities
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
- Can post 3 stories/day (only if verified)

#### Gold Plan (R$25/month)
- 10 messages/day (unverified), unlimited (verified)
- Up to 5 images per post
- Can create events (3/month unverified, unlimited verified)
- Can join up to 5 communities
- Cannot create group chats
- Sees ads every 10 posts
- Can post 5 stories/day (10 if verified)
- Cannot boost stories

#### Diamond Plan (R$45/month)
- Unlimited everything
- Can create group chats (50 members max)
- Voice/video calls
- 24h Stories (10/day unverified, unlimited verified)
- Can boost stories and profiles
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
- `stories` - ephemeral content system (new)
- `story_views` - view and reaction tracking (new)
- `user_credits` - credit balance management (new)
- `profile_seals` - gift seals catalog (new)

### Recent Changes

#### v0.3.3 - Stories System
- Stories with 24h expiration
- Daily posting limits by plan
- Story boosts with credits
- Profile seal gifts
- Reactions and replies
- View tracking

#### v0.3.2 - Messaging Update
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
useUserCredits() - Credit balance management (new)
```

### API Structure
```
/api/auth/* - Authentication endpoints
/api/posts/* - Content CRUD
/api/messages/* - Chat system
/api/payments/* - Stripe/PIX integration
/api/users/* - Profile management
/api/stories/* - Stories system (new)
/api/credits/* - Credits management (new)
/api/seals/* - Profile seals (new)
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
- Stories system with boosts (v0.3.3)
- Credits system and gift seals (v0.3.3)

### In Progress 🚧
- Video calls (WebRTC)
- Business profiles
- Ad system implementation
- Content moderation AI
- Stories analytics dashboard

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

## 🛡️ Sistema de Verificação de Identidade

OpenLove implementa um sistema completo de verificação de identidade com tecnologia de ponta para máxima segurança e prevenção de fraudes.

### Arquitetura do Sistema

#### Componentes Principais
- **VerificationForm**: Fluxo principal com múltiplas etapas de verificação
- **DocumentUpload**: Upload e validação de documentos oficiais (RG, CNH, Passaporte)
- **FaceScanCapture**: Captura facial 3D usando MediaPipe/FaceDetector API
- **LivenessDetection**: Detecção de vida real com desafios anti-spoofing
- **API Processing**: Processamento assíncrono com validação automática

#### Fluxo de Verificação

```typescript
// 1. Coleta de dados pessoais
interface PersonalData {
  fullName: string
  cpf: string
  birthDate: string
  documentType: 'rg' | 'cnh' | 'passport'
  documentNumber: string
}

// 2. Upload de documentos
- Frente do documento (obrigatório)
- Verso do documento (se aplicável)
- Validação automática via AI/OCR
- Detecção de adulteração

// 3. FaceScan 3D
- Captura de múltiplos ângulos faciais
- Análise de geometria facial única
- Geração de template biométrico
- Detecção de características distintivas

// 4. Liveness Detection
- Piscar olhos (2x)
- Sorrir naturalmente
- Virar cabeça (esquerda/direita)
- Balançar cabeça (cima/baixo)
- Análise de movimento natural
```

### Tecnologias Utilizadas

#### Face Detection APIs
```typescript
// 1. Browser Native FaceDetector (preferencial)
if ('FaceDetector' in window) {
  const detector = new FaceDetector({
    fastMode: false,
    maxDetectedFaces: 1
  })
}

// 2. MediaPipe (fallback)
import { FaceDetection } from '@mediapipe/face_detection'
const faceDetection = new FaceDetection({
  model: 'full',
  minDetectionConfidence: 0.5
})
```

#### Liveness Challenges
```typescript
interface LivenessChallenge {
  type: "blink" | "smile" | "turn_left" | "turn_right" | "nod"
  instruction: string
  duration: number
  completed: boolean
}

// Pontuação automática
const livenessScore = (completedChallenges / totalChallenges) * 100
```

### Estrutura do Banco de Dados

#### Tabela user_verifications
```sql
CREATE TABLE user_verifications (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  
  -- Dados pessoais
  full_name TEXT NOT NULL,
  cpf TEXT NOT NULL,
  birth_date DATE NOT NULL,
  
  -- Documento
  document_type TEXT CHECK (document_type IN ('rg', 'cnh', 'passport')),
  document_number TEXT NOT NULL,
  
  -- Arquivos no Storage
  document_front_url TEXT NOT NULL,
  document_back_url TEXT,
  selfie_url TEXT NOT NULL,
  
  -- Dados biométricos (JSON)
  face_scan_data JSONB,
  
  -- Status e resultado
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'manual_review')),
  verification_score DECIMAL(5,2) DEFAULT 0.00,
  
  -- Review
  reviewed_by UUID REFERENCES users(id),
  reviewer_notes TEXT,
  
  -- Timestamps
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Storage Bucket
```sql
-- Bucket para documentos de verificação
INSERT INTO storage.buckets (id, name, public) 
VALUES ('verification-documents', 'verification-documents', false);

-- Políticas RLS para segurança
CREATE POLICY "Users can upload own verification documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'verification-documents' 
    AND auth.uid()::text = (storage.foldername(name))[2]
  );
```

### API Endpoints

#### POST /api/v1/verification/submit
```typescript
// Payload
interface VerificationSubmission {
  fullName: string
  cpf: string
  birthDate: string
  documentType: string
  documentNumber: string
  documentFront: File
  documentBack?: File
  selfiePhoto: File
  faceScanData: string // JSON serialized
}

// Response
interface VerificationResponse {
  success: boolean
  message: string
  data: {
    verificationId: string
    status: 'pending'
    expectedReviewTime: '48 horas'
  }
}
```

### Processamento Automático

#### Background Processing
```typescript
async function processVerificationAsync(verificationId: string) {
  // 1. Validação de documentos (AWS Textract, Google Vision)
  // 2. Comparação facial (selfie vs documento)
  // 3. Verificação de autenticidade
  // 4. Consulta em bases de fraude
  
  // Simulação: 80% aprovação automática
  const isApproved = Math.random() > 0.2
  const score = isApproved ? 85 + Math.random() * 10 : 45 + Math.random() * 20
  
  // Atualização automática após 30 segundos
  setTimeout(async () => {
    await updateVerificationStatus(verificationId, {
      status: isApproved ? 'approved' : 'manual_review',
      verification_score: score,
      reviewed_at: new Date().toISOString()
    })
  }, 30000)
}
```

### Segurança e Prevenção de Fraude

#### Anti-Spoofing Measures
- **Liveness Detection**: Detecta tentativas com fotos/vídeos
- **3D Face Analysis**: Análise de profundidade facial
- **Movement Validation**: Validação de movimentos naturais
- **Quality Assessment**: Análise de qualidade de imagem
- **Temporal Analysis**: Verificação de consistência temporal

#### Data Protection
- **Criptografia**: Todos os dados sensíveis criptografados
- **RLS Policies**: Row Level Security em todas as tabelas
- **Access Control**: Usuários só acessam próprios dados
- **Admin Separation**: Políticas separadas para administradores
- **Audit Trail**: Log completo de todas as ações

### Integração na Interface

#### Acesso ao Sistema
```typescript
// Sidebar navigation
const userMenuItems = [
  { icon: User, label: "Meu Perfil", view: "user-profile" },
  { icon: Shield, label: "Verificação", view: "verification" }, // ← Novo
  { icon: Settings, label: "Configurações", view: "settings" }
]

// Timeline routing
case "verification":
  return <VerificationForm />
```

#### Status Indicators
```typescript
// User profile badge
{user?.is_verified && (
  <div className="w-2 h-2 bg-green-500 rounded-full" />
)}

// Plan benefits
- Gold: Recursos completos após verificação
- Diamond: Prioridade na fila de verificação
- Free: Verificação disponível mas limitada
```

### Configurações e Customização

#### Environment Variables
```bash
# Feature flags
VERIFICATION_ENABLED=true
FACESCAN_3D_ENABLED=true
LIVENESS_DETECTION_ENABLED=true

# Processing
VERIFICATION_AUTO_APPROVAL_THRESHOLD=80
VERIFICATION_PROCESSING_DELAY=30000
VERIFICATION_MAX_RETRIES=3

# Storage
VERIFICATION_STORAGE_BUCKET=verification-documents
VERIFICATION_MAX_FILE_SIZE=10485760 # 10MB
```

#### Customization Options
```typescript
// Challenges configuration
const challengeConfig = {
  enabledChallenges: ['blink', 'smile', 'turn_left', 'turn_right'],
  challengeDuration: 3000,
  minCompletionRate: 0.8,
  retryLimit: 2
}

// Document validation
const documentConfig = {
  supportedTypes: ['rg', 'cnh', 'passport'],
  maxFileSize: 10 * 1024 * 1024, // 10MB  
  requiredQuality: 0.8,
  ocrValidation: true
}
```

### Compliance e Regulamentações

#### LGPD Compliance
- Consentimento explícito para coleta de dados biométricos
- Direito ao esquecimento (exclusão de dados)
- Portabilidade de dados
- Minimização de dados coletados
- Transparência no processamento

#### Retention Policies
```typescript
// Retenção de dados
const retentionPolicy = {
  approvedVerifications: '2 years',
  rejectedVerifications: '1 year', 
  biometricData: '1 year after account deletion',
  documentImages: 'Deleted after approval/rejection',
  auditLogs: '5 years'
}
```

## 🚀 Advanced Cache System

OpenLove implements a comprehensive Redis-based caching system for optimal performance and bandwidth efficiency.

### Cache Architecture

#### Core Services
- **CacheService**: Basic Redis operations with analytics tracking
- **TimelineCacheService**: Timeline-specific caching with different TTLs per tab
- **ProfileCacheService**: User profile and recommendation caching
- **CacheInvalidationService**: Distributed cache invalidation with event-driven approach
- **CacheFallbackService**: Circuit breaker pattern for resilience
- **StaleWhileRevalidateService**: Background refresh for fresh data
- **CacheCompressionService**: Automatic compression for large datasets
- **CachePrewarmingService**: Proactive cache warming for new users
- **CacheAnalyticsService**: Performance monitoring and health scoring

#### Cache Keys Structure
```typescript
// Timeline caches
timeline:${userId}:${tab}:${page} // TTL: 5-15min depending on tab
feed_algo:${userId}             // TTL: 12 hours

// User data
user:${userId}                  // TTL: 30 minutes
user_stats:${userId}           // TTL: 15 minutes
followers:${userId}            // TTL: 1 hour
following:${userId}            // TTL: 1 hour

// Content
post:${postId}                 // TTL: varies
post_comments:${postId}:${page} // TTL: 3 minutes
trending_posts                 // TTL: 5 minutes
```

#### TTL Strategy
- **Timeline feeds**: 5min (for-you), 10min (following), 15min (explore)
- **User profiles**: 30 minutes
- **Recommendations**: 20 minutes
- **Trending content**: 5 minutes
- **Statistics**: 15 minutes

### Advanced Features

#### 1. Stale-While-Revalidate
```typescript
import { useSWR } from '@/lib/cache'

const result = await useSWR({
  key: 'timeline:user123:for-you:1',
  fetcher: () => fetchTimelineFeed(userId, 1),
  config: {
    ttl: 300,           // 5 minutes fresh
    staleTime: 600,     // 10 minutes stale
    revalidateInBackground: true
  }
})

// Returns immediately with stale data, refreshes in background
```

#### 2. Automatic Compression
```typescript
import { setCompressed, getCompressed } from '@/lib/cache'

// Automatically compresses if data > 1KB
await setCompressed('large-timeline', timelineData, 300)
const data = await getCompressed('large-timeline')
```

#### 3. Cache Pre-warming
```typescript
import { prewarmNewUser } from '@/lib/cache'

// Automatically called on user registration
const jobId = await prewarmNewUser(userId)

// Pre-warms:
// - User profile and preferences
// - Timeline feeds (for-you, explore)
// - Recommendations and trending content
```

#### 4. Smart Invalidation
```typescript
import { invalidateUser, invalidatePost } from '@/lib/cache'

// Post creation invalidates multiple caches
await invalidatePost(postId, userId)
// Invalidates:
// - Author's timeline
// - Followers' timelines  
// - Explore feeds
// - Post counts
```

#### 5. Circuit Breaker Pattern
```typescript
import { cacheWithFallback } from '@/lib/cache'

const result = await cacheWithFallback({
  key: 'user:123',
  fetcher: () => fetchUserProfile(userId),
  fallbackData: defaultUserProfile,
  ttl: 1800
})

// Automatically opens circuit on failures
// Uses fallback data when circuit is open
```

### Performance Monitoring

#### Cache Health Score
- **Hit Rate**: Target >70%
- **Response Time**: Target <500ms
- **Error Rate**: Target <5%
- **Overall Score**: 0-100

#### Real-time Analytics
```typescript
import { cacheAnalyticsService } from '@/lib/cache'

const health = cacheAnalyticsService.getCacheHealthScore()
const stats = cacheAnalyticsService.getRealTimeStats()
const recommendations = cacheAnalyticsService.getRecommendations()
```

#### API Endpoints
- `GET /api/cache/stats` - Cache statistics and health
- `GET /api/cache/manage?action=health` - Health report
- `POST /api/cache/manage?action=invalidate` - Manual invalidation
- `POST /api/cache/manage?action=prewarm-user` - Manual pre-warming

### Usage Patterns

#### Timeline Feeds
```typescript
import { TimelineCacheService } from '@/lib/cache'

// Cached with different TTLs per tab
const feed = await TimelineCacheService.getTimelineFeed(userId, 'for-you', 1)

// Prefetches next page in background
if (page === 1) {
  TimelineCacheService.prefetchNextPage(userId, 'for-you', 1, fetchFunction)
}
```

#### User Profiles
```typescript
import { ProfileCacheService } from '@/lib/cache'

// Caches user data with batch loading
const users = await ProfileCacheService.getMultipleProfiles(userIds)

// Warms cache for recommendations
await ProfileCacheService.warmRecommendations(userId)
```

#### Rate Limiting
```typescript
import { CacheService } from '@/lib/cache'

const { allowed, remaining } = await CacheService.checkRateLimit(
  `api:${userId}`, 
  100,    // 100 requests
  3600    // per hour
)
```

### Cache Warming Strategy

1. **New User Registration**:
   - Profile and preferences
   - Default timeline feeds
   - Trending content
   - Recommendations

2. **Premium Users**:
   - Priority warming queue
   - Extended TTLs
   - Predictive prefetching

3. **Popular Content**:
   - Trending posts and topics
   - Viral content detection
   - Global cache warming

### Bandwidth Optimization

- **Compression**: Automatic for payloads >1KB
- **Compression Ratios**: Average 60-70% reduction
- **Smart TTLs**: Longer for stable data, shorter for dynamic
- **Prefetching**: Background loading of likely-needed data
- **Batch Operations**: Bulk cache operations for efficiency

### Cache Invalidation Events

```typescript
// User actions trigger smart invalidation
'user_updated'      → Profile + timeline caches
'post_created'      → Author + followers' timelines
'post_liked'        → Post details only (lightweight)
'user_followed'     → Both users' timelines + recommendations
'subscription_changed' → User profile + premium content
```

### Configuration

```typescript
// Environment variables
UPSTASH_REDIS_REST_URL=your-upstash-redis-rest-url
UPSTASH_REDIS_REST_TOKEN=your-upstash-redis-rest-token

// Enable/disable features
CACHE_COMPRESSION_ENABLED=true
CACHE_PREWARMING_ENABLED=true
CACHE_ANALYTICS_ENABLED=true
```

### Best Practices

1. **Always use cache for timeline feeds** - Major bandwidth savings
2. **Invalidate sparingly** - Use event-driven invalidation
3. **Monitor health scores** - Aim for >80 health score
4. **Use SWR for critical paths** - Provides instant responses
5. **Compress large datasets** - Reduces bandwidth costs
6. **Warm caches proactively** - Better user experience

## 📸 Stories System (v0.3.3)

OpenLove Stories is an ephemeral content system similar to Instagram/WhatsApp Stories, with advanced monetization features.

### Story Features

#### Basic Features
- **24-hour ephemeral content** - Photos/videos that disappear
- **Horizontal carousel** - Below main header, above feed
- **Full-screen viewer** - Immersive viewing experience
- **Progress indicators** - Shows story progression
- **Reactions** - 6 emoji options (like, love, fire, wow, sad, angry)
- **Direct replies** - Send private messages to story creators
- **View tracking** - See who viewed your stories

#### Advanced Features
- **Story Boosts** - Pay credits to increase visibility
- **Profile Seals** - Gift virtual badges to users
- **Daily limits** - Based on plan and verification
- **Boost analytics** - Track impressions and engagement

### Daily Story Limits

| Plan | Unverified | Verified |
|------|------------|----------|
| Free | 0/day | 3/day |
| Gold | 5/day | 10/day |
| Diamond | 10/day | Unlimited |
| Couple | 10/day | Unlimited |

### Credits System

#### Credit Uses
1. **Story Boosts**
   - 6 hours: 50 credits
   - 12 hours: 90 credits (recommended)
   - 24 hours: 150 credits

2. **Profile Seals** (15-100 credits)
   - Coração de Ouro: 50 credits
   - Diamante: 100 credits
   - Rosa: 15 credits
   - And 7 more options...

3. **Trending Boosts**
   - Feed boost: Variable pricing
   - Explore page: Variable pricing
   - OpenDate boost: Variable pricing

#### Credit Packages
```typescript
// Example packages (configured in admin)
{ credits: 100, price: 'R$ 10,00' }
{ credits: 500, price: 'R$ 45,00' } // 10% bonus
{ credits: 1000, price: 'R$ 80,00' } // 25% bonus
```

### Implementation

#### Key Components
```typescript
// Stories carousel on feed
import { StoriesCarousel } from '@/components/stories'
<StoriesCarousel className="sticky top-16 z-40" />

// Story viewer modal
import { StoryViewer } from '@/components/stories'
<StoryViewer 
  stories={stories} 
  onClose={() => setViewerOpen(false)} 
/>

// Story creation
import { StoryCreator } from '@/components/stories'
<StoryCreator onSuccess={handleStoryCreated} />
```

#### API Endpoints
```typescript
// Stories CRUD
GET    /api/v1/stories              // List stories
POST   /api/v1/stories              // Create story
DELETE /api/v1/stories/[id]         // Delete story

// Interactions
POST   /api/v1/stories/[id]/view    // Mark viewed
POST   /api/v1/stories/[id]/react   // Add reaction
POST   /api/v1/stories/[id]/reply   // Send reply
POST   /api/v1/stories/[id]/boost   // Boost story

// Credits
GET    /api/v1/credits/balance      // Get balance
POST   /api/v1/seals/gift           // Gift seal
```

#### Database Tables
- `stories` - Main story content
- `story_views` - Views and reactions
- `story_replies` - Direct messages
- `story_daily_limits` - Posting limits
- `story_boosts` - Boost purchases
- `user_credits` - Credit balances
- `user_credit_transactions` - Transaction history
- `profile_seals` - Available seals
- `user_profile_seals` - Gifted seals

### Business Rules

#### Posting Rules
1. Only verified free users can post
2. Limits reset at midnight user timezone
3. Failed posts don't count against limit
4. Limits enforced by database triggers

#### Boost Rules
1. Only story owner can boost
2. One active boost per story
3. Credits deducted immediately
4. Boosts can't be cancelled

#### View Tracking
1. Each user views once per story
2. Real-time view count updates
3. Story owner sees full viewer list
4. Anonymous viewing not supported

### UI/UX Guidelines

#### Story Creation Flow
1. Click "+" button in carousel
2. Select/capture media
3. Add optional caption
4. Preview and post
5. Show success with view count

#### Viewer Experience
1. Tap to advance, hold to pause
2. Swipe up for reactions
3. Swipe left/right for navigation
4. Auto-advance after duration
5. Close on swipe down

#### Boost Purchase Flow
1. Click boost button on own story
2. Select boost duration
3. Show estimated reach
4. Confirm with credit balance
5. Track performance in real-time

### Performance Considerations

#### Caching Strategy
```typescript
// Story feeds cached with SWR
stories:${userId}:following    // TTL: 5 minutes
stories:boosted               // TTL: 2 minutes
story:${storyId}              // TTL: Until expiry
```

#### Media Optimization
- Auto-compress images >1MB
- Generate video thumbnails
- Progressive loading
- CDN distribution
- Lazy load off-screen stories

#### Real-time Updates
- WebSocket for view counts
- Optimistic UI updates
- Background sync
- Offline story queue
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