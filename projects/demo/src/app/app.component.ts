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
  <lib-interest-comparator [user1]="user1" [user2]="user2" [user3]="user3" [apiKey]="apiNinjasKey" (viewProfile)="onViewProfile($event)"/>`
  ,
})
export class AppComponent {
  user1: UserProfile = {
    name: 'Alex',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    interests: ['Pina Coladas', 'Subway', 'Japanese', 'Gardening', 'Baseball', 'Motocross', 'Bears', 'MMA', 'Biology', 'Masters Degree', 'and Rec Show', 'Tron']
  };

  user2: UserProfile = {
    name: 'Sarah',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    interests: ['Pizza', 'Volleyball', 'University', 'Sushi', 'Albany, NY', 'Reading', 'Cooking', 'Travel', 'Art', 'Dancing']
  };

  user3: UserProfile = {
    name: 'Mike',
    image: 'https://unsplash.com/photos/a-woman-in-a-purple-dress-holding-a-sword-214nvsyLzek',
    interests: ['Pina Coladas', 'Subway', 'Sushi', 'Reading', 'Movies', 'Gaming', 'Sports', 'Fitness', 'Technology']
  };

  apiNinjasKey = environment.apiNinjasKey;
  onViewProfile(event: { user: 'user1' | 'user2' }): void {
    console.log(`🔍 View Profile clicked for: ${event.user}`);
    console.log(`👤 User data:`, event.user === 'user1' ? this.user1 : this.user2);
  }


}
