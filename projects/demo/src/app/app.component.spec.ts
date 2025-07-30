import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AppComponent } from './app.component';
import { InterestComparatorComponent } from 'interest-comparator';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AppComponent,
        InterestComparatorComponent,
        HttpClientTestingModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have user data', () => {
    expect(component.user1).toBeDefined();
    expect(component.user2).toBeDefined();
    expect(component.user3).toBeDefined();
  });

  it('should handle view profile event', () => {
    const event = { user: 'user1' as const };
    expect(() => component.onViewProfile(event)).not.toThrow();
  });
});
