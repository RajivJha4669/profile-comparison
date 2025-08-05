import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  InterestComparatorComponent,
  UserProfile
} from 'interest-comparator';
import { MockInterestComparatorComponent } from './components/mock-interest-comparator.component';
import { MockDataService, DemoScenario } from './services/mock-data.service';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    InterestComparatorComponent,
    MockInterestComparatorComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  // Current demo scenario
  currentScenario!: DemoScenario;

  // User profiles from current scenario
  user1!: UserProfile;
  user2!: UserProfile;
  user3?: UserProfile;

  // Demo mode toggle
  useMockMode = true;
  apiKeyConfigured = false;
  faceDetectionStatus = false;
  apiNinjasKey = environment.apiNinjasKey || 'demo-key';

  // Available scenarios
  availableScenarios: DemoScenario[] = [];
  currentScenarioIndex = 0;

  constructor(private mockDataService: MockDataService) {}

  ngOnInit(){
    console.log('🚀 Demo App Initialized');

    // Load available scenarios
    this.availableScenarios = this.mockDataService.getAllScenarios();

    // Load default scenario
    this.loadScenario(0);

    console.log(`🎭 Mock Mode: ${this.useMockMode ? 'ENABLED' : 'DISABLED'}`);
    console.log(`📋 Loaded scenario: ${this.currentScenario.name}`);
  }

  loadScenario(index: number): void {
    this.currentScenarioIndex = index;
    this.currentScenario = this.mockDataService.getScenarioByIndex(index);

    this.user1 = this.currentScenario.user1;
    this.user2 = this.currentScenario.user2;
    this.user3 = this.currentScenario.user3;

    console.log(`📋 Loaded scenario: ${this.currentScenario.name}`);
    console.log(`👤 User 1: ${this.user1.name} (${this.user1.interests.length} interests)`);
    console.log(`👤 User 2: ${this.user2.name} (${this.user2.interests.length} interests)`);
    if (this.user3) {
      console.log(`👤 User 3: ${this.user3.name} (${this.user3.interests.length} interests)`);
    }
  }

  nextScenario(): void {
    const nextIndex = (this.currentScenarioIndex + 1) % this.availableScenarios.length;
    this.loadScenario(nextIndex);
  }

  previousScenario(): void {
    const prevIndex = this.currentScenarioIndex === 0
      ? this.availableScenarios.length - 1
      : this.currentScenarioIndex - 1;
    this.loadScenario(prevIndex);
  }

  onViewProfile(event: {user: 'user1' | 'user2'}): void {
    const userNames = { user1: this.user1.name, user2: this.user2.name };
    console.log(`🔍 View Profile clicked for: ${event.user} (${userNames[event.user]})`);
  }

  toggleMockMode(): void {
    this.useMockMode = !this.useMockMode;
    console.log(`🎭 Mock Mode toggled: ${this.useMockMode ? 'ENABLED' : 'DISABLED'}`);
  }

  generateRandomScenario(): void {
    const randomUsers = this.mockDataService.generateRandomUsers();

    // Create a custom scenario with random users
    this.user1 = randomUsers.user1;
    this.user2 = randomUsers.user2;
    this.user3 = randomUsers.user3;

    console.log('🎲 Generated random scenario');
  }

}
