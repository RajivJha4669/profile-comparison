import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface FaceDetectionResult {
  faces: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
  success: boolean;
  error?: string;
  source?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MockFaceDetectService {
  private apiKey = 'mock-api-key';

  constructor() {}

  setApiKey(key: string) {
    this.apiKey = key;
    console.log('🔑 Mock Face Detection API key set:', key);
  }

  detectFaces(imageFile: File): Observable<FaceDetectionResult> {
    console.log('🔍 Mock: Starting face detection for file:', {
      name: imageFile.name,
      size: imageFile.size,
      type: imageFile.type
    });

    // Simulate realistic face detection results
    const mockFaces = this.generateMockFaces();

    return of({
      faces: mockFaces,
      success: true,
      source: 'mock-api'
    }).pipe(delay(800)); // Simulate API delay
  }

  async detectFacesFromUrl(imageUrl: string): Promise<FaceDetectionResult> {
    console.log('🌐 Mock: Starting face detection from URL:', imageUrl);

    // Simulate processing time
    await this.delay(1000);

    // Generate mock face detection results based on the image URL
    const mockFaces = this.generateMockFacesForUrl(imageUrl);

    console.log('✅ Mock: Face detection complete:', mockFaces);

    return {
      faces: mockFaces,
      success: true,
      source: 'mock-api'
    };
  }

  private generateMockFaces(): Array<{ x: number; y: number; width: number; height: number }> {
    // Generate 1-2 realistic face bounding boxes
    const faceCount = Math.random() > 0.3 ? 1 : 2; // 70% chance of 1 face, 30% chance of 2 faces
    const faces = [];

    for (let i = 0; i < faceCount; i++) {
      // Generate realistic face dimensions (typical face in a portrait photo)
      const width = 80 + Math.random() * 40; // 80-120 pixels wide
      const height = width * (1.2 + Math.random() * 0.3); // Slightly taller than wide

      // Position faces in realistic locations
      const x = i === 0 ?
        100 + Math.random() * 100 : // First face: left-center area
        200 + Math.random() * 50;   // Second face: right-center area

      const y = 50 + Math.random() * 100; // Upper portion of image

      faces.push({
        x: Math.round(x),
        y: Math.round(y),
        width: Math.round(width),
        height: Math.round(height)
      });
    }

    return faces;
  }

  private generateMockFacesForUrl(imageUrl: string): Array<{ x: number; y: number; width: number; height: number }> {
    // Generate consistent mock results based on URL hash for predictable demo
    const urlHash = this.hashCode(imageUrl);
    const seedRandom = this.seededRandom(urlHash);

    // Use seeded random for consistent results
    const faceCount = seedRandom() > 0.3 ? 1 : 0; // 70% chance of detecting a face
    const faces = [];

    if (faceCount > 0) {
      // Generate a single realistic face for profile photos
      const width = 90 + seedRandom() * 30; // 90-120 pixels wide
      const height = width * (1.15 + seedRandom() * 0.2); // Slightly taller than wide

      // Center the face in a typical profile photo position
      const x = 120 + seedRandom() * 60; // Center-left to center area
      const y = 40 + seedRandom() * 80; // Upper-middle portion

      faces.push({
        x: Math.round(x),
        y: Math.round(y),
        width: Math.round(width),
        height: Math.round(height)
      });
    }

    return faces;
  }

  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  private seededRandom(seed: number): () => number {
    return function() {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
  }

  validateProfileImage(imageUrl: string): Promise<boolean> {
    console.log('✅ Mock: Validating profile image:', imageUrl);
    // Mock validation - always return true for demo
    return Promise.resolve(true);
  }

  getApiStatus(): { available: boolean; hasKey: boolean } {
    return {
      available: true,
      hasKey: !!this.apiKey
    };
  }

  async testApiQuick(): Promise<{ success: boolean; message: string; details?: any }> {
    await this.delay(500);
    return {
      success: true,
      message: 'Mock API is working perfectly',
      details: {
        status: 200,
        statusText: 'OK',
        response: 'Mock face detection service ready'
      }
    };
  }

  async testApiConnection(): Promise<{ success: boolean; message: string }> {
    await this.delay(800);
    return {
      success: true,
      message: 'Mock API connection test successful'
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
