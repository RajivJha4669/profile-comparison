# Interest Comparator Library

A reusable Angular library component that compares two user profiles based on their interests and displays the results in a user-friendly way. The component uses AI-powered similarity analysis and face alignment to provide an enhanced user experience.

## Features

- **AI-Powered Interest Comparison**: Uses external APIs to calculate similarity between interests
- **Face Alignment**: Automatically aligns profile images eye-to-eye using face detection
- **Interactive UI**: Drag functionality for viewing more content when it doesn't fit on screen
- **Fallback Support**: Works gracefully when APIs are unavailable using local similarity calculation
- **Responsive Design**: Modern, mobile-friendly interface
- **High Test Coverage**: Comprehensive Jest tests with 80%+ coverage
- **TypeScript Support**: Fully typed with interfaces and models

## Installation

```bash
npm install interest-comparator
```

## Usage

### Basic Usage

```typescript
import { InterestComparatorComponent } from 'interest-comparator';

@Component({
  selector: 'app-example',
  template: `
    <lib-interest-comparator
      [user1]="user1"
      [user2]="user2"
      [user3]="user3"
      [apiKey]="apiKey"
      (viewProfile)="handleViewProfile()">
    </lib-interest-comparator>
  `,
  imports: [InterestComparatorComponent]
})
export class ExampleComponent {
  user1 = {
    name: 'John Doe',
    image: 'https://example.com/john.jpg',
    interests: ['Soccer', 'Music', 'Travel']
  };

  user2 = {
    name: 'Jane Smith',
    image: 'https://example.com/jane.jpg',
    interests: ['Volleyball', 'Biology', 'University']
  };

  user3 = {
    name: 'Bob Wilson',
    image: 'https://example.com/bob.jpg',
    interests: ['Pina Coladas', 'Subway', 'Sushi']
  };

  handleViewProfile() {
    console.log('View Profile clicked!');
  }
}
```

### Data Structure

```typescript
interface UserProfile {
  name: string;
  image: string;
  interests: string[];
}
```

## API Configuration

To use the full functionality, configure your API keys in the services:

### Similarity Service
- **API**: API Ninjas Text Similarity API
- **Endpoint**: `https://api.api-ninjas.com/v1/textsimilarity`
- **Key**: Set `apiKey` in `SimilarityService`

### Face Detection Service
- **API**: API Ninjas Face Detection API
- **Endpoint**: `https://api.api-ninjas.com/v1/facedetect`
- **Key**: Pass `apiKey` input to the component

### Fallback Behavior
The component works without APIs using local similarity calculation based on:
- Exact string matches
- Partial string matches
- Common word analysis

## Component Features

### Interest Ordering
- Interests are automatically ordered by similarity
- Similar interests are highlighted with visual indicators
- User3 interests are used for additional context (not displayed in UI)

### Image Handling
- Profile images are automatically aligned using face detection
- Fallback to original images if alignment fails
- Error handling for broken image URLs

### Interactive Elements
- Drag functionality for horizontal scrolling
- Visual feedback for similarity scores
- Loading states and error handling
- Responsive design for mobile devices

### Events
- `viewProfile`: Emitted when "View Profile" button is clicked

## Development

### Prerequisites
- Node.js 18+
- Angular CLI 19+

### Setup
```bash
git clone <repository-url>
cd interest-comparator
npm install
```

### Build Library
```bash
ng build interest-comparator
```

### Run Demo
```bash
ng serve demo
```

### Run Tests
```bash
ng test interest-comparator
```

### Build for Production
```bash
ng build interest-comparator --configuration production
```

## Testing

The library includes comprehensive Jest tests covering:
- Component initialization and lifecycle
- API integration and error handling
- Drag functionality
- Similarity calculations
- Image handling
- Template rendering

Run tests with:
```bash
ng test interest-comparator --watch=false --code-coverage
```

## Architecture

### Components
- `InterestComparatorComponent`: Main component with UI and logic

### Services
- `SimilarityService`: Handles interest similarity analysis
- `FaceAlignService`: Manages profile image alignment

### Models
- `UserProfile`: User data structure
- `Interest`: Interest item structure
- `SimilarityResult`: Similarity analysis results
- `FaceAlignmentResult`: Image alignment results

### Features
- Standalone component architecture
- Reactive programming with RxJS
- Error handling and fallbacks
- Responsive design
- Accessibility support

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

MIT License - see LICENSE file for details

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## Support

For issues and questions:
- Create an issue on GitHub
- Check the demo application for examples
- Review the test files for usage patterns
"# profile-comparison" 
