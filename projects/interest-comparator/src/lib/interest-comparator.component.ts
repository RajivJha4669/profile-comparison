import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { UserProfile } from './models/interest.model';
import { SimilarityService } from './services/similarity.service';
import { FaceDetectService } from './services/face-align.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Import Swiper components and modules
import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

@Component({
  selector: 'lib-interest-comparator',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  template: `
    <div class="matcher-home"
         [class.loading]="isLoading"
         [class.api-error]="apiError"
         #comparatorContainer>

      <!-- Mobile Status Bar -->
      <div class="status-bar">
        <span class="time">9:41</span>
        <div class="status-icons">
          <span class="signal">📶</span>
          <span class="wifi">📶</span>
          <span class="battery">🔋</span>
        </div>
      </div>

      <!-- Dark Top Section (60% of screen) -->
      <div class="top-section">
        <div class="interaction-area">
          <div class="user-labels">
            <span class="user-label">User 1 Interests</span>
            <span class="user-label">User 2 Interests</span>
          </div>
          <div class="swipe-indicator">
            <div class="hand-icon">👋</div>
            <div class="swipe-arrows">
              <span class="arrow">←</span>
              <span class="arrow">→</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Profile Comparison Component (40% of screen) -->
      <div class="profile-comparison">
        <!-- Background with blurred faces -->
        <div class="background-faces">
          <div class="face user1-face" [style.background-image]="'url(' + user1.image + ')'"></div>
          <div class="face user2-face" [style.background-image]="'url(' + user2.image + ')'"></div>
        </div>

        <!-- Face Detection Results Display -->
        <div class="face-detection-results" *ngIf="showFaceDetectionResults">
          <div class="face-result user1-result">
            <img [src]="user1.image" alt="User 1" class="face-image" />
            <div *ngFor="let face of user1Faces; let i = index"
                 class="face-box"
                 [ngStyle]="{
                   left: (face.x / 300 * 100) + '%',
                   top: (face.y / 300 * 100) + '%',
                   width: (face.width / 300 * 100) + '%',
                   height: (face.height / 300 * 100) + '%'
                 }">
              <span class="face-label">Face {{i + 1}}</span>
            </div>
          </div>
          <div class="face-result user2-result">
            <img [src]="user2.image" alt="User 2" class="face-image" />
            <div *ngFor="let face of user2Faces; let i = index"
                 class="face-box"
                 [ngStyle]="{
                   left: (face.x / 300 * 100) + '%',
                   top: (face.y / 300 * 100) + '%',
                   width: (face.width / 300 * 100) + '%',
                   height: (face.height / 300 * 100) + '%'
                 }">
              <span class="face-label">Face {{i + 1}}</span>
            </div>
          </div>
        </div>

        <!-- Swiper container for interests -->
        <div class="swiper" #swiperContainer>
          <div class="swiper-wrapper">
            <!-- Slide 1: Main comparison view -->
            <div class="swiper-slide">
              <div class="comparison-container">
                <!-- User 1 Interests (Left) -->
                <div class="interests-column user1-column">
                  <div *ngFor="let interest of orderedUser1Interests; trackBy: trackByInterest"
                       class="interest-item"
                       [class.shared-interest]="isSharedInterest(interest)">
                    <span class="interest-text">{{ interest }}</span>
                    <div class="interest-line"></div>
                  </div>
                  <button class="view-profile-btn" (click)="onViewProfile('user1')">
                    View Profile →
                  </button>
                </div>

                <!-- Middle shared interests -->
                <div class="middle-section" *ngIf="sharedInterests.length > 0">
                  <div *ngFor="let shared of sharedInterests; let i = index"
                       class="shared-interest-card"
                       [class.cyan-glow]="i === 0"
                       [class.magenta-glow]="i === 1">
                    <span class="shared-text">{{ shared }}</span>
                  </div>
                </div>

                <!-- User 2 Interests (Right) -->
                <div class="interests-column user2-column">
                  <div *ngFor="let interest of orderedUser2Interests; trackBy: trackByInterest"
                       class="interest-item"
                       [class.shared-interest]="isSharedInterest(interest)">
                    <span class="interest-text">{{ interest }}</span>
                    <div class="interest-line"></div>
                  </div>
                  <button class="view-profile-btn" (click)="onViewProfile('user2')">
                    ← View Profile
                  </button>
                </div>
              </div>
            </div>

            <!-- Additional slides for overflow content -->
            <div class="swiper-slide" *ngFor="let slide of additionalSlides; let i = index">
              <div class="additional-content">
                <h3>Additional Interests</h3>
                <div class="additional-interests">
                  <div *ngFor="let interest of slide.interests" class="interest-item">
                    <span class="interest-text">{{ interest }}</span>
                    <div class="interest-line"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Swiper pagination -->
          <div class="swiper-pagination"></div>
        </div>
      </div>

      <!-- Loading Overlay -->
      <div *ngIf="isLoading" class="loading-overlay">
        <div class="loading-spinner">
          <div class="spinner-ring"></div>
          <div class="spinner-text">{{ loadingMessage }}</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .matcher-home {
      width: 100%;
      max-width: 375px;
      height: 100vh;
      margin: 0 auto;
      background: #000000;
      position: relative;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      overflow: hidden;
      display: flex;
      flex-direction: column;

      &.loading {
        opacity: 0.7;
        pointer-events: none;
      }

      &.api-error {
        border: 2px solid #ff6b6b;
      }
    }

    .status-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 16px;
      background: #000000;
      color: white;
      font-size: 14px;
      font-weight: 600;
      z-index: 100;
    }

    .status-icons {
      display: flex;
      gap: 4px;
    }

    .top-section {
      flex: 0 0 60%;
      background: #000000;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    .interaction-area {
      text-align: center;
      color: white;
    }

    .user-labels {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;
      padding: 0 40px;
    }

    .user-label {
      font-size: 16px;
      font-weight: 600;
      color: white;
    }

    .swipe-indicator {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
    }

    .hand-icon {
      font-size: 24px;
    }

    .swipe-arrows {
      display: flex;
      gap: 8px;
    }

    .arrow {
      font-size: 18px;
      color: white;
      font-weight: bold;
    }

    .profile-comparison {
      flex: 0 0 40%;
      position: relative;
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
      overflow: hidden;
    }

    .background-faces {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      filter: blur(8px);
      opacity: 0.3;
      z-index: 1;
    }

    .face {
      position: absolute;
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background-size: cover;
      background-position: center;
    }

    .user1-face {
      left: 20px;
      top: 20px;
    }

    .user2-face {
      right: 20px;
      top: 20px;
    }

    /* Face Detection Results Display */
    .face-detection-results {
      position: absolute;
      top: 10px;
      left: 10px;
      right: 10px;
      z-index: 10;
      display: flex;
      gap: 10px;
      pointer-events: none;
    }

    .face-result {
      flex: 1;
      position: relative;
      max-width: 150px;
    }

    .face-image {
      width: 100%;
      height: auto;
      border-radius: 8px;
      border: 2px solid rgba(255, 255, 255, 0.3);
    }

    .face-box {
      position: absolute;
      border: 2px solid #00ff00;
      background: rgba(0, 255, 0, 0.1);
      pointer-events: none;
    }

    .face-label {
      position: absolute;
      top: -20px;
      left: 0;
      background: #00ff00;
      color: #000;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: bold;
    }

    .swiper {
      width: 100%;
      height: 100%;
      position: relative;
      z-index: 2;
    }

    .swiper-slide {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .comparison-container {
      display: flex;
      height: 100%;
      width: 100%;
      gap: 20px;
    }

    .interests-column {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .user1-column {
      align-items: flex-start;
    }

    .user2-column {
      align-items: flex-end;
    }

    .interest-item {
      background: rgba(255, 255, 255, 0.9);
      padding: 8px 12px;
      border-radius: 6px;
      max-width: 80%;
      display: flex;
      flex-direction: column;
      gap: 4px;
      transition: all 0.2s ease;

      &.shared-interest {
        background: rgba(102, 126, 234, 0.2);
        border: 1px solid rgba(102, 126, 234, 0.5);
      }
    }

    .interest-text {
      font-size: 12px;
      font-weight: 500;
      color: #2c3e50;
      word-wrap: break-word;
    }

    .interest-line {
      height: 2px;
      background: #e9ecef;
      width: 100%;
      border-radius: 1px;
    }

    .middle-section {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      display: flex;
      flex-direction: column;
      gap: 12px;
      z-index: 3;
    }

    .shared-interest-card {
      background: rgba(255, 255, 255, 0.95);
      padding: 12px 16px;
      border-radius: 8px;
      text-align: center;
      min-width: 100px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);

      &.cyan-glow {
        box-shadow: 0 4px 20px rgba(0, 255, 255, 0.4);
        border: 2px solid rgba(0, 255, 255, 0.3);
      }

      &.magenta-glow {
        box-shadow: 0 4px 20px rgba(255, 0, 255, 0.4);
        border: 2px solid rgba(255, 0, 255, 0.3);
      }
    }

    .shared-text {
      font-size: 14px;
      font-weight: 600;
      color: #2c3e50;
    }

    .view-profile-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-top: auto;
      box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);

      &:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    .additional-content {
      text-align: center;
      color: white;
      width: 100%;
    }

    .additional-content h3 {
      margin-bottom: 20px;
      font-size: 18px;
      font-weight: 600;
    }

    .additional-interests {
      display: flex;
      flex-direction: column;
      gap: 8px;
      align-items: center;
    }

    .additional-interests .interest-item {
      max-width: 200px;
    }

    /* Swiper pagination styles */
    .swiper-pagination {
      position: absolute;
      bottom: 10px;
      left: 50%;
      transform: translateX(-50%);
    }

    .swiper-pagination-bullet {
      background: rgba(255, 255, 255, 0.5);
      opacity: 1;
    }

    .swiper-pagination-bullet-active {
      background: #667eea;
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
    }

    .loading-spinner {
      text-align: center;
      color: white;
    }

    .spinner-ring {
      width: 40px;
      height: 40px;
      border: 4px solid rgba(255, 255, 255, 0.3);
      border-top: 4px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 16px;
    }

    .spinner-text {
      color: white;
      font-size: 14px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Responsive adjustments */
    @media (max-width: 375px) {
      .matcher-home {
        max-width: 100%;
      }

      .swiper-slide {
        padding: 16px;
      }

      .comparison-container {
        gap: 16px;
      }

      .interest-item {
        max-width: 85%;
      }

      .shared-interest-card {
        min-width: 80px;
        padding: 10px 12px;
      }

      .face-detection-results {
        top: 5px;
        left: 5px;
        right: 5px;
        gap: 5px;
      }

      .face-result {
        max-width: 120px;
      }
    }
  `]
})
export class InterestComparatorComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() user1!: UserProfile;
  @Input() user2!: UserProfile;
  @Input() user3?: UserProfile;
  @Input() apiKey?: string;
  @Input() similarityThreshold: number = 0.8; // Configurable similarity threshold
  @Output() viewProfile = new EventEmitter<{user: 'user1' | 'user2'}>();

  @ViewChild('comparatorContainer') comparatorContainer!: ElementRef;
  @ViewChild('swiperContainer') swiperContainer!: ElementRef;

  orderedUser1Interests: string[] = [];
  orderedUser2Interests: string[] = [];
  sharedInterests: string[] = [];
  isLoading = true;
  apiError = false;
  similarityMatrix: number[][] = [];
  allInterests: string[] = [];
  additionalSlides: Array<{interests: string[]}> = [];

  // Face detection results
  user1Faces: any[] = [];
  user2Faces: any[] = [];
  showFaceDetectionResults = false;
  loadingMessage = 'Initializing...';

  private swiper?: Swiper;
  private destroy$ = new Subject<void>();

  constructor(
    private similarityService: SimilarityService,
    private faceAlignService: FaceDetectService
  ) {}

  ngOnInit() {
    console.log('🚀 Interest Comparator Component Initializing...');

    // Set API key if provided
    if (this.apiKey) {
      this.faceAlignService.setApiKey(this.apiKey);
      this.similarityService.setApiKey(this.apiKey);
      console.log('✅ API key configured');
    } else {
      console.warn('⚠️ No API key provided, using fallback mode');
    }

    this.initializeComponent();
  }

  ngAfterViewInit() {
    this.initializeSwiper();
  }

  ngOnDestroy() {
    if (this.swiper) {
      this.swiper.destroy();
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeSwiper() {
    if (this.swiperContainer) {
      try {
        console.log('🔄 Initializing Swiper...');
        this.swiper = new Swiper(this.swiperContainer.nativeElement, {
          modules: [Navigation, Pagination],
          direction: 'horizontal',
          loop: false,
          pagination: {
            el: '.swiper-pagination',
            clickable: true,
          },
          spaceBetween: 0,
          slidesPerView: 1,
          allowTouchMove: true,
          resistance: true,
          resistanceRatio: 0.85,
          speed: 300,
          on: {
            init: (swiper) => {
              console.log('✅ Swiper initialized successfully');
            },
            slideChange: (swiper) => {
              console.log('📱 Slide changed to:', swiper.activeIndex);
            }
          }
        });
        console.log('✅ Swiper setup complete');
      } catch (error) {
        console.error('❌ Swiper initialization failed:', error);
        this.swiper = undefined;
      }
    } else {
      console.warn('⚠️ Swiper container not found');
    }
  }

  private async initializeComponent() {
    try {
      this.isLoading = true;
      this.apiError = false;
      this.loadingMessage = 'Processing interests...';

      console.log('🚀 Starting component initialization...');
      console.log('👤 User 1:', this.user1.name, 'Interests:', this.user1.interests);
      console.log('👤 User 2:', this.user2.name, 'Interests:', this.user2.interests);
      if (this.user3) {
        console.log('👤 User 3:', this.user3.name, 'Interests:', this.user3.interests);
      }

      // Step 1: Process interests with similarity analysis
      console.log('📊 Step 1: Processing interest similarity...');
      const similarityResult = await this.similarityService.orderInterests(
        this.user1.interests,
        this.user2.interests,
        this.user3?.interests || []
      );

      this.orderedUser1Interests = similarityResult.orderedUser1Interests;
      this.orderedUser2Interests = similarityResult.orderedUser2Interests;
      this.similarityMatrix = similarityResult.similarityMatrix;
      this.allInterests = [...this.user1.interests, ...this.user2.interests, ...(this.user3?.interests || [])];

      console.log('✅ Interest ordering complete');
      console.log('📋 Ordered User 1 interests:', this.orderedUser1Interests);
      console.log('📋 Ordered User 2 interests:', this.orderedUser2Interests);

      // Step 2: Find shared interests using configurable threshold
      console.log('🔍 Step 2: Finding shared interests with threshold:', this.similarityThreshold);
      this.sharedInterests = await this.findSharedInterests();
      console.log('✅ Shared interests found:', this.sharedInterests);

      // Step 3: Create additional slides for overflow content
      this.createAdditionalSlides();

      // Step 4: Process face detection for both users
      this.loadingMessage = 'Detecting faces...';
      console.log('📸 Step 3: Processing face detection...');
      await this.processFaceDetection();

      // Show face detection results
      this.showFaceDetectionResults = true;

    } catch (error) {
      console.error('❌ Error initializing component:', error);
      this.apiError = true;
      // Fallback to original order
      this.orderedUser1Interests = this.user1.interests;
      this.orderedUser2Interests = this.user2.interests;
      this.sharedInterests = this.findSharedInterestsFallback();
      this.createAdditionalSlides();
    } finally {
      this.isLoading = false;
      console.log('✅ Component initialization complete');
    }
  }

  private createAdditionalSlides() {
    this.additionalSlides = [];

    // Create slides for additional interests if there are too many
    const allInterests = [...this.orderedUser1Interests, ...this.orderedUser2Interests];
    const maxInterestsPerSlide = 6;

    for (let i = 0; i < allInterests.length; i += maxInterestsPerSlide) {
      const slideInterests = allInterests.slice(i, i + maxInterestsPerSlide);
      if (slideInterests.length > 0) {
        this.additionalSlides.push({ interests: slideInterests });
      }
    }

    console.log('📱 Created', this.additionalSlides.length, 'additional slides');
  }

  private async processFaceDetection() {
    try {
      console.log('🔍 Starting face detection process...');

      // Process User 1 face detection
      console.log('👤 Processing User 1 face detection:', this.user1.image);
      const user1Result = await this.faceAlignService.detectFacesFromUrl(this.user1.image);
      this.user1Faces = user1Result.faces || [];
      console.log('✅ User 1 face detection result:', user1Result.success ? `${this.user1Faces.length} faces found` : user1Result.error);
      console.log('👤 User 1 faces:', this.user1Faces);

      // Process User 2 face detection
      console.log('👤 Processing User 2 face detection:', this.user2.image);
      const user2Result = await this.faceAlignService.detectFacesFromUrl(this.user2.image);
      this.user2Faces = user2Result.faces || [];
      console.log('✅ User 2 face detection result:', user2Result.success ? `${this.user2Faces.length} faces found` : user2Result.error);
      console.log('👤 User 2 faces:', this.user2Faces);

      // Store face data for potential future use (eye-to-eye alignment)
      if (user1Result.success && user2Result.success) {
        (this.user1 as any).faceData = this.user1Faces;
        (this.user2 as any).faceData = this.user2Faces;
        console.log('💾 Face data stored for both users');
      }

    } catch (error) {
      console.error('💥 Face detection process failed:', error);
    }
  }

  private async findSharedInterests(): Promise<string[]> {
    try {
      // Use the configurable similarity threshold
      const shared = await this.similarityService.findSharedInterests(
        this.user1.interests,
        this.user2.interests
      ).toPromise();

      // Filter by configurable threshold
      const filteredShared = shared?.filter(interest => {
        // Check if this interest has high similarity with any user2 interest
        return this.user2.interests.some(user2Interest =>
          this.calculateFallbackSimilarity(interest, user2Interest) >= this.similarityThreshold
        );
      }) || [];

      return filteredShared.slice(0, 2); // Limit to 2 shared interests for display
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
          // Use User 2's interest as the shared interest (as per design)
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

    if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
      return 0.8;
    }

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

  // Utility methods
  trackByInterest(index: number, interest: string): string {
    return interest;
  }

  onViewProfile(user: 'user1' | 'user2'): void {
    console.log(`🔍 View Profile clicked for: ${user}`);
    this.viewProfile.emit({ user });
    alert('You have been routed to a profile page.');
  }

  // Public method to get face detection results
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


