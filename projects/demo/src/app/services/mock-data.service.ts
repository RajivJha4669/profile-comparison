import { Injectable } from '@angular/core';

export interface UserProfile {
  name: string;
  image: string;
  interests: string[];
  age?: number;
  location?: string;
  occupation?: string;
}

export interface DemoScenario {
  name: string;
  description: string;
  user1: UserProfile;
  user2: UserProfile;
  user3?: UserProfile;
}

@Injectable({
  providedIn: 'root'
})
export class MockDataService {

  private demoScenarios: DemoScenario[] = [
    {
      name: 'Tech Enthusiasts',
      description: 'Two developers with overlapping interests in technology and gaming',
      user1: {
        name: 'Alex Thompson',
        age: 28,
        location: 'San Francisco, CA',
        occupation: 'Frontend Developer',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
        interests: [
          'React Development',
          'Video Gaming',
          'Sci-Fi Movies',
          'Mountain Hiking',
          'Street Photography',
          'Electronic Music',
          'Virtual Reality',
          'Coffee Culture',
          'Tech Podcasts',
          'Open Source'
        ]
      },
      user2: {
        name: 'Sarah Chen',
        age: 26,
        location: 'Seattle, WA',
        occupation: 'UX Designer',
        image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=400&fit=crop&crop=face',
        interests: [
          'UI/UX Design',
          'Mobile Gaming',
          'Design Systems',
          'Digital Art',
          'Anime',
          'Indie Music',
          'Food Photography',
          'Modern Art',
          'Tech Startups',
          'Minimalism'
        ]
      },
      user3: {
        name: 'Mike Rodriguez',
        age: 30,
        location: 'Austin, TX',
        occupation: 'Full Stack Developer',
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
        interests: [
          'Node.js',
          'Gaming',
          'Jazz Music',
          'CrossFit',
          'AI Technology',
          'Action Movies',
          'Drone Photography',
          'Craft Beer',
          'Startup Culture',
          'Basketball'
        ]
      }
    },
    {
      name: 'Creative Arts',
      description: 'Artists and creative professionals with shared passions',
      user1: {
        name: 'Emma Wilson',
        age: 24,
        location: 'New York, NY',
        occupation: 'Graphic Designer',
        image: 'https://images.unsplash.com/photo-1494790108755-2616b612b372?w=400&h=400&fit=crop&crop=face',
        interests: [
          'Digital Illustration',
          'Contemporary Art',
          'Fashion Design',
          'Photography',
          'Film Making',
          'Travel Blogging',
          'Vintage Fashion',
          'Art Galleries',
          'Creative Writing',
          'Typography'
        ]
      },
      user2: {
        name: 'James Parker',
        age: 29,
        location: 'Los Angeles, CA',
        occupation: 'Photographer',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
        interests: [
          'Portrait Photography',
          'Street Art',
          'Film Photography',
          'Documentary Films',
          'Jazz Music',
          'Art History',
          'Black & White Photography',
          'Creative Direction',
          'Visual Storytelling',
          'Abstract Art'
        ]
      }
    },
    {
      name: 'Fitness & Wellness',
      description: 'Health-conscious individuals with active lifestyles',
      user1: {
        name: 'Maya Patel',
        age: 25,
        location: 'Denver, CO',
        occupation: 'Yoga Instructor',
        image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face',
        interests: [
          'Vinyasa Yoga',
          'Meditation',
          'Plant-Based Cooking',
          'Rock Climbing',
          'Sustainability',
          'Nature Photography',
          'Wellness Podcasts',
          'Organic Gardening',
          'Mindfulness',
          'Trail Running'
        ]
      },
      user2: {
        name: 'Ryan Foster',
        age: 27,
        location: 'Portland, OR',
        occupation: 'Personal Trainer',
        image: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=400&h=400&fit=crop&crop=face',
        interests: [
          'CrossFit Training',
          'Nutrition Science',
          'Outdoor Adventures',
          'Mountain Biking',
          'Strength Training',
          'Meal Prep',
          'Fitness Technology',
          'Sports Psychology',
          'Adventure Travel',
          'Functional Movement'
        ]
      }
    }
  ];

  getCurrentScenario(): DemoScenario {
    return this.demoScenarios[0]; // Default to first scenario
  }

  getAllScenarios(): DemoScenario[] {
    return this.demoScenarios;
  }

  getScenarioByIndex(index: number): DemoScenario {
    return this.demoScenarios[index] || this.demoScenarios[0];
  }

  // Generate random user profiles for testing
  generateRandomUsers(): { user1: UserProfile; user2: UserProfile; user3?: UserProfile } {
    const scenario = this.getRandomScenario();
    return {
      user1: scenario.user1,
      user2: scenario.user2,
      user3: scenario.user3
    };
  }

  private getRandomScenario(): DemoScenario {
    const randomIndex = Math.floor(Math.random() * this.demoScenarios.length);
    return this.demoScenarios[randomIndex];
  }

  // Interest categories for better organization
  getInterestCategories(): { [key: string]: string[] } {
    return {
      'Technology': [
        'Programming', 'Web Development', 'Mobile Apps', 'AI/ML', 'Cybersecurity',
        'Cloud Computing', 'DevOps', 'Data Science', 'Virtual Reality', 'Blockchain'
      ],
      'Creative Arts': [
        'Digital Art', 'Photography', 'Film Making', 'Graphic Design', 'Music Production',
        'Creative Writing', 'Fashion Design', 'Interior Design', 'Typography', 'Animation'
      ],
      'Entertainment': [
        'Gaming', 'Movies', 'TV Series', 'Anime', 'Streaming', 'Comedy',
        'Theater', 'Live Music', 'Concerts', 'Festivals'
      ],
      'Fitness & Sports': [
        'Yoga', 'CrossFit', 'Running', 'Cycling', 'Swimming', 'Rock Climbing',
        'Basketball', 'Soccer', 'Tennis', 'Martial Arts'
      ],
      'Lifestyle': [
        'Travel', 'Cooking', 'Fashion', 'Home Decor', 'Minimalism', 'Sustainability',
        'Wellness', 'Meditation', 'Self-improvement', 'Productivity'
      ],
      'Hobbies': [
        'Reading', 'Gardening', 'DIY Projects', 'Board Games', 'Puzzles',
        'Collecting', 'Model Building', 'Crafting', 'Woodworking', 'Astronomy'
      ]
    };
  }
}
