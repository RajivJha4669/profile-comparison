import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import Swiper from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Navigation, Pagination } from 'swiper/modules';
import { UserProfile } from './models/interest.model';
import { FaceDetectService } from './services/face-align.service';
import { SimilarityService } from './services/similarity.service';

@Component({
  selector: 'lib-interest-comparator',
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


      <div class="trapezoid-overlay">
      <svg class="trapezoid-svg" viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="glow-teal" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <filter id="glow-purple" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>

  <!-- Left trapezium with rounded corners -->
  <path class="trap-left-glow" filter="url(#glow-teal)" vector-effect="non-scaling-stroke"

   d="M 0,4 L 60,17 Q 72.5,18 72.5,23 L 72.5,77 Q 72.5,82 60,83 L 0,96" fill="none" />
  <path class="trap-left" vector-effect="non-scaling-stroke"
   d="M 0,4 L 60,17 Q 72.5,18 72.5,23 L 72.5,77 Q 72.5,82 60,83 L 0,96" fill="none" />



 <!-- Right trapezium stroke-only, mirrored to match left path style -->
 <path class="trap-right-glow" filter="url(#glow-purple)" vector-effect="non-scaling-stroke"
   d="M 100,4  L 40,17  Q 28,18 28,23  L 28,77  Q 28,82 40,83  L 100,96"
   fill="none"
 />

 <path class="trap-right" vector-effect="non-scaling-stroke"
   d="M 100,4 L 40,17 Q 28,18 28,23 L 28,77 Q 28,82 40,83 L 100,96"
   fill="none"
 />
      </svg>
      </div>


      <div class="main-flex-row">
        <div class="interests-col left scrollable-col">
        <div class="interest-list-wrapper">
          <div class="interest-item" *ngFor="let interest of orderedUser1Interests; trackBy: trackByInterest">
            {{ interest }}
          </div>
        </div>
          <div class="view-profile-link" (click)="onViewProfile('user1')">View  Profile</div>
        </div>
        <div class="shared-texts center-shared">
          <ng-container *ngIf="sharedInterests.length > 0; else noShared">
            <div *ngFor="let shared of sharedInterests">{{ shared }}</div>
          </ng-container>
          <ng-template #noShared>
            <div class="no-interest">No shared interests</div>
          </ng-template>
        </div>
        <div class="interests-col right scrollable-col">
          <div class="interest-list-wrapper">
          <div class="interest-item" *ngFor="let interest of orderedUser2Interests; trackBy: trackByInterest">
            {{ interest }}
          </div>
          </div>
          <div class="view-profile-link btn-2" (click)="onViewProfile('user2')">View Profile</div>
        </div>
      </div>

      <div *ngIf="isLoading" class="loading-overlay">
        <div class="loading-spinner">
          <div class="spinner-ring"></div>
          <div class="spinner-text">{{ loadingMessage }}</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
      :host {
      --accent-left: #2ec7cc;
      --accent-right: #a35de4;
      --text-primary: #ffffff;
      --text-muted: #a291a0;
      font-family: var(--app-font-family);
    }
    .pixel-perfect-comparator {
      position: relative;
      min-width: 340px;
      width: 100%;
      max-width: 480px;
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
    .no-interest{
      font-size:12px
      font-weight:700;
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
    }

    /* Trapezium overlay positioned between images and content */
    .trapezoid-overlay {
      position: absolute;
      top: 400px;
      left: 0;
      right: 0;
      height: calc(100% - 500px);
      z-index: 2; /* Above images, below content */
      pointer-events: none;
    }

    .trapezoid-svg { width: 100%; height: 100%; display: block; }

    .trap-left {
      fill: rgba(40, 73, 86, 0.48);
      stroke: #2ec7cc;
      stroke-width: 2.5;
      stroke-linejoin: round;
    }
    .trap-left-glow {
      fill: rgba(40, 73, 86, 0.22);
      stroke: #2ec7cc;
      stroke-width: 4;
      filter: url(#glow-teal);
      opacity: 0.9;
    }

    .trap-right {
      fill: rgba(131, 76, 158, 0.20);
      stroke: #a35de4;
      stroke-width: 2.5;
      stroke-linejoin: round;
    }
    .trap-right-glow {
      fill: rgba(131, 76, 158, 0.22);
      stroke: #a35de4;
      stroke-width: 4;
      filter: url(#glow-purple);
      opacity: 0.1;
    }

    .interests-col {
      flex: 1 1 0;
      display: flex;
      position: relative;
      z-index: 1;
      flex-direction: column;
      justify-content: flex-start;
      align-items: center;
      min-width: 0;
      height: 80%;
      margin-top: 12px;
      margin-bottom: 12px;

    }

    .interest-list-wrapper {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: inherit; /* match parent alignment (flex-end on left, flex-start on right, center on mobile) */
      width: 100%;
      height: 100%;
    }


    @media (max-width: 600px) {
      .pixel-perfect-comparator {
        min-width: 0;
      }

      .interests-col.left,
      .interests-col.right {
        align-items: center;
        padding-left: 0;
        padding-right: 0;
      }

      .interest-item,
      .interests-col.right .interest-item {
        text-align: center;
      }
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
      padding-right: 12px;
      padding-top:20px;
      text-shadow: 0 0 10px rgba(46, 199, 204, 0.55), 0 0 22px rgba(46, 199, 204, 0.35);
    }

    .interests-col.right {
      align-items: flex-start;
      margin-left: 8px;
      padding-left: 12px;
      padding-top:20px;
      text-shadow: 0 0 10px rgba(46, 199, 204, 0.55), 0 0 22px rgba(46, 199, 204, 0.35);
    }

    .interest-item {
      color: #fff;
      font-size: 12px;
      margin: 2px 0;
      opacity: 0.95;
      text-align: right;
      font-weight: 500;
      word-break: break-word;
      animation: fadeInUp 0.5s ease-out;
      text-shadow: 0 0 10px rgba(46, 199, 204, 0.55), 0 0 22px rgba(46, 199, 204, 0.35);
    }

    .interests-col.right .interest-item {
      text-align: left;
    }

    .interests-col.left .interest-item {
      text-shadow: 0 0 10px rgba(46, 199, 204, 0.55), 0 0 22px rgba(46, 199, 204, 0.35);
    }


    .view-profile-link {
      color: #a291a0;
      font-size: 10px;
      margin-top: auto;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
      margin-bottom: 0;
      cursor: pointer;
      opacity: 0.85;
      font-family: 'Calistoga', var(--app-font-family, 'Segoe UI', Roboto, Arial, sans-serif);
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
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
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
          spaceBetween: 28,
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

      // --- Optimization: show UI as soon as text data is ready ---
      this.isLoading = false;

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
      this.isLoading = false; // Ensure loading is false on error
      // Fallback to original order
      this.orderedUser1Interests = this.user1.interests;
      this.orderedUser2Interests = this.user2.interests;
      this.sharedInterests = this.findSharedInterestsFallback();
      this.createAdditionalSlides();
    } finally {
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


