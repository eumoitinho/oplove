# OpenLove Stories System - README

## Quick Start Guide

### For Developers

#### 1. Running Migrations
```bash
# Apply the Stories system migration
pnpm supabase db push
# or
pnpm supabase migration up
```

#### 2. Environment Variables
```env
# Add to .env.local
NEXT_PUBLIC_STORY_MAX_SIZE_MB=10
NEXT_PUBLIC_VIDEO_MAX_DURATION_SECONDS=15
NEXT_PUBLIC_STORY_DURATION_HOURS=24
```

#### 3. Testing Stories
```bash
# Run Stories tests
pnpm test stories

# Test with different user plans
pnpm test:e2e stories --plan=free
pnpm test:e2e stories --plan=gold
pnpm test:e2e stories --plan=diamond
```

### For Product Managers

#### Feature Rollout Phases

**Phase 1 - MVP (Current)**
- Basic story creation and viewing
- Daily limits enforcement
- View tracking
- Reactions

**Phase 2 - Monetization**
- Story boosts
- Profile seals
- Credit purchases
- Analytics dashboard

**Phase 3 - Advanced**
- Story highlights
- Templates and filters
- Music library
- Location tags

#### Success Metrics
- Daily Active Story Users (DASU)
- Story completion rate
- Boost conversion rate
- Credit revenue per user
- Story engagement rate

### For Designers

#### Design Assets Needed
1. **Icons**
   - Story ring gradient
   - Boost indicator
   - Reaction emojis
   - Profile seals (10 designs)

2. **Animations**
   - Story progress bar
   - Reaction animations
   - Boost sparkle effect
   - Loading states

3. **UI States**
   - Empty stories
   - Expired stories
   - Boost success
   - Credit purchase flow

### Common Issues & Solutions

#### "Daily limit reached"
**Cause**: User exceeded their plan's daily story limit
**Solution**: 
- Upgrade plan
- Wait until midnight (user timezone)
- Verify account for higher limits

#### "Story upload failed"
**Cause**: File too large or wrong format
**Solution**:
- Images: Max 10MB, JPG/PNG/WebP
- Videos: Max 100MB, MP4/WebM, 15 seconds
- Check internet connection

#### "Can't see stories"
**Cause**: Stories expired or user blocked
**Solution**:
- Stories last 24 hours (+ boost time)
- Check if user blocked you
- Refresh the page

#### "Credits not showing"
**Cause**: Payment processing or cache issue
**Solution**:
- Wait 1-2 minutes for processing
- Refresh the page
- Contact support if persists

### API Integration Examples

#### Creating a Story
```javascript
// Frontend example
const createStory = async (file, caption) => {
  // 1. Upload media
  const formData = new FormData()
  formData.append('file', file)
  formData.append('type', 'story')
  
  const uploadRes = await fetch('/api/v1/upload', {
    method: 'POST',
    body: formData
  })
  
  const { url } = await uploadRes.json()
  
  // 2. Create story
  const storyRes = await fetch('/api/v1/stories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mediaUrl: url,
      mediaType: file.type.startsWith('video/') ? 'video' : 'image',
      caption
    })
  })
  
  return storyRes.json()
}
```

#### Viewing Stories
```javascript
// Get stories feed
const getStories = async () => {
  const res = await fetch('/api/v1/stories?include=boosted,following')
  return res.json()
}

// Mark story as viewed
const viewStory = async (storyId) => {
  await fetch(`/api/v1/stories/${storyId}/view`, {
    method: 'POST'
  })
}
```

#### Boosting a Story
```javascript
const boostStory = async (storyId, duration) => {
  const credits = {
    6: 50,
    12: 90,
    24: 150
  }[duration]
  
  const res = await fetch(`/api/v1/stories/${storyId}/boost`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credits, duration })
  })
  
  return res.json()
}
```

### Database Maintenance

#### Cleanup Expired Stories
```sql
-- Run daily via cron job
SELECT cleanup_expired_stories();

-- Manual cleanup (older than 7 days)
UPDATE stories 
SET status = 'deleted', deleted_at = NOW()
WHERE status = 'expired' 
AND expires_at < NOW() - INTERVAL '7 days';
```

#### Reset Daily Limits
```sql
-- Automatic via trigger, but can force reset
UPDATE story_daily_limits
SET stories_posted_today = 0,
    last_reset_date = CURRENT_DATE
WHERE last_reset_date < CURRENT_DATE;
```

### Monitoring & Analytics

#### Key Queries
```sql
-- Daily story creation
SELECT DATE(created_at), COUNT(*)
FROM stories
GROUP BY DATE(created_at)
ORDER BY DATE(created_at) DESC;

-- Boost performance
SELECT 
  AVG(impressions_gained) as avg_impressions,
  AVG(clicks_gained) as avg_clicks,
  boost_duration_hours
FROM story_boosts
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY boost_duration_hours;

-- Credit revenue
SELECT 
  DATE(created_at),
  SUM(amount) as credits_purchased,
  COUNT(DISTINCT user_id) as unique_buyers
FROM user_credit_transactions
WHERE type = 'purchase'
GROUP BY DATE(created_at);
```

### Security Considerations

1. **Media Validation**
   - Scan for malicious content
   - Verify file types
   - Check EXIF data privacy
   - Limit file sizes

2. **Rate Limiting**
   - Story creation: Plan-based daily limits
   - API calls: 100/hour per user
   - View tracking: 1 per story per user
   - Reactions: 1 per story per user

3. **Privacy**
   - Stories are always public
   - View list visible to owner only
   - Replies are private messages
   - No screenshot detection

### Future Roadmap

#### Q1 2024
- [ ] Story highlights (permanent stories)
- [ ] Music library integration
- [ ] AR filters and effects
- [ ] Story analytics dashboard

#### Q2 2024
- [ ] Live stories (streaming)
- [ ] Story collections/albums
- [ ] Scheduled stories
- [ ] API v2 with GraphQL

#### Q3 2024
- [ ] AI-powered filters
- [ ] Voice narration
- [ ] Story monetization (tips)
- [ ] Brand partnerships

### Support Resources

- **Documentation**: `/doc/stories-system-documentation.md`
- **API Reference**: `/doc/api/stories-endpoints.md`
- **Slack Channel**: #stories-dev
- **JIRA Board**: STORY-*
- **Design Files**: Figma - OpenLove Stories
- **Analytics**: Mixpanel - Stories Dashboard

### Deployment Checklist

- [ ] Run database migrations
- [ ] Update environment variables
- [ ] Deploy API endpoints
- [ ] Deploy frontend components
- [ ] Clear CDN cache
- [ ] Update feature flags
- [ ] Monitor error rates
- [ ] Check credit transactions
- [ ] Verify daily limits
- [ ] Test boost functionality

---

**Last Updated**: January 2025
**Version**: 1.0.0
**Maintainers**: OpenLove Platform Team