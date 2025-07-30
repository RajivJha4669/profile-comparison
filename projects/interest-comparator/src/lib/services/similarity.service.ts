// similarity.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError, from } from 'rxjs';
import { map, catchError, timeout, switchMap } from 'rxjs/operators';
import { SimilarityResult, InterestSimilarity } from '../models/similarity-result.model';

@Injectable({
  providedIn: 'root'
})
export class SimilarityService {
  private apiUrl = 'https://api.api-ninjas.com/v1/textsimilarity';
  private apiKey = '46ZRfGqxZ6v+Q5rG+mA3iQ==FwYzYB5gU69IPZxk';

  constructor(private http: HttpClient) {}

  // Method to set API key from environment
  setApiKey(key: string) {
    this.apiKey = key;
  }

  async orderInterests(
    user1Interests: string[],
    user2Interests: string[],
    user3Interests: string[] = []
  ): Promise<SimilarityResult> {
    try {
      console.log('🔄 Starting interest ordering with API calls...');

      // Combine all interests for comparison
      const allInterests = [...user1Interests, ...user2Interests, ...user3Interests];

      // Build similarity matrix using API calls (limited to avoid too many calls)
      console.log('📊 Building similarity matrix with API...');
      const similarityMatrix = await this.buildSimilarityMatrixOptimized(allInterests);

      // Order interests based on the design rules using API results
      const orderedUser1Interests = this.orderUser1Interests(user1Interests, user2Interests, user3Interests, allInterests, similarityMatrix);
      const orderedUser2Interests = this.orderUser2Interests(user2Interests, user1Interests, user3Interests, allInterests, similarityMatrix);

      console.log('✅ Interest ordering complete using API');

      return {
        user1Interests,
        user2Interests,
        similarityMatrix,
        orderedUser1Interests,
        orderedUser2Interests
      };
    } catch (error) {
      console.warn('Similarity API failed, using fallback ordering:', error);
      // Fallback to original order if API fails
      return {
        user1Interests,
        user2Interests,
        similarityMatrix: [],
        orderedUser1Interests: user1Interests,
        orderedUser2Interests: user2Interests
      };
    }
  }

  private async buildSimilarityMatrixOptimized(interests: string[]): Promise<number[][]> {
    const matrix: number[][] = [];
    const maxComparisons = 20; // Limit API calls to prevent rate limiting
    let comparisonCount = 0;

    for (let i = 0; i < interests.length; i++) {
      matrix[i] = [];
      for (let j = 0; j < interests.length; j++) {
        if (i === j) {
          matrix[i][j] = 1; // Same item
        } else if (j < i) {
          matrix[i][j] = matrix[j][i]; // Use cached value
        } else {
          if (comparisonCount < maxComparisons) {
            try {
              matrix[i][j] = await this.getSimilarityScore(interests[i], interests[j]);
              comparisonCount++;
            } catch (error) {
              console.warn(`API call failed for comparison ${i}-${j}, using fallback`);
              matrix[i][j] = this.calculateFallbackSimilarity(interests[i], interests[j]);
            }
          } else {
            // Use fallback for remaining comparisons
            matrix[i][j] = this.calculateFallbackSimilarity(interests[i], interests[j]);
          }
        }
      }
    }

    console.log(`📊 Built similarity matrix with ${comparisonCount} API calls`);
    return matrix;
  }

