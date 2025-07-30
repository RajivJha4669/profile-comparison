import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  InterestComparatorComponent,
  UserProfile,
  FaceDetectService
} from 'interest-comparator';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    InterestComparatorComponent
  ],
  template: `
    <div class="demo-container">
      <header class="demo-header">
        <h1>Interest Comparator Demo</h1>
        <div class="api-status">
          <span class="status-indicator" [class.active]="apiKeyConfigured">API Key: {{ apiKeyConfigured ? 'Configured' : 'Missing' }}</span>
          <span class="status-indicator" [class.active]="faceDetectionStatus">Face Detection: {{ faceDetectionStatus ? 'Working' : 'Failed' }}</span>
        </div>
      </header>

      <main class="demo-content">
        <lib-interest-comparator
          [user1]="user1"
          [user2]="user2"
          [user3]="user3"
          [apiKey]="apiNinjasKey"
          (viewProfile)="onViewProfile($event)">
        </lib-interest-comparator>
      </main>

      <footer class="demo-footer">
        <p>This demo shows the Interest Comparator component with real API integration.</p>
        <p>Check the browser console for detailed API call logs.</p>
      </footer>
    </div>
  `,
  styles: [`
    .demo-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      flex-direction: column;
    }

    .demo-header {
      background: rgba(255, 255, 255, 0.1);
      padding: 20px;
      text-align: center;
      color: white;
    }

    .demo-header h1 {
      margin: 0 0 16px 0;
      font-size: 24px;
      font-weight: 600;
    }

    .api-status {
      display: flex;
      justify-content: center;
      gap: 20px;
    }

    .status-indicator {
      padding: 8px 16px;
      border-radius: 20px;
      background: rgba(255, 255, 255, 0.2);
      font-size: 14px;
      font-weight: 500;
    }

    .status-indicator.active {
      background: rgba(76, 175, 80, 0.8);
    }

    .demo-content {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
    }

    .demo-footer {
      background: rgba(0, 0, 0, 0.1);
      padding: 16px;
      text-align: center;
      color: white;
      font-size: 14px;
    }

    .demo-footer p {
      margin: 4px 0;
    }
  `]
})
export class AppComponent implements OnInit {
  // Sample user data for demonstration
  user1: UserProfile = {
    name: 'Alex',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    interests: ['Pina Coladas', 'Subway', 'Japanese', 'Gardening', 'Baseball', 'Motocross', 'Bears', 'MMA', 'Biology', 'Masters Degree', 'and Rec Show', 'Tron']
  };

  user2: UserProfile = {
    name: 'Sarah',
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    interests: ['Pizza', 'Volleyball', 'University', 'Sushi', 'Albany, NY', 'Reading', 'Cooking', 'Travel', 'Art', 'Dancing']
  };

  user3: UserProfile = {
    name: 'Mike',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    interests: ['Pina Coladas', 'Subway', 'Sushi', 'Reading', 'Movies', 'Gaming', 'Sports', 'Fitness', 'Technology']
  };

  apiKeyConfigured = false;
  faceDetectionStatus = false;
  apiNinjasKey = environment.apiNinjasKey;

  constructor(private faceDetectService: FaceDetectService) {}

  ngOnInit(): void {
    console.log('🚀 Demo App Initializing...');
    this.initializeServices();
  }

  onViewProfile(event: {user: 'user1' | 'user2'}): void {
    console.log(`🔍 View Profile clicked for: ${event.user}`);
    console.log(`👤 User data:`, event.user === 'user1' ? this.user1 : this.user2);

    // This would typically trigger navigation in a real app
    // For demo purposes, we just log the event
  }

  private async initializeServices(): Promise<void> {
    // Check API key configuration
    this.apiKeyConfigured = this.isApiKeyValid();

    if (this.apiKeyConfigured) {
      console.log('✅ API key configured, testing services...');
      await this.testFaceDetectionAPI();
    } else {
      console.log('⚠️ API key not configured, using fallback mode');
    }
  }

  private isApiKeyValid(): boolean {
    return !!(environment.apiNinjasKey &&
             environment.apiNinjasKey.length > 10 &&
             environment.apiNinjasKey !== 'your-api-key-here');
  }

  private async testFaceDetectionAPI(): Promise<void> {
    try {
      console.log('🧪 Testing face detection API...');

      // Get API status first
      const apiStatus = this.faceDetectService.getApiStatus();
      console.log('📊 API Status:', apiStatus);

      if (!apiStatus.available || !apiStatus.hasKey) {
        console.log('❌ Face detection API not available');
        this.faceDetectionStatus = false;
        return;
      }

      // Test with a sample image
      const testImageUrl = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face';
      const result = await this.faceDetectService.detectFacesFromUrl(testImageUrl);

      if (result.success && result.faces && result.faces.length > 0) {
        console.log('✅ Face detection API is working!', result);
        this.faceDetectionStatus = true;
      } else {
        console.log('❌ Face detection API test failed:', result);
        this.faceDetectionStatus = false;
      }
    } catch (error) {
      console.error('❌ Face detection API error:', error);
      this.faceDetectionStatus = false;
    }
  }
}
