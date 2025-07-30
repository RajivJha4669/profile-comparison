import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { InterestComparatorComponent } from './interest-comparator.component';
import { SimilarityService } from './services/similarity.service';
import { FaceDetectService } from './services/face-align.service';
import { UserProfile } from './models/interest.model';
import { of } from 'rxjs';

describe('InterestComparatorComponent', () => {
  let component: InterestComparatorComponent;
  let fixture: ComponentFixture<InterestComparatorComponent>;
  let similarityService: jasmine.SpyObj<SimilarityService>;
  let faceDetectService: jasmine.SpyObj<FaceDetectService>;

  const mockUser1: UserProfile = {
    name: 'User 1',
    image: 'https://example.com/user1.jpg',
    interests: ['Pina Coladas', 'Subway', 'Japanese', 'Gardening', 'Baseball', 'Motocross']
  };

  const mockUser2: UserProfile = {
    name: 'User 2',
    image: 'https://example.com/user2.jpg',
    interests: ['Pizza', 'Volleyball', 'University', 'Sushi', 'Albany, NY']
  };

  const mockUser3: UserProfile = {
    name: 'User 3',
    image: 'https://example.com/user3.jpg',
    interests: ['Pina Coladas', 'Subway', 'Sushi', 'Reading', 'Movies', 'Gaming']
  };

  beforeEach(async () => {
    const similaritySpy = jasmine.createSpyObj('SimilarityService', [
      'orderInterests', 
      'findSharedInterests', 
      'setApiKey'
    ]);
    const faceDetectSpy = jasmine.createSpyObj('FaceDetectService', [
      'detectFacesFromUrl', 
      'validateProfileImage', 
      'setApiKey'
    ]);

    await TestBed.configureTestingModule({
      imports: [InterestComparatorComponent, HttpClientTestingModule],
      providers: [
        { provide: SimilarityService, useValue: similaritySpy },
        { provide: FaceDetectService, useValue: faceDetectSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(InterestComparatorComponent);
    component = fixture.componentInstance;
    similarityService = TestBed.inject(SimilarityService) as jasmine.SpyObj<SimilarityService>;
    faceDetectService = TestBed.inject(FaceDetectService) as jasmine.SpyObj<FaceDetectService>;

    // Setup default mock responses
    similarityService.orderInterests.and.returnValue(Promise.resolve({
      user1Interests: mockUser1.interests,
      user2Interests: mockUser2.interests,
      similarityMatrix: [],
      orderedUser1Interests: mockUser1.interests,
      orderedUser2Interests: mockUser2.interests
    }));

    similarityService.findSharedInterests.and.returnValue(of(['Sushi', 'University']));

    faceDetectService.validateProfileImage.and.returnValue(Promise.resolve(true));
    faceDetectService.detectFacesFromUrl.and.returnValue(Promise.resolve({
      faces: [{ x: 10, y: 10, width: 50, height: 50 }],
      success: true
    }));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with user data', () => {
    component.user1 = mockUser1;
    component.user2 = mockUser2;
    component.user3 = mockUser3;

    fixture.detectChanges();

    expect(component.user1).toEqual(mockUser1);
    expect(component.user2).toEqual(mockUser2);
    expect(component.user3).toEqual(mockUser3);
  });

  it('should set API key when provided', () => {
    const apiKey = 'test-api-key';
    component.apiKey = apiKey;

    component.ngOnInit();

    expect(faceDetectService.setApiKey).toHaveBeenCalledWith(apiKey);
    expect(similarityService.setApiKey).toHaveBeenCalledWith(apiKey);
  });

  it('should call similarity service on initialization', async () => {
    component.user1 = mockUser1;
    component.user2 = mockUser2;
    component.user3 = mockUser3;

    await component.ngOnInit();

    expect(similarityService.orderInterests).toHaveBeenCalledWith(
      mockUser1.interests,
      mockUser2.interests,
      mockUser3.interests
    );
  });

  it('should call face detection service on initialization', async () => {
    component.user1 = mockUser1;
    component.user2 = mockUser2;

    await component.ngOnInit();

    expect(faceDetectService.validateProfileImage).toHaveBeenCalledWith(mockUser1.image);
    expect(faceDetectService.validateProfileImage).toHaveBeenCalledWith(mockUser2.image);
  });

  it('should emit viewProfile event when view profile button is clicked', () => {
    spyOn(component.viewProfile, 'emit');
    spyOn(window, 'alert');

    component.onViewProfile('user1');

    expect(component.viewProfile.emit).toHaveBeenCalledWith({ user: 'user1' });
    expect(window.alert).toHaveBeenCalledWith('You have been routed to a profile page.');
  });

  it('should emit viewProfile event for user2', () => {
    spyOn(component.viewProfile, 'emit');
    spyOn(window, 'alert');

    component.onViewProfile('user2');

    expect(component.viewProfile.emit).toHaveBeenCalledWith({ user: 'user2' });
    expect(window.alert).toHaveBeenCalledWith('You have been routed to a profile page.');
  });

  it('should handle API errors gracefully', async () => {
    similarityService.orderInterests.and.returnValue(Promise.reject(new Error('API Error')));

    component.user1 = mockUser1;
    component.user2 = mockUser2;

    await component.ngOnInit();

    expect(component.apiError).toBe(true);
    expect(component.orderedUser1Interests).toEqual(mockUser1.interests);
    expect(component.orderedUser2Interests).toEqual(mockUser2.interests);
  });

  it('should find shared interests correctly', async () => {
    component.user1 = mockUser1;
    component.user2 = mockUser2;

    await component.ngOnInit();

    expect(similarityService.findSharedInterests).toHaveBeenCalledWith(
      mockUser1.interests,
      mockUser2.interests
    );
  });

  it('should create additional slides for overflow content', async () => {
    component.user1 = mockUser1;
    component.user2 = mockUser2;

    await component.ngOnInit();

    expect(component.additionalSlides.length).toBeGreaterThan(0);
  });

  it('should track interests correctly', () => {
    const result = component.trackByInterest(0, 'test-interest');
    expect(result).toBe('test-interest');
  });

  it('should identify shared interests correctly', () => {
    component.sharedInterests = ['Sushi', 'University'];
    
    expect(component.isSharedInterest('Sushi')).toBe(true);
    expect(component.isSharedInterest('Pizza')).toBe(false);
  });

  it('should render status bar correctly', () => {
    component.user1 = mockUser1;
    component.user2 = mockUser2;

    fixture.detectChanges();

    const statusBar = fixture.nativeElement.querySelector('.status-bar');
    expect(statusBar).toBeTruthy();

    const timeElement = statusBar.querySelector('.time');
    expect(timeElement.textContent).toContain('9:41');
  });

  it('should render top section with user labels', () => {
    component.user1 = mockUser1;
    component.user2 = mockUser2;

    fixture.detectChanges();

    const topSection = fixture.nativeElement.querySelector('.top-section');
    expect(topSection).toBeTruthy();

    const userLabels = topSection.querySelectorAll('.user-label');
    expect(userLabels.length).toBe(2);
    expect(userLabels[0].textContent).toContain('User 1 Interests');
    expect(userLabels[1].textContent).toContain('User 2 Interests');
  });

  it('should render swipe indicator', () => {
    component.user1 = mockUser1;
    component.user2 = mockUser2;

    fixture.detectChanges();

    const swipeIndicator = fixture.nativeElement.querySelector('.swipe-indicator');
    expect(swipeIndicator).toBeTruthy();

    const handIcon = swipeIndicator.querySelector('.hand-icon');
    expect(handIcon).toBeTruthy();
  });

  it('should render profile comparison section', () => {
    component.user1 = mockUser1;
    component.user2 = mockUser2;

    fixture.detectChanges();

    const profileComparison = fixture.nativeElement.querySelector('.profile-comparison');
    expect(profileComparison).toBeTruthy();
  });

  it('should render background faces', () => {
    component.user1 = mockUser1;
    component.user2 = mockUser2;

    fixture.detectChanges();

    const backgroundFaces = fixture.nativeElement.querySelector('.background-faces');
    expect(backgroundFaces).toBeTruthy();

    const faces = backgroundFaces.querySelectorAll('.face');
    expect(faces.length).toBe(2);
  });

  it('should render swiper container', () => {
    component.user1 = mockUser1;
    component.user2 = mockUser2;

    fixture.detectChanges();

    const swiperContainer = fixture.nativeElement.querySelector('.swiper-container');
    expect(swiperContainer).toBeTruthy();
  });

  it('should render interest columns', () => {
    component.user1 = mockUser1;
    component.user2 = mockUser2;
    component.orderedUser1Interests = mockUser1.interests;
    component.orderedUser2Interests = mockUser2.interests;

    fixture.detectChanges();

    const user1Column = fixture.nativeElement.querySelector('.user1-column');
    const user2Column = fixture.nativeElement.querySelector('.user2-column');

    expect(user1Column).toBeTruthy();
    expect(user2Column).toBeTruthy();
  });

  it('should render interest items', () => {
    component.user1 = mockUser1;
    component.user2 = mockUser2;
    component.orderedUser1Interests = mockUser1.interests;
    component.orderedUser2Interests = mockUser2.interests;

    fixture.detectChanges();

    const interestItems = fixture.nativeElement.querySelectorAll('.interest-item');
    expect(interestItems.length).toBeGreaterThan(0);
  });

  it('should render shared interest cards when shared interests exist', () => {
    component.user1 = mockUser1;
    component.user2 = mockUser2;
    component.sharedInterests = ['Sushi', 'University'];

    fixture.detectChanges();

    const sharedCards = fixture.nativeElement.querySelectorAll('.shared-interest-card');
    expect(sharedCards.length).toBe(2);
  });

  it('should not render shared interest cards when no shared interests', () => {
    component.user1 = mockUser1;
    component.user2 = mockUser2;
    component.sharedInterests = [];

    fixture.detectChanges();

    const sharedCards = fixture.nativeElement.querySelectorAll('.shared-interest-card');
    expect(sharedCards.length).toBe(0);
  });

  it('should render view profile buttons', () => {
    component.user1 = mockUser1;
    component.user2 = mockUser2;

    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('.view-profile-btn');
    expect(buttons.length).toBe(2);
  });

  it('should render loading overlay when loading', () => {
    component.isLoading = true;

    fixture.detectChanges();

    const loadingOverlay = fixture.nativeElement.querySelector('.loading-overlay');
    expect(loadingOverlay).toBeTruthy();

    const spinner = loadingOverlay.querySelector('.spinner-ring');
    expect(spinner).toBeTruthy();
  });

  it('should not render loading overlay when not loading', () => {
    component.isLoading = false;

    fixture.detectChanges();

    const loadingOverlay = fixture.nativeElement.querySelector('.loading-overlay');
    expect(loadingOverlay).toBeFalsy();
  });

  it('should apply loading class when loading', () => {
    component.isLoading = true;

    fixture.detectChanges();

    const matcherHome = fixture.nativeElement.querySelector('.matcher-home');
    expect(matcherHome.classList.contains('loading')).toBe(true);
  });

  it('should apply api-error class when API error occurs', () => {
    component.apiError = true;

    fixture.detectChanges();

    const matcherHome = fixture.nativeElement.querySelector('.matcher-home');
    expect(matcherHome.classList.contains('api-error')).toBe(true);
  });

  it('should calculate fallback similarity correctly', () => {
    const result1 = component['calculateFallbackSimilarity']('hello', 'hello');
    expect(result1).toBe(1);

    const result2 = component['calculateFallbackSimilarity']('hello', 'hello world');
    expect(result2).toBe(0.8);

    const result3 = component['calculateFallbackSimilarity']('hello', 'world');
    expect(result3).toBe(0.1);
  });

  it('should find shared interests fallback correctly', () => {
    component.user1 = mockUser1;
    component.user2 = mockUser2;

    const shared = component['findSharedInterestsFallback']();
    expect(Array.isArray(shared)).toBe(true);
  });

  it('should destroy swiper on component destroy', () => {
    component.user1 = mockUser1;
    component.user2 = mockUser2;

    fixture.detectChanges();
    component.ngAfterViewInit();

    const swiper = component['swiper'];
    if (swiper) {
      spyOn(swiper, 'destroy');
      component.ngOnDestroy();
      expect(swiper.destroy).toHaveBeenCalled();
    }
  });

  it('should handle face detection failure gracefully', async () => {
    faceDetectService.validateProfileImage.and.returnValue(Promise.resolve(false));

    component.user1 = mockUser1;
    component.user2 = mockUser2;

    await component.ngOnInit();

    expect(faceDetectService.detectFacesFromUrl).not.toHaveBeenCalled();
  });

  it('should handle similarity service failure gracefully', async () => {
    similarityService.findSharedInterests.and.returnValue(of([]));

    component.user1 = mockUser1;
    component.user2 = mockUser2;

    await component.ngOnInit();

    expect(component.sharedInterests.length).toBe(0);
  });
});
