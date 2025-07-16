# Social Media Integration Requirements - T22

## Overview

Replace the current photo upload functionality with live social media feeds from Instagram and Facebook. This will showcase real community content and encourage organic social media engagement.

## Technical Requirements

### Instagram Integration

#### Instagram Basic Display API
- **Purpose**: Display recent posts from users who use peña hashtags
- **Hashtags to Track**: `#BetisEscocia`, `#PeñaBéticaEscocesa`, `#PolwarthTavern`, `#BetisEdinburgh`
- **Content Types**: Photos, Videos, Stories (if available)
- **Refresh Rate**: Every 15 minutes for new content

#### Required Features
1. **Feed Component**: Display grid of recent Instagram posts
2. **Hashtag Filtering**: Show posts with specific peña hashtags
3. **Modal View**: Click to expand posts with full captions
4. **Direct Links**: "View on Instagram" for engagement
5. **Stories Integration**: Show active stories from community members

### Facebook Integration

#### Facebook Graph API
- **Purpose**: Display posts from official Peña Bética Escocesa Facebook page
- **Content Types**: Posts, Events, Photos, Videos
- **Refresh Rate**: Every 30 minutes for new content

#### Required Features
1. **Page Posts Feed**: Latest posts from the peña's Facebook page
2. **Events Integration**: Upcoming match viewing events
3. **Photo Albums**: Community photo albums from Facebook
4. **Engagement Stats**: Like/comment counts
5. **Event RSVP Integration**: Connect Facebook events with internal RSVP system

## Implementation Strategy

### Phase 1: Remove Photo Upload (T22.1)
1. Remove `PhotoUploadForm` component
2. Remove `/api/photos` endpoint
3. Update `galeria` page to remove upload functionality
4. Clean up photo-related types and data files

### Phase 2: Instagram Integration (T22.2)
1. Set up Instagram Basic Display API credentials
2. Create `InstagramFeed` component
3. Implement hashtag-based content fetching
4. Add Instagram Stories integration
5. Create responsive grid layout

### Phase 3: Facebook Integration (T22.3)
1. Set up Facebook Graph API credentials
2. Create `FacebookFeed` component
3. Implement page posts fetching
4. Add Facebook Events integration
5. Connect with existing RSVP system

### Phase 4: Enhanced UX (T22.4)
1. Create unified social media dashboard in `/redes-sociales`
2. Add follow buttons and QR codes
3. Create posting guidelines and optimal timing tips
4. Add social media contest features

### Phase 5: Transform Gallery (T22.5)
1. Convert `/galeria` to social media showcase
2. Combine Instagram and Facebook content
3. Add filtering and search capabilities
4. Create engagement and contest features

## API Configuration

### Environment Variables
```
INSTAGRAM_APP_ID=your_instagram_app_id
INSTAGRAM_APP_SECRET=your_instagram_app_secret
INSTAGRAM_ACCESS_TOKEN=your_long_lived_access_token

FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
FACEBOOK_PAGE_ACCESS_TOKEN=your_page_access_token
FACEBOOK_PAGE_ID=your_peña_page_id
```

### Rate Limiting
- Instagram: 200 calls per hour per user
- Facebook: 200 calls per hour per app per user
- Implement caching to minimize API calls
- Use webhooks for real-time updates where possible

## UI/UX Considerations

### Responsive Design
- Mobile-first approach for social media content
- Grid layouts that work on all screen sizes
- Touch-friendly interaction for mobile users

### Performance
- Lazy loading for images and videos
- Progressive loading of social media content
- Caching strategy for API responses
- Image optimization and resizing

### User Experience
- Clear visual hierarchy for different content types
- Easy navigation between Instagram and Facebook content
- Seamless integration with existing design system
- Accessibility considerations for screen readers

## Content Moderation

### Automatic Filtering
- Only show content from verified hashtags
- Filter out inappropriate content using keywords
- Implement basic spam detection

### Manual Oversight
- Admin panel for reviewing flagged content
- Ability to hide specific posts
- Community reporting features

## Analytics and Engagement

### Metrics to Track
- Social media content engagement
- Click-through rates to social platforms
- Most popular hashtags and content types
- Community growth on social platforms

### Community Building Features
- Highlight top contributors
- Create social media challenges
- Feature community content prominently
- Encourage cross-platform engagement

## Security Considerations

### API Security
- Secure storage of API tokens
- Regular token rotation
- Rate limiting on client side
- Input validation for all user inputs

### Privacy
- Respect user privacy settings
- Only display public content
- Clear attribution for all content
- Compliance with GDPR and data protection laws

## Success Metrics

1. **Engagement**: Increase in social media followers and interactions
2. **Content**: Regular flow of community-generated content
3. **Community**: More active participation in social platforms
4. **Events**: Better attendance at match viewing events
5. **Reach**: Broader awareness of the peña in Edinburgh's Spanish community

## Timeline

- **Week 1**: Remove photo upload functionality (T22.1)
- **Week 2-3**: Implement Instagram integration (T22.2)
- **Week 4-5**: Implement Facebook integration (T22.3)
- **Week 6**: Enhanced social media experience (T22.4)
- **Week 7**: Transform gallery page (T22.5)
- **Week 8**: Testing, optimization, and launch
