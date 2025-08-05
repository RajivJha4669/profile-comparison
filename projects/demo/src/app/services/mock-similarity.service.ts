import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface SimilarityResult {
  user1Interests: string[];
  user2Interests: string[];
  similarityMatrix: number[][];
  orderedUser1Interests: string[];
  orderedUser2Interests: string[];
}

export interface InterestSimilarity {
  interest: string;
  score: number;
}

@Injectable({
  providedIn: 'root'
})
export class MockSimilarityService {
  private apiKey = 'mock-api-key';

  constructor() {}

  setApiKey(key: string) {
    this.apiKey = key;
    console.log('🔑 Mock API key set:', key);
  }

  async orderInterests(
    user1Interests: string[],
    user2Interests: string[],
    user3Interests: string[] = []
  ): Promise<SimilarityResult> {
    console.log('🔄 Mock: Starting interest ordering...');

    // Simulate API delay
    await this.delay(800);

    // Create a mock similarity matrix with realistic values
    const allInterests = [...user1Interests, ...user2Interests, ...user3Interests];
    const similarityMatrix = this.buildMockSimilarityMatrix(allInterests);

    // Order interests based on mock similarity scores
    const orderedUser1Interests = this.orderUser1Interests(user1Interests, user2Interests, user3Interests, allInterests, similarityMatrix);
    const orderedUser2Interests = this.orderUser2Interests(user2Interests, user1Interests, user3Interests, allInterests, similarityMatrix);

    console.log('✅ Mock: Interest ordering complete');
    console.log('📋 Mock ordered User 1 interests:', orderedUser1Interests);
    console.log('📋 Mock ordered User 2 interests:', orderedUser2Interests);

    return {
      user1Interests,
      user2Interests,
      similarityMatrix,
      orderedUser1Interests,
      orderedUser2Interests
    };
  }

  private buildMockSimilarityMatrix(interests: string[]): number[][] {
    const matrix: number[][] = [];

    for (let i = 0; i < interests.length; i++) {
      matrix[i] = [];
      for (let j = 0; j < interests.length; j++) {
        if (i === j) {
          matrix[i][j] = 1; // Same item
        } else {
          // Create mock similarity scores based on interest relationships
          matrix[i][j] = this.calculateMockSimilarity(interests[i], interests[j]);
        }
      }
    }

    return matrix;
  }

  private calculateMockSimilarity(interest1: string, interest2: string): number {
    const normalized1 = interest1.toLowerCase().trim();
    const normalized2 = interest2.toLowerCase().trim();

    // Define mock similarity relationships for demo purposes
    const similarityRules = [
      // Technology cluster
      { interests: ['gaming', 'technology'], score: 0.85 },
      { interests: ['technology', 'programming'], score: 0.9 },
      { interests: ['gaming', 'programming'], score: 0.7 },

      // Entertainment cluster
      { interests: ['movies', 'music'], score: 0.75 },
      { interests: ['movies', 'art'], score: 0.6 },
      { interests: ['music', 'dancing'], score: 0.8 },
      { interests: ['art', 'photography'], score: 0.85 },

      // Active lifestyle cluster
      { interests: ['travel', 'photography'], score: 0.8 },
      { interests: ['sports', 'fitness'], score: 0.9 },
      { interests: ['travel', 'adventure'], score: 0.85 },

      // Creative cluster
      { interests: ['art', 'design'], score: 0.9 },
      { interests: ['music', 'art'], score: 0.7 },
      { interests: ['photography', 'design'], score: 0.8 },

      // Social cluster
      { interests: ['cooking', 'social'], score: 0.7 },
      { interests: ['dancing', 'social'], score: 0.8 },

      // Relaxation cluster
      { interests: ['reading', 'movies'], score: 0.6 },
      { interests: ['reading', 'writing'], score: 0.85 },
    ];

    // Check for exact matches first
    if (normalized1 === normalized2) return 1;

    // Check predefined similarity rules
    for (const rule of similarityRules) {
      if (rule.interests.includes(normalized1) && rule.interests.includes(normalized2)) {
        return rule.score;
      }
    }

    // Check for partial matches
    if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
      return 0.7;
    }

