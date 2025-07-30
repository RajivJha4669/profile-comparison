import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { UserProfile } from './models/interest.model';
import { SimilarityService } from './services/similarity.service';
import { FaceDetectService } from './services/face-align.service';
import { Navigation, Pagination } from 'swiper/modules';
import { Subject } from 'rxjs';
import Swiper from 'swiper';
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
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      position: relative;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);

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
      padding: 12px 20px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      font-size: 14px;
      font-weight: 600;
      z-index: 100;
      backdrop-filter: blur(10px);
    }

    .status-icons {
      display: flex;
      gap: 6px;
      align-items: center;
    }

    .top-section {
      flex: 0 0 60%;
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
    }

    .top-section::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.1)"/><circle cx="10" cy="60" r="0.5" fill="rgba(255,255,255,0.1)"/><circle cx="90" cy="40" r="0.5" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
      opacity: 0.3;
    }

    .interaction-area {
      text-align: center;
      color: white;
      z-index: 2;
      position: relative;
    }

    .user-labels {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
      padding: 0 50px;
    }

    .user-label {
      font-size: 18px;
      font-weight: 700;
      color: white;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      background: rgba(255, 255, 255, 0.1);
      padding: 8px 16px;
      border-radius: 20px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .swipe-indicator {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      background: rgba(255, 255, 255, 0.1);
      padding: 16px 24px;
      border-radius: 30px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .hand-icon {
      font-size: 28px;
      animation: wave 2s ease-in-out infinite;
    }

    @keyframes wave {
      0%, 100% { transform: rotate(0deg); }
      25% { transform: rotate(-10deg); }
      75% { transform: rotate(10deg); }
    }

    .swipe-arrows {
      display: flex;
      gap: 12px;
    }

    .arrow {
      font-size: 20px;
      color: white;
      font-weight: bold;
      animation: pulse 1.5s ease-in-out infinite;
    }

    .arrow:nth-child(1) { animation-delay: 0s; }
    .arrow:nth-child(2) { animation-delay: 0.5s; }

    @keyframes pulse {
      0%, 100% { opacity: 0.6; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.1); }
    }

    .profile-comparison {
      flex: 0 0 40%;
      position: relative;
      background: rgba(255, 255, 255, 0.95);
      overflow: hidden;
      border-top: 1px solid rgba(255, 255, 255, 0.3);
    }

    .background-faces {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      filter: blur(12px);
      opacity: 0.2;
      z-index: 1;
    }

    .face {
      position: absolute;
      width: 140px;
      height: 140px;
      border-radius: 50%;
      background-size: cover;
      background-position: center;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
    }

    .user1-face {
      left: 30px;
      top: 30px;
      transform: rotate(-5deg);
    }

    .user2-face {
      right: 30px;
      top: 30px;
      transform: rotate(5deg);
    }

    /* Face Detection Results Display */
    .face-detection-results {
      position: absolute;
      top: 15px;
      left: 15px;
      right: 15px;
      z-index: 10;
      display: flex;
      gap: 15px;
      pointer-events: none;
    }

    .face-result {
      flex: 1;
      position: relative;
      max-width: 160px;
    }

    .face-image {
      width: 100%;
      height: auto;
      border-radius: 12px;
      border: 3px solid rgba(255, 255, 255, 0.5);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    }

    .face-box {
      position: absolute;
      border: 3px solid #00ff88;
      background: rgba(0, 255, 136, 0.15);
      pointer-events: none;
      border-radius: 4px;
      animation: glow 2s ease-in-out infinite alternate;
    }

    @keyframes glow {
      from { box-shadow: 0 0 5px rgba(0, 255, 136, 0.5); }
      to { box-shadow: 0 0 15px rgba(0, 255, 136, 0.8); }
    }

    .face-label {
      position: absolute;
      top: -25px;
      left: 0;
      background: linear-gradient(135deg, #00ff88, #00cc6a);
      color: #000;
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: bold;
      box-shadow: 0 2px 8px rgba(0, 255, 136, 0.3);
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
      padding: 25px;
    }

    .comparison-container {
      display: flex;
      height: 100%;
      width: 100%;
      gap: 25px;
      align-items: center;
    }

    .interests-column {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-height: 100%;
      overflow-y: auto;
    }

    .user1-column {
      align-items: flex-start;
    }

    .user2-column {
      align-items: flex-end;
    }

    .interest-item {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%);
      padding: 12px 16px;
      border-radius: 12px;
      max-width: 85%;
      display: flex;
      flex-direction: column;
      gap: 6px;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.3);
      backdrop-filter: blur(10px);

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
      }

      &.shared-interest {
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);
        border: 2px solid rgba(102, 126, 234, 0.6);
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
        animation: sharedGlow 2s ease-in-out infinite alternate;
      }
    }

    @keyframes sharedGlow {
      from { box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3); }
      to { box-shadow: 0 8px 30px rgba(102, 126, 234, 0.5); }
    }

    .interest-text {
      font-size: 13px;
      font-weight: 600;
      color: #1a202c;
      word-wrap: break-word;
      line-height: 1.4;
    }

    .interest-line {
      height: 3px;
      background: linear-gradient(90deg, #e2e8f0 0%, #cbd5e0 100%);
      width: 100%;
      border-radius: 2px;
    }

    .middle-section {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      display: flex;
      flex-direction: column;
      gap: 15px;
      z-index: 3;
    }

    .shared-interest-card {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%);
      padding: 16px 20px;
      border-radius: 16px;
      text-align: center;
      min-width: 120px;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
      border: 2px solid rgba(255, 255, 255, 0.5);
      backdrop-filter: blur(15px);
      transition: all 0.3s ease;

      &:hover {
        transform: scale(1.05);
      }

      &.cyan-glow {
        box-shadow: 0 8px 30px rgba(0, 255, 255, 0.4);
        border: 2px solid rgba(0, 255, 255, 0.4);
        animation: cyanPulse 2s ease-in-out infinite alternate;
      }

      &.magenta-glow {
        box-shadow: 0 8px 30px rgba(255, 0, 255, 0.4);
        border: 2px solid rgba(255, 0, 255, 0.4);
        animation: magentaPulse 2s ease-in-out infinite alternate;
      }
    }

    @keyframes cyanPulse {
      from { box-shadow: 0 8px 30px rgba(0, 255, 255, 0.4); }
      to { box-shadow: 0 12px 40px rgba(0, 255, 255, 0.6); }
    }

    @keyframes magentaPulse {
      from { box-shadow: 0 8px 30px rgba(255, 0, 255, 0.4); }
      to { box-shadow: 0 12px 40px rgba(255, 0, 255, 0.6); }
    }

    .shared-text {
      font-size: 15px;
      font-weight: 700;
      color: #1a202c;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }

    .view-profile-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 12px 20px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-top: auto;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
      letter-spacing: 0.5px;

      &:hover:not(:disabled) {
        transform: translateY(-3px);
        box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
      }

      &:active {
        transform: translateY(-1px);
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
      padding: 20px;
    }

    .additional-content h3 {
      margin-bottom: 25px;
      font-size: 20px;
      font-weight: 700;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }

    .additional-interests {
      display: flex;
      flex-direction: column;
      gap: 12px;
      align-items: center;
    }

    .additional-interests .interest-item {
      max-width: 250px;
      background: rgba(255, 255, 255, 0.95);
    }

    /* Swiper pagination styles */
    .swiper-pagination {
      position: absolute;
      bottom: 15px;
      left: 50%;
      transform: translateX(-50%);
    }

    .swiper-pagination-bullet {
      background: rgba(102, 126, 234, 0.5);
      opacity: 1;
      width: 8px;
      height: 8px;
      margin: 0 4px;
      transition: all 0.3s ease;
    }

    .swiper-pagination-bullet-active {
      background: #667eea;
      transform: scale(1.2);
      box-shadow: 0 0 10px rgba(102, 126, 234, 0.5);
    }

    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.85);
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
        padding: 20px;
      }

      .comparison-container {
        gap: 20px;
      }

      .interest-item {
        max-width: 90%;
        padding: 10px 14px;
      }

      .shared-interest-card {
        min-width: 100px;
        padding: 14px 16px;
      }

      .face-detection-results {
        top: 10px;
        left: 10px;
        right: 10px;
        gap: 10px;
      }

      .face-result {
        max-width: 140px;
      }

      .user-labels {
        padding: 0 30px;
      }

      .user-label {
        font-size: 16px;
        padding: 6px 12px;
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

      // Step 4: Process face detection for both users (non-blocking)
      this.loadingMessage = 'Detecting faces...';
      console.log('📸 Step 3: Processing face detection...');

      // Use Promise.race to timeout face detection after 10 seconds
      const faceDetectionPromise = this.processFaceDetection();
      const timeoutPromise = new Promise(resolve => setTimeout(resolve, 10000));

      try {
        await Promise.race([faceDetectionPromise, timeoutPromise]);
        console.log('✅ Face detection completed (or timed out)');
      } catch (error) {
        console.warn('⚠️ Face detection failed or timed out:', error);
      }

      // Show face detection results if available
      if (this.user1Faces.length > 0 || this.user2Faces.length > 0) {
        this.showFaceDetectionResults = true;
        console.log('✅ Face detection results available');
      } else {
        console.log('⚠️ No face detection results available');
      }

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

      // Process User 1 face detection with timeout
      console.log('👤 Processing User 1 face detection:', this.user1.image);
      try {
        const user1Result = await Promise.race([
          this.faceAlignService.detectFacesFromUrl(this.user1.image),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
        ]);
        this.user1Faces = user1Result.faces || [];
        console.log('✅ User 1 face detection result:', user1Result.success ? `${this.user1Faces.length} faces found` : user1Result.error);
        console.log('👤 User 1 faces:', this.user1Faces);
      } catch (error) {
        console.warn('❌ User 1 face detection failed:', error);
        this.user1Faces = [];
      }

      // Process User 2 face detection with timeout
      console.log('👤 Processing User 2 face detection:', this.user2.image);
      try {
        const user2Result = await Promise.race([
          this.faceAlignService.detectFacesFromUrl(this.user2.image),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
        ]);
        this.user2Faces = user2Result.faces || [];
        console.log('✅ User 2 face detection result:', user2Result.success ? `${this.user2Faces.length} faces found` : user2Result.error);
        console.log('👤 User 2 faces:', this.user2Faces);
      } catch (error) {
        console.warn('❌ User 2 face detection failed:', error);
        this.user2Faces = [];
      }

      // Store face data for potential future use (eye-to-eye alignment)
      if (this.user1Faces.length > 0 || this.user2Faces.length > 0) {
        (this.user1 as any).faceData = this.user1Faces;
        (this.user2 as any).faceData = this.user2Faces;
        console.log('💾 Face data stored for users');
      }

    } catch (error) {
      console.error('💥 Face detection process failed:', error);
      // Don't throw error, just log it
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


