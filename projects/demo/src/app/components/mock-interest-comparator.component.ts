import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import Swiper from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Navigation, Pagination } from 'swiper/modules';
import { MockFaceDetectService } from '../services/mock-face-detect.service';
import { MockSimilarityService } from '../services/mock-similarity.service';

export interface UserProfile {
  name: string;
  image: string;
  interests: string[];
}

@Component({
  selector: 'app-mock-interest-comparator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pixel-perfect-comparator" #comparatorContainer>
      <div class="images-bg">
        <div class="top-fade-overlay"></div>
        <div class="user-img left-img" [style.background-image]="'url(' + user1.image + ')'"></div>
        <div class="user-img right-img" [style.background-image]="'url(' + user2.image + ')'"></div>
        <div class="center-fade-overlay  bottom-fade-overlay"></div>

      </div>
      <div class="main-flex-row">
        <div class="interests-col left scrollable-col">
          <div class="interest-item" *ngFor="let interest of orderedUser1Interests; trackBy: trackByInterest">
            {{ interest }}
          </div>
          <div class="view-profile-link" (click)="onViewProfile('user1')">View  Profile</div>
        </div>
        <div class="shared-texts center-shared">
          <ng-container *ngIf="sharedInterests.length > 0; else noShared">
            <div *ngFor="let shared of sharedInterests">{{ shared }}</div>
          </ng-container>
          <ng-template #noShared>
            <div>No shared interests</div>
          </ng-template>
        </div>
        <div class="interests-col right scrollable-col">
          <div class="interest-item" *ngFor="let interest of orderedUser2Interests; trackBy: trackByInterest">
            {{ interest }}
          </div>
          <div class="view-profile-link btn-2" (click)="onViewProfile('user2')">View Profile</div>
        </div>
      </div>
      <div *ngIf="isLoading" class="loading-overlay">
        <div class="loading-spinner">
          <div class="spinner-ring"></div>
          <div class="spinner-text">{{ loadingMessage }}</div>
          <div class="demo-badge">DEMO MODE</div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .pixel-perfect-comparator {
      position: relative;
      min-width: 340px;
      height: 100vh;
      margin: 0 auto;
      overflow: hidden;
      background: #181828;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: center;
    }

    /* Updated Top Section Styles */
    .top-section {

      width: 100%;
      background: #181828;
      min-height: 110px;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      align-items: center;
      position: relative;
      z-index: 3;
    }

    .swipe-indicator-row {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-end;
      margin-top: 10px;
      margin-bottom: 0;
    }

    .swipe-arrows {
      color: #fff;
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 2px;
      letter-spacing: 8px;
      text-align: center;
    }

    .swipe-hand {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 2px;
    }

    .top-labels-row {
      position: absolute;
      top: 350px;
      left: 0;
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: flex-end;
      padding: 0 12px 4px 12px;
      margin-top: 2px;
    }

    .top-label {
      color: #fff;
      font-size: 12px;
      opacity: 0.7;
      font-weight: 400;
    }

    .top-label.left {
      text-align: left;
    }

    .top-label.right {
      text-align: right;
    }

    /* Updated Images Background */
    .images-bg {
      position: absolute;
      top: 350px;
      left: 0;
      right: 0;
      bottom: 0;
      width: 100%;
      height: calc(100% - 400px);
      z-index: 1;
      pointer-events: none;
    }

    .images-bg::before {
      content: '';
      position: absolute;
      top: -20px;
      left: 0;
      right: 0;
      height: 20px;
      background: linear-gradient(to bottom, #181828, transparent);
      z-index: 2;
    }

    /* Updated User Images */
    .user-img {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 60%;
      background-size: cover;
      background-position: center;
      opacity: 0.32;
      filter: none;
      transition: opacity 0.3s;
    }

    .left-img {
      left: -10%;
      border-bottom-left-radius: 32px;
      z-index: 1;
    }

    .right-img {
      right: -10%;
      border-bottom-right-radius: 32px;
      z-index: 1;
    }


    .top-fade-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 40%;
      z-index: 2;
      pointer-events: none;
      background: linear-gradient(
        to bottom,
      rgba(24,24,40,0.95) 0%,
        rgba(24,24,40,0.7) 20%,
        rgba(24,24,40,0) 100%
      );
    }
    .bottom-fade-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 2;
      pointer-events: none;
      background: linear-gradient(
        to top,
        rgba(24,24,40,0.95) 0%,
        rgba(24,24,40,0.7) 20%,
        rgba(24,24,40,0) 100%
      );
    }

    .center-fade-overlay::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 20px;
      background: linear-gradient(to bottom, #181828, transparent);
    }

    /* Rest of the styles remain the same */
    .main-flex-row {
      min-width: 100%;
      position: absolute;
      top: 400px;
      z-index: 3;
      display: flex;
      flex-direction: row;
      width: 100%;
      height: calc(100% - 500px);
      align-items: center;
      justify-content: center;
      padding: 0 8px;
      &::before {
    content: '';
    width: calc(100% - 30%);
    position: absolute;
    height: 100%;
    top: 0;
    left: 0;
    background: rgba(40, 73, 86, 0.50);
    clip-path: polygon(0% 0%, 0% 0%, 300% 45%, 0% 100%);
    border-left: 4px solid #5a3074;
    border-bottom: 4px solid #5a3074;
    border-top: 4px solid transparent;

  }
&::after {
    content: "";
    width: calc(100% - 30%);
    position: absolute;
    height: 100%;
    top:-6px;
    right: 0;
    background: rgba(75, 56, 74, 0.50);
    clip-path: polygon(0% 0%, 0% 0%, 300% 45%, 0% 100%);
    transform: rotate(180deg);
    border-right: 4px solid #5a3074;
    border-bottom: 4px solid #5a3074;
    border-top: 4px solid transparent;

  }
    }

    .interests-col {
      flex: 1 1 0;
      display: flex;
      position: relative;
      z-index: 1;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      min-width: 0;
      height: 80%;
      margin-top: 12px;
      margin-bottom: 12px;
    }

    .scrollable-col {
      max-height: calc(100vh - 110px - 32px);
      overflow-y: auto;
      scrollbar-width: thin;
      scrollbar-color: #444 #232232;
    }

    .interests-col.left {
      align-items: flex-end;
      margin-right: 8px;
    }

    .interests-col.right {
      align-items: flex-start;
      margin-left: 8px;
    }

    .interest-item {
      color: #fff;
      font-size: 14px;
      margin: 2px 0;
      opacity: 0.95;
      text-align: right;
      font-weight: 500;
      word-break: break-word;
      animation: fadeInUp 0.5s ease-out;
    }

    .interests-col.right .interest-item {
      text-align: left;
    }

    .view-profile-link {
      color: #a291a0;
      font-size: 15px;
      margin-top: auto;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
      margin-bottom: 0;
      cursor: pointer;
      opacity: 0.85;
      font-weight:800;
      transition: color 0.2s;
      align-self: flex-end;
      width: 100%;

    }

    .interests-col.right .btn-2 {
      align-self: flex-end;
      text-align: right;
      width: 100%;

    }
    .interests-col.right .view-profile-link {
      align-self: flex-start;

    }

    .view-profile-link:hover {
      opacity: 1;
      color: #667eea;
    }

    .shared-texts.center-shared {
      display: flex;
      position: relative;
      z-index: 1;
      flex: 0 0 38%;
      min-width: 120px;
      max-width: 180px;
      min-height: 140px;
      max-height: 220px;
      background: none;
      border-radius: 0;
      box-shadow: none;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 8px;
      padding: 18px 8px;
      transform: none;
      border: none;
      color: #fff;
      font-size: 17px;
      font-weight: 600;
      text-align: center;
      width: 100%;
      word-break: break-word;
      flex-direction: column;
      gap: 10px;
    }

    .shared-texts.center-shared > div {
      animation: pulseGlow 2s ease-in-out infinite;
    }

    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 100;
      backdrop-filter: blur(10px);
    }

    .loading-spinner {
      text-align: center;
      color: white;
      background: rgba(255, 255, 255, 0.1);
      padding: 30px;
      border-radius: 20px;
      backdrop-filter: blur(15px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .spinner-ring {
      width: 50px;
      height: 50px;
      border: 4px solid rgba(255, 255, 255, 0.2);
      border-top: 4px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
      box-shadow: 0 0 20px rgba(102, 126, 234, 0.3);
    }

    .spinner-text {
      color: white;
      font-size: 16px;
      font-weight: 600;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      margin-bottom: 10px;
    }

    .demo-badge {
      background: linear-gradient(45deg, #ff6b6b, #feca57);
      color: white;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
      margin-top: 10px;
      animation: pulse 2s infinite;
    }

    .demo-info-panel {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: rgba(0, 0, 0, 0.9);
      backdrop-filter: blur(10px);
      border-top: 2px solid #667eea;
      z-index: 1000;
      transition: transform 0.3s ease;
    }

    .demo-info-panel.collapsed {
      transform: translateY(calc(100% - 40px));
    }

    .demo-toggle {
      background: #667eea;
      color: white;
      text-align: center;
      padding: 10px;
      cursor: pointer;
      font-weight: bold;
      font-size: 12px;
      letter-spacing: 1px;
    }

    .demo-content {
      padding: 20px;
      color: white;
      max-height: 300px;
      overflow-y: auto;
    }

    .demo-content h3 {
      margin: 0 0 10px 0;
      color: #667eea;
    }

    .demo-content ul {
      margin: 10px 0;
      padding-left: 20px;
    }

    .demo-content li {
      margin: 5px 0;
      font-size: 14px;
    }

    .mock-stats {
      display: flex;
      gap: 20px;
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px solid rgba(255, 255, 255, 0.2);
    }

    .mock-stats > div {
      background: rgba(102, 126, 234, 0.2);
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 12px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 0.95;
        transform: translateY(0);
      }
    }

    @keyframes pulseGlow {
      0%, 100% {
        opacity: 1;
        text-shadow: 0 0 10px rgba(102, 126, 234, 0.5);
      }
      50% {
        opacity: 0.8;
        text-shadow: 0 0 20px rgba(102, 126, 234, 0.8);
      }
    }
  `]
})
export class MockInterestComparatorComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() user1!: UserProfile;
  @Input() user2!: UserProfile;
  @Input() user3?: UserProfile;
  @Input() apiKey?: string;
  @Input() similarityThreshold: number = 0.75;
  @Output() viewProfile = new EventEmitter<{ user: 'user1' | 'user2' }>();

  @ViewChild('comparatorContainer') comparatorContainer!: ElementRef;

  orderedUser1Interests: string[] = [];
  orderedUser2Interests: string[] = [];
  sharedInterests: string[] = [];
  isLoading = true;
  apiError = false;
  similarityMatrix: number[][] = [];
  allInterests: string[] = [];
  additionalSlides: Array<{ interests: string[] }> = [];

  user1Faces: any[] = [];
  user2Faces: any[] = [];
  showFaceDetectionResults = false;
  loadingMessage = 'Initializing mock demo...';

  showDemoInfo = true;
  mockFaceResults = '';
  processingTime = 0;
  startTime = 0;

  private swiper?: Swiper;
  private destroy$ = new Subject<void>();

  constructor(
    private mockSimilarityService: MockSimilarityService,
    private mockFaceDetectService: MockFaceDetectService
  ) { }

  ngOnInit() {
    this.startTime = Date.now();

    if (this.apiKey) {
      this.mockFaceDetectService.setApiKey(this.apiKey);
      this.mockSimilarityService.setApiKey(this.apiKey);
    }

    this.initializeComponent();
  }

  ngAfterViewInit() {
    // Swiper initialization can be added here if needed
  }

  ngOnDestroy() {
    if (this.swiper) {
      this.swiper.destroy();
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async initializeComponent() {
    try {
      this.isLoading = true;
      this.apiError = false;
      this.loadingMessage = 'Processing interests with mock AI...';

      const similarityResult = await this.mockSimilarityService.orderInterests(
        this.user1.interests,
        this.user2.interests,
        this.user3?.interests || []
      );

      this.orderedUser1Interests = similarityResult.orderedUser1Interests;
      this.orderedUser2Interests = similarityResult.orderedUser2Interests;
      this.similarityMatrix = similarityResult.similarityMatrix;
      this.allInterests = [...this.user1.interests, ...this.user2.interests, ...(this.user3?.interests || [])];

      this.loadingMessage = 'Finding shared interests...';
      this.sharedInterests = await this.findSharedInterests();

      this.loadingMessage = 'Running mock face detection...';
      await this.processMockFaceDetection();

      this.processingTime = Date.now() - this.startTime;
      this.isLoading = false;
      this.createAdditionalSlides();
    } catch (error) {
      console.error('Error initializing mock component:', error);
      this.apiError = true;
      this.isLoading = false;
      this.orderedUser1Interests = this.user1.interests;
      this.orderedUser2Interests = this.user2.interests;
      this.sharedInterests = this.findSharedInterestsFallback();
      this.createAdditionalSlides();
      this.processingTime = Date.now() - this.startTime;
    }
  }

  private createAdditionalSlides() {
    this.additionalSlides = [];
    const allInterests = [...this.orderedUser1Interests, ...this.orderedUser2Interests];
    const maxInterestsPerSlide = 6;

    for (let i = 0; i < allInterests.length; i += maxInterestsPerSlide) {
      const slideInterests = allInterests.slice(i, i + maxInterestsPerSlide);
      if (slideInterests.length > 0) {
        this.additionalSlides.push({ interests: slideInterests });
      }
    }
  }

  private async processMockFaceDetection() {
    try {
      const user1Result = await this.mockFaceDetectService.detectFacesFromUrl(this.user1.image);
      this.user1Faces = user1Result.faces || [];

      const user2Result = await this.mockFaceDetectService.detectFacesFromUrl(this.user2.image);
      this.user2Faces = user2Result.faces || [];

      this.mockFaceResults = `${this.user1Faces.length + this.user2Faces.length} faces detected`;

      if (this.user1Faces.length > 0 || this.user2Faces.length > 0) {
        (this.user1 as any).faceData = this.user1Faces;
        (this.user2 as any).faceData = this.user2Faces;
        this.showFaceDetectionResults = true;
      }
    } catch (error) {
      console.error('Mock face detection process failed:', error);
      this.mockFaceResults = 'Face detection failed';
    }
  }

  private async findSharedInterests(): Promise<string[]> {
    try {
      const shared = await this.mockSimilarityService.findSharedInterests(
        this.user1.interests,
        this.user2.interests
      ).toPromise();
      return shared || [];
    } catch (error) {
      console.warn('Error finding shared interests:', error);
      return this.findSharedInterestsFallback();
    }
  }

  private findSharedInterestsFallback(): string[] {
    const shared: string[] = [];
    for (const interest1 of this.user1.interests) {
      for (const interest2 of this.user2.interests) {
        if (this.calculateFallbackSimilarity(interest1, interest2) >= this.similarityThreshold) {
          if (!shared.includes(interest2)) {
            shared.push(interest2);
          }
        }
      }
    }
    return shared.slice(0, 2);
  }

  private calculateFallbackSimilarity(text1: string, text2: string): number {
    const normalized1 = text1.toLowerCase().trim();
    const normalized2 = text2.toLowerCase().trim();
    if (normalized1 === normalized2) return 1;
    if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) return 0.8;

    const words1 = normalized1.split(/\s+/);
    const words2 = normalized2.split(/\s+/);
    const commonWords = words1.filter(word => words2.includes(word));

    if (commonWords.length > 0) {
      return Math.min(0.7, commonWords.length / Math.max(words1.length, words2.length));
    }
    return 0.1;
  }

  isSharedInterest(interest: string): boolean {
    return this.sharedInterests.includes(interest);
  }

  trackByInterest(index: number, interest: string): string {
    return interest;
  }

  onViewProfile(user: 'user1' | 'user2'): void {
    const userName = user === 'user1' ? this.user1.name : this.user2.name;
    this.viewProfile.emit({ user });
    alert(`🎭 DEMO MODE: Navigating to ${userName}'s profile page!`);
  }


  getFaceDetectionResults() {
    return {
      user1: {
        faces: this.user1Faces,
        image: this.user1.image
      },
      user2: {
        faces: this.user2Faces,
        image: this.user2.image
      }
    };
  }
}