  private orderUser1Interests(
    user1Interests: string[],
    user2Interests: string[],
    user3Interests: string[],
    allInterests: string[],
    matrix: number[][]
  ): string[] {
    if (matrix.length === 0) {
      return this.orderUser1InterestsFallback(user1Interests, user2Interests, user3Interests);
    }

    const interestScores = user1Interests.map(interest => {
      const index = allInterests.indexOf(interest);
      if (index === -1) return { interest, score: 0 };

      let totalScore = 0;
      let scoreCount = 0;

      // Rule 1: User 3's Influence - If User 3 also has that interest, put it closer to the top
      if (user3Interests.includes(interest)) {
        totalScore += 0.8; // High score for User 3 match
        scoreCount++;
      }

      // Rule 2: User 1's Own Similarity - The more similar User 1's interests are to their own interests, the closer they should be
      for (const otherInterest of user1Interests) {
        if (otherInterest !== interest) {
          const otherIndex = allInterests.indexOf(otherInterest);
          if (otherIndex !== -1) {
            totalScore += matrix[index][otherIndex] * 0.6; // Medium weight for self-similarity
            scoreCount++;
          }
        }
      }

      // Rule 3: User 1 vs User 2 Similarity - The more similar User 1's interests are to User 2's interests, the closer they should be
      for (const user2Interest of user2Interests) {
        const user2Index = allInterests.indexOf(user2Interest);
        if (user2Index !== -1) {
          totalScore += matrix[index][user2Index] * 0.4; // Lower weight for cross-user similarity
          scoreCount++;
        }
      }

      const avgScore = scoreCount > 0 ? totalScore / scoreCount : 0;
      return { interest, score: avgScore };
    });

    // Sort by similarity score (highest first)
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
    if (matrix.length === 0) {
      return this.orderUser2InterestsFallback(user2Interests, user1Interests, user3Interests);
    }

    const interestScores = user2Interests.map(interest => {
      const index = allInterests.indexOf(interest);
      if (index === -1) return { interest, score: 0 };

      let totalScore = 0;
      let scoreCount = 0;

      // Rule 1: User 3's Influence - If User 3 also has that interest, put it closer to the top
      if (user3Interests.includes(interest)) {
        totalScore += 0.8; // High score for User 3 match
        scoreCount++;
      }

      // Rule 2: User 2's Own Similarity - The more similar User 2's interests are to their own interests, the closer they should be
      for (const otherInterest of user2Interests) {
        if (otherInterest !== interest) {
          const otherIndex = allInterests.indexOf(otherInterest);
          if (otherIndex !== -1) {
            totalScore += matrix[index][otherIndex] * 0.6; // Medium weight for self-similarity
            scoreCount++;
          }
        }
      }

      // Rule 3: User 2 vs User 1 Similarity - The more similar User 2's interests are to User 1's interests, the closer they should be
      for (const user1Interest of user1Interests) {
        const user1Index = allInterests.indexOf(user1Interest);
        if (user1Index !== -1) {
          totalScore += matrix[index][user1Index] * 0.4; // Lower weight for cross-user similarity
          scoreCount++;
        }
      }

      const avgScore = scoreCount > 0 ? totalScore / scoreCount : 0;
      return { interest, score: avgScore };
    });

    // Sort by similarity score (highest first)
    return interestScores
      .sort((a, b) => b.score - a.score)
      .map(item => item.interest);
  }

  private orderUser1InterestsFallback(
    user1Interests: string[],
    user2Interests: string[],
    user3Interests: string[]
  ): string[] {
    const interestScores = user1Interests.map(interest => {
      let totalScore = 0;
      let scoreCount = 0;

      // Rule 1: User 3's Influence - If User 3 also has that interest, put it closer to the top
      if (user3Interests.includes(interest)) {
        totalScore += 0.8; // High score for User 3 match
        scoreCount++;
      }

      // Rule 2: User 1's Own Similarity - Check for similar interests within User 1
      for (const otherInterest of user1Interests) {
        if (otherInterest !== interest) {
          const similarity = this.calculateFallbackSimilarity(interest, otherInterest);
          totalScore += similarity * 0.6; // Medium weight for self-similarity
          scoreCount++;
        }
      }

      // Rule 3: User 1 vs User 2 Similarity - Check similarity with User 2's interests
      for (const user2Interest of user2Interests) {
        const similarity = this.calculateFallbackSimilarity(interest, user2Interest);
        totalScore += similarity * 0.4; // Lower weight for cross-user similarity
        scoreCount++;
      }

      const avgScore = scoreCount > 0 ? totalScore / scoreCount : 0;
      return { interest, score: avgScore };
    });

    // Sort by similarity score (highest first)
    return interestScores
      .sort((a, b) => b.score - a.score)
      .map(item => item.interest);
  }

  private orderUser2InterestsFallback(
    user2Interests: string[],
    user1Interests: string[],
    user3Interests: string[]
  ): string[] {
    const interestScores = user2Interests.map(interest => {
      let totalScore = 0;
      let scoreCount = 0;

      // Rule 1: User 3's Influence - If User 3 also has that interest, put it closer to the top
      if (user3Interests.includes(interest)) {
        totalScore += 0.8; // High score for User 3 match
        scoreCount++;
      }

      // Rule 2: User 2's Own Similarity - Check for similar interests within User 2
      for (const otherInterest of user2Interests) {
        if (otherInterest !== interest) {
          const similarity = this.calculateFallbackSimilarity(interest, otherInterest);
          totalScore += similarity * 0.6; // Medium weight for self-similarity
          scoreCount++;
        }
      }

      // Rule 3: User 2 vs User 1 Similarity - Check similarity with User 1's interests
      for (const user1Interest of user1Interests) {
        const similarity = this.calculateFallbackSimilarity(interest, user1Interest);
        totalScore += similarity * 0.4; // Lower weight for cross-user similarity
        scoreCount++;
      }

      const avgScore = scoreCount > 0 ? totalScore / scoreCount : 0;
      return { interest, score: avgScore };
    });

    // Sort by similarity score (highest first)
    return interestScores
      .sort((a, b) => b.score - a.score)
      .map(item => item.interest);
  }

  private async buildSimilarityMatrix(interests: string[]): Promise<number[][]> {
    const matrix: number[][] = [];

    for (let i = 0; i < interests.length; i++) {
      matrix[i] = [];
      for (let j = 0; j < interests.length; j++) {
        if (i === j) {
          matrix[i][j] = 1; // Same item
        } else if (j < i) {
          matrix[i][j] = matrix[j][i]; // Use cached value
        } else {
          matrix[i][j] = await this.getSimilarityScore(interests[i], interests[j]);
        }
      }
    }

    return matrix;
  }

  private async getSimilarityScore(text1: string, text2: string): Promise<number> {
    try {
      const headers = new HttpHeaders({
        'X-Api-Key': this.apiKey,
        'Content-Type': 'application/json'
      });

      const response = await this.http.post<{ similarity: number }>(
        this.apiUrl,
        { text_1: text1, text_2: text2 },
        { headers }
      ).pipe(
        timeout(3000), // 3 second timeout
        catchError(error => {
          console.warn(`Similarity API error for "${text1}" vs "${text2}":`, error);
          return of({ similarity: this.calculateFallbackSimilarity(text1, text2) });
        })
      ).toPromise();

      return response?.similarity ?? this.calculateFallbackSimilarity(text1, text2);
    } catch (error) {
      console.warn(`Similarity API failed for "${text1}" vs "${text2}":`, error);
      return this.calculateFallbackSimilarity(text1, text2);
    }
  }

  private calculateFallbackSimilarity(text1: string, text2: string): number {
    // Simple fallback similarity calculation based on string similarity
    const normalized1 = text1.toLowerCase().trim();
    const normalized2 = text2.toLowerCase().trim();

    if (normalized1 === normalized2) return 1;

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

    return 0.1; // Default low similarity
  }

  // Method to get similarity between two specific interests
  getInterestSimilarity(interest1: string, interest2: string): Observable<number> {
    return from(this.getSimilarityScore(interest1, interest2)).pipe(
      catchError(error => {
        console.warn(`Error getting similarity for "${interest1}" vs "${interest2}":`, error);
        return of(this.calculateFallbackSimilarity(interest1, interest2));
      })
    );
  }

  // Method to find shared interests (similarity >= 0.8)
  findSharedInterests(user1Interests: string[], user2Interests: string[]): Observable<string[]> {
    console.log('🔍 Finding shared interests with API calls...');

    // Create an array of promises for similarity checks
    const similarityChecks = user1Interests.flatMap(interest1 =>
      user2Interests.map(interest2 =>
        this.getInterestSimilarity(interest1, interest2).toPromise()
          .then(similarity => ({ interest1, interest2, similarity: similarity ?? 0 }))
      )
    );

    return from(Promise.all(similarityChecks)).pipe(
      map(results => {
        const shared: string[] = [];
        for (const result of results) {
          if (result.similarity >= 0.8) {
            // Use User 2's interest as the shared interest (as per design)
            if (!shared.includes(result.interest2)) {
              shared.push(result.interest2);
            }
          }
        }
        console.log('✅ Shared interests found:', shared);
        return shared.slice(0, 2); // Limit to 2 shared interests for display
      }),
      catchError(error => {
        console.warn('Error finding shared interests:', error);
        return of(this.findSharedInterestsFallback(user1Interests, user2Interests));
      })
    );
  }

  private findSharedInterestsFallback(user1Interests: string[], user2Interests: string[]): string[] {
    const shared: string[] = [];

    for (const interest1 of user1Interests) {
      for (const interest2 of user2Interests) {
        if (this.calculateFallbackSimilarity(interest1, interest2) >= 0.8) {
          if (!shared.includes(interest2)) {
            shared.push(interest2);
          }
        }
      }
    }

    return shared.slice(0, 2);
  }
}
