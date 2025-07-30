# Interest Comparator - Angular Library

A mobile-first Angular library for comparing user interests with AI-powered similarity analysis, featuring a pixel-perfect UI design and Swiper.js integration.

## Features

- **📱 Mobile-First Design**: Optimized for mobile screens with responsive layout
- **🎯 Smart Interest Ordering**: AI-powered similarity analysis using API Ninjas
- **✨ Shared Interest Detection**: Highlights common interests with glowing effects
- **🔄 Swiper.js Integration**: Horizontal swipe navigation for overflow content
- **🤖 Face Detection**: Profile image validation and face alignment
- **📊 Profile Actions**: Separate "View Profile" buttons with boolean outputs
- **🛡️ Error Handling**: Graceful fallback when APIs are unavailable
- **🧪 Comprehensive Testing**: 80%+ test coverage with Jest

## Installation

```bash
npm install interest-comparator
```

## Quick Start

### 1. Import the Component

```typescript
import { InterestComparatorComponent } from 'interest-comparator';
```

### 2. Add to Your Module

```typescript
import { InterestComparatorComponent } from 'interest-comparator';

@Component({
  // ... your component config
  imports: [InterestComparatorComponent]
})
```

### 3. Use in Template

```html
<lib-interest-comparator
  [user1]="user1"
  [user2]="user2"
  [user3]="user3"
  [apiKey]="apiKey"
  (viewProfile)="onViewProfile($event)">
</lib-interest-comparator>
```

## API Reference

### Inputs

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `user1` | `UserProfile` | Yes | First user's profile data |
| `user2` | `UserProfile` | Yes | Second user's profile data |
| `user3` | `UserProfile` | No | Third user's profile (viewer) |
| `apiKey` | `string` | No | API Ninjas key for AI features |

### Outputs

| Event | Type | Description |
|-------|------|-------------|
| `viewProfile` | `{user: 'user1' \| 'user2'}` | Emitted when "View Profile" is clicked |

### Data Models

```typescript
interface UserProfile {
  name: string;
  image: string;
  interests: string[];
}
```

## Configuration

### API Keys

To enable AI-powered features, get an API key from [API Ninjas](https://api-ninjas.com):

1. Sign up at https://api-ninjas.com
2. Get your API key
3. Pass it to the component:

```typescript
const apiKey = 'your-api-ninjas-key';
```

### Environment Setup

```typescript
// environment.ts
export const environment = {
  production: false,
  apiNinjasKey: 'your-api-ninjas-key'
};
```

## Features in Detail

### Smart Interest Ordering

The component uses AI to intelligently order interests based on:

1. **User 3 Influence**: Interests shared with the viewer appear higher
2. **Self-Similarity**: Related interests within a user are grouped together
3. **Cross-User Similarity**: Similar interests across users are aligned

### Shared Interest Detection

Interests with ≥0.8 similarity are:
- Displayed in the center with glowing effects
- Highlighted in both user lists
- Limited to 2 shared interests for optimal display

### Swiper.js Integration

- Horizontal swipe navigation
- Pagination indicators
- Touch-friendly interactions
- Responsive design

### Face Detection

- Validates profile images
- Detects faces using API Ninjas
- Future: Eye-to-eye alignment

## Design Specifications

The component follows the exact design from the specification:

- **60% Dark Top Section**: Contains user labels and swipe indicators
- **40% Profile Comparison**: Shows interests with blurred background faces
- **Neon Glow Effects**: Cyan and magenta glows for shared interests
- **Mobile Status Bar**: Shows time and system icons
- **Responsive Layout**: Optimized for 375px mobile screens

## Error Handling

The component gracefully handles:

- **API Failures**: Falls back to local similarity calculation
- **Invalid Images**: Continues without face detection
- **Network Issues**: Shows appropriate loading states
- **Missing Data**: Displays empty states

## Testing

Run the test suite:

```bash
npm test
```

### Test Coverage

- Component initialization
- API integration
- Error handling
- UI rendering
- User interactions
- Swiper functionality

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Dependencies

- Angular 19+
- Swiper.js 11+
- RxJS 7+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Create an issue on GitHub
- Check the documentation
- Review the test examples

## Demo

See the demo app in `projects/demo/` for a complete example of the component in action.
