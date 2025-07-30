# OpenLove Stories System Documentation

## Overview

The Stories system allows users to share ephemeral content (photos/videos) that disappear after 24 hours. It includes advanced features like boosts, reactions, replies, and gift seals.

## Features

### 1. Story Creation & Viewing
- **Media Support**: Images and videos (up to 15 seconds)
- **Captions**: Optional text overlay on stories
- **Duration**: 24 hours (can be extended with boosts)
- **Privacy**: Public stories visible to all users

### 2. User Interactions
- **Reactions**: 6 emoji reactions (like, love, fire, wow, sad, angry)
- **Replies**: Direct messages to story creators
- **View Tracking**: Story owners can see who viewed their stories

### 3. Boost System
- **Story Boosts**: Pay credits to increase visibility
  - 6 hours: 50 credits
  - 12 hours: 90 credits (recommended)
  - 24 hours: 150 credits
- **Benefits**:
  - Appear first in stories carousel
  - Special boost indicator
  - Extended duration beyond 24 hours
  - Analytics on impressions gained

### 4. Gift Seals System
- **Profile Seals**: Virtual gifts users can send to each other
- **10 Default Seals**: From 15 to 100 credits
- **Categories**: Romantic, Fun, Premium
- **Personal Messages**: Optional message with seal gift

### 5. Daily Posting Limits

| Plan | Unverified | Verified |
|------|------------|----------|
| Free | 0 stories/day | 3 stories/day |
| Gold | 5 stories/day | 10 stories/day |
| Diamond | 10 stories/day | Unlimited |
| Couple | 10 stories/day | Unlimited |

## Technical Architecture

### Database Schema

#### Core Tables
- `stories`: Main story content and metadata
- `story_views`: Track views and reactions
- `story_replies`: Direct messages to stories
- `story_daily_limits`: Enforce posting limits
- `story_boosts`: Boost purchases and performance

#### Credit System Tables
- `user_credits`: User credit balances
- `user_credit_transactions`: Transaction history
- `profile_seals`: Available seals catalog
- `user_profile_seals`: Gifted seals

#### Support Tables
- `trending_boosts`: Boost posts in feeds/explore

### API Endpoints

#### Stories Management
```
GET    /api/v1/stories              # List stories (with filters)
POST   /api/v1/stories              # Create new story
GET    /api/v1/stories/[id]         # Get specific story
DELETE /api/v1/stories/[id]         # Delete story
```

#### Story Interactions
```
POST   /api/v1/stories/[id]/view    # Mark as viewed
POST   /api/v1/stories/[id]/react   # Add reaction
POST   /api/v1/stories/[id]/reply   # Send reply
GET    /api/v1/stories/[id]/viewers # Get viewers (owner only)
POST   /api/v1/stories/[id]/boost   # Boost story
```

#### User Stories
```
GET    /api/v1/stories/me           # User's own stories
GET    /api/v1/stories/following    # Following users' stories
GET    /api/v1/stories/limits       # Daily posting limits
```

#### Credits & Seals
```
GET    /api/v1/credits/balance      # User credit balance
GET    /api/v1/seals                # Available seals
POST   /api/v1/seals/gift           # Gift a seal
```

### UI Components

#### StoriesCarousel
- Horizontal scrollable carousel
- Positioned below main header
- Sections: Add Story, Boosted, User's Own, Following
- Smart ordering with boosted stories first

#### StoryViewer
- Full-screen immersive viewer
- Progress bars for multiple stories
- Touch/click navigation
- Reaction picker
- Reply functionality
- Viewer list (for story owners)

#### StoryCreator
- Media upload (images/videos)
- Preview before posting
- Caption addition
- Daily limit enforcement

#### StoryBoostModal
- Boost package selection
- Credit balance display
- Estimated reach metrics
- Benefits explanation

#### ProfileSealsModal
- Seal catalog with categories
- Search and filter
- Personal message input
- Credit cost display

## Business Logic

### Posting Rules
1. Only verified free users can post stories
2. Daily limits reset at midnight (user's timezone)
3. Limits enforced by database triggers
4. Failed posts don't count against limit

### Boost Rules
1. Only story owner can boost
2. One boost per story
3. Boosts can't be cancelled
4. Credits deducted immediately

### Credit System
1. Credits purchased in packages
2. Non-refundable once spent
3. Used for: story boosts, profile seals, trending boosts
4. Transaction history maintained

### View Tracking
1. Each user can view a story once
2. Views counted in real-time
3. Anonymous views not supported
4. Story owner sees viewer list

## Security

### Row Level Security (RLS)
- Users can only create/delete own stories
- View permissions for active stories only
- Owner-only access to viewer lists
- Credit transactions visible to owner only

### Input Validation
- Media file size limits (10MB images, 100MB videos)
- Caption length limit (200 characters)
- Valid media types only
- Credit balance verification

### Privacy
- No private stories (all public)
- Expired stories soft-deleted
- View history retained
- Reply messages private

## Performance Optimizations

### Indexes
- User + status + expiry for active stories
- Boost status for prioritization
- Creation date for ordering
- Viewer lookups optimized

### Caching Strategy
- Stories list cached with SWR
- User credits cached locally
- Seal catalog cached
- Real-time updates via websockets

### Media Handling
- Thumbnails for videos
- Progressive image loading
- CDN distribution
- Automatic compression

## Admin Features

### Analytics
- Total stories created
- Boost conversion rates
- Credit revenue tracking
- User engagement metrics

### Moderation
- Content flagging system
- Automatic expiry cleanup
- Manual story removal
- User story limits override

### Financial
- Credit package management
- Transaction reporting
- Revenue analytics
- Refund processing

## Integration Points

### With Feed System
- Stories carousel in main feed
- Below header, above posts
- Sticky positioning
- Mobile responsive

### With User System  
- Profile seal display
- Verification status
- Premium plan features
- Daily limit enforcement

### With Payment System
- Credit purchases
- Stripe/PIX integration
- Transaction recording
- Balance management

## Future Enhancements

### Planned Features
1. Story highlights (permanent stories)
2. Story templates and filters
3. Music/audio additions
4. Location tags
5. Mention/tag users
6. Story analytics for creators
7. Scheduled stories
8. Story collections/albums

### Technical Improvements
1. WebRTC for live stories
2. AI content moderation
3. Advanced compression
4. Offline story creation
5. Background uploads
6. P2P content delivery

## Troubleshooting

### Common Issues

#### "Daily limit reached"
- Check user's plan and verification
- Verify limit reset timing
- Check story_daily_limits table

#### "Insufficient credits"
- Verify credit balance
- Check pending transactions
- Review transaction history

#### "Story expired"
- Stories expire after 24h + boost time
- Check expires_at timestamp
- Soft-deleted stories retained

#### "Can't view story"
- Check story status (active)
- Verify expiry time
- Check user permissions

## API Usage Examples

### Create Story
```javascript
const formData = new FormData()
formData.append('file', mediaFile)
formData.append('type', 'story')

// Upload media
const uploadRes = await fetch('/api/v1/upload', {
  method: 'POST',
  body: formData
})
const { url } = await uploadRes.json()

// Create story
const story = await fetch('/api/v1/stories', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    mediaUrl: url,
    mediaType: 'image',
    caption: 'Hello OpenLove!'
  })
})
```

### Boost Story
```javascript
await fetch(`/api/v1/stories/${storyId}/boost`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    credits: 90,
    duration: 12
  })
})
```

### Gift Seal
```javascript
await fetch('/api/v1/seals/gift', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    recipientId: userId,
    sealId: sealId,
    message: 'You're amazing!'
  })
})
```