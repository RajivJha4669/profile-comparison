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
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  // Sample user data for demonstration
  user1: UserProfile = {
    name: 'Alex',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
    interests: ['Gaming', 'Technology', 'Movies', 'Travel', 'Photography', 'Music']
  };

  user2: UserProfile = {
    name: 'Sarah',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
    interests: ['Reading', 'Gaming', 'Cooking', 'Travel', 'Art', 'Dancing']
  };

  user3: UserProfile = {
    name: 'Mike',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face',
    interests: ['Sports', 'Gaming', 'Music', 'Fitness', 'Technology', 'Movies']
  };

  apiKeyConfigured = false;
  faceDetectionStatus = false;
  apiNinjasKey = environment.apiNinjasKey;


  ngOnInit(){
  }

  onViewProfile(event: {user: 'user1' | 'user2'}): void {
    console.log(`🔍 View Profile clicked for: ${event.user}`);
  }

}