    // Check for common words
    const words1 = normalized1.split(/\s+/);
    const words2 = normalized2.split(/\s+/);
    const commonWords = words1.filter(word => words2.includes(word));

    if (commonWords.length > 0) {
      return Math.min(0.5, commonWords.length / Math.max(words1.length, words2.length));
    }

    // Random low similarity for unrelated interests
    return Math.random() * 0.3 + 0.1; // Between 0.1 and 0.4
  }

  private orderUser1Interests(
    user1Interests: string[],
    user2Interests: string[],
    user3Interests: string[],
    allInterests: string[],
    matrix: number[][]
  ): string[] {
    const interestScores = user1Interests.map(interest => {
      const index = allInterests.indexOf(interest);
      if (index === -1) return { interest, score: 0 };

      let totalScore = 0;
      let scoreCount = 0;

      // Rule 1: User 3's Influence
      if (user3Interests.includes(interest)) {
        totalScore += 0.8;
        scoreCount++;
      }

      // Rule 2: User 1's Own Similarity
      for (const otherInterest of user1Interests) {
        if (otherInterest !== interest) {
          const otherIndex = allInterests.indexOf(otherInterest);
          if (otherIndex !== -1) {
            totalScore += matrix[index][otherIndex] * 0.6;
            scoreCount++;
          }
        }
      }

      // Rule 3: User 1 vs User 2 Similarity
      for (const user2Interest of user2Interests) {
        const user2Index = allInterests.indexOf(user2Interest);
        if (user2Index !== -1) {
          totalScore += matrix[index][user2Index] * 0.4;
          scoreCount++;
        }
      }

      const avgScore = scoreCount > 0 ? totalScore / scoreCount : 0;
      return { interest, score: avgScore };
    });

    return interestScores
      .sort((a, b) => b.score - a.score)
      .map(item => item.interest);
  }

  private orderUser2Interests(
    user2Interests: string[],
    user1Interests: string[],
    user3Interests: string[],
    allInterests: string[],
    matrix: number[][]
  ): string[] {
    const interestScores = user2Interests.map(interest => {
      const index = allInterests.indexOf(interest);
      if (index === -1) return { interest, score: 0 };

      let totalScore = 0;
      let scoreCount = 0;

      // Rule 1: User 3's Influence
      if (user3Interests.includes(interest)) {
        totalScore += 0.8;
        scoreCount++;
      }

      // Rule 2: User 2's Own Similarity
      for (const otherInterest of user2Interests) {
        if (otherInterest !== interest) {
          const otherIndex = allInterests.indexOf(otherInterest);
          if (otherIndex !== -1) {
            totalScore += matrix[index][otherIndex] * 0.6;
            scoreCount++;
          }
        }
      }

      // Rule 3: User 2 vs User 1 Similarity
      for (const user1Interest of user1Interests) {
        const user1Index = allInterests.indexOf(user1Interest);
        if (user1Index !== -1) {
          totalScore += matrix[index][user1Index] * 0.4;
          scoreCount++;
        }
      }

      const avgScore = scoreCount > 0 ? totalScore / scoreCount : 0;
      return { interest, score: avgScore };
    });

    return interestScores
      .sort((a, b) => b.score - a.score)
      .map(item => item.interest);
  }

  getInterestSimilarity(interest1: string, interest2: string): Observable<number> {
    const similarity = this.calculateMockSimilarity(interest1, interest2);
    return of(similarity).pipe(delay(100)); // Simulate API delay
  }

  findSharedInterests(user1Interests: string[], user2Interests: string[]): Observable<string[]> {
    console.log('🔍 Mock: Finding shared interests...');

    const shared: string[] = [];
    const threshold = 0.75; // Slightly lower threshold for demo

    for (const interest1 of user1Interests) {
      for (const interest2 of user2Interests) {
        const similarity = this.calculateMockSimilarity(interest1, interest2);
        if (similarity >= threshold) {
          // Use User 2's interest as the shared interest
          if (!shared.includes(interest2)) {
            shared.push(interest2);
          }
        }
      }
    }

    console.log('✅ Mock: Shared interests found:', shared);
    return of(shared.slice(0, 2)).pipe(delay(300)); // Simulate API delay
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
