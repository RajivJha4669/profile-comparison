import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, firstValueFrom } from 'rxjs';
import { catchError, timeout, map } from 'rxjs/operators';

export interface FaceDetectionResult {
  faces: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
  success: boolean;
  error?: string;
  source?: string; // Track which API was used
}

@Injectable({
  providedIn: 'root'
})
export class FaceDetectService {
  private apiUrl = 'https://api.api-ninjas.com/v1/facedetect';
  private apiKey = '46ZRfGqxZ6v+Q5rG+mA3iQ==FwYzYB5gU69IPZxk';

  constructor(private http: HttpClient) {}

  setApiKey(key: string) {
    this.apiKey = key;
  }

  // Detect faces in an image file
  detectFaces(imageFile: File): Observable<FaceDetectionResult> {
    console.log('🔍 Starting face detection for file:', {
      name: imageFile.name,
      size: imageFile.size,
      type: imageFile.type
    });

    const formData = new FormData();
    formData.append('image', imageFile);

    // Don't set Content-Type header - let Angular handle it for FormData
    const headers = new HttpHeaders({
      'X-Api-Key': this.apiKey
      // Removed Accept header to let the API respond with its default format
    });

    console.log('📡 Sending request to API:', this.apiUrl);
    console.log('🔑 Using API key:', this.apiKey ? 'Present' : 'Missing');

    return this.http.post<any>(
      this.apiUrl,
      formData,
      { headers }
    ).pipe(
      timeout(15000),
      map(response => {
        console.log('✅ Face detection API response:', response);

        // Handle different response formats
        let faces = [];
        if (Array.isArray(response)) {
          faces = response;
        } else if (response && Array.isArray(response.faces)) {
          faces = response.faces;
        } else if (response && typeof response === 'object') {
          console.warn('⚠️ Unexpected response format:', response);
          faces = [];
        }

        return {
          faces: faces,
          success: true,
          source: 'api-ninjas'
        };
      }),
      catchError(error => {
        console.error('❌ Face detection API error:', error);
        console.error('Error details:', {
          status: error.status,
          message: error.message,
          error: error.error
        });

        return of({
          faces: [],
          success: false,
          error: `API Error: ${error.status || 'Unknown'} - ${error.message || error.error?.error || 'Face detection failed'}`,
          source: 'error'
        });
      })
    );
  }

  // Detect faces from an image URL
  async detectFacesFromUrl(imageUrl: string): Promise<FaceDetectionResult> {
    console.log('🌐 Starting face detection from URL:', imageUrl);

    try {
      // First validate the image URL
      console.log('✅ Step 1: Validating image URL...');
      const isValidImage = await this.validateProfileImage(imageUrl);
      if (!isValidImage) {
        console.warn('❌ Image validation failed');
        return {
          faces: [],
          success: false,
          error: 'Invalid image URL or image cannot be loaded',
          source: 'validation'
        };
      }
      console.log('✅ Image validation passed');

      // Fetch the image with better error handling
      console.log('📥 Step 2: Fetching image...');
      let response: Response;
      try {
        response = await fetch(imageUrl, {
          mode: 'cors',
          headers: {
            'Accept': 'image/*',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        console.log('✅ CORS fetch successful');
      } catch (fetchError) {
        console.warn('⚠️ CORS fetch failed, trying no-cors mode:', fetchError);
        try {
          response = await fetch(imageUrl, {
            mode: 'no-cors'
          });
          console.log('✅ No-CORS fetch successful');
        } catch (noCorsError) {
          throw new Error(`Failed to fetch image with both CORS modes: ${fetchError}, ${noCorsError}`);
        }
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }

      console.log('📄 Step 3: Converting to blob...');
      const blob = await response.blob();
      console.log('📊 Blob info:', {
        type: blob.type,
        size: blob.size,
        sizeKB: Math.round(blob.size / 1024)
      });

      // Validate blob type
      if (blob.type && !blob.type.startsWith('image/')) {
        throw new Error(`Invalid content type: ${blob.type}. Expected image.`);
      }

      const file = new File([blob], 'profile.jpg', { type: blob.type || 'image/jpeg' });

      // Validate file size (API might have limits)
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        throw new Error('Image file too large. Maximum size is 10MB.');
      }

      console.log('🚀 Step 4: Sending to face detection API...');
      console.log(`📎 File details: ${file.name}, size: ${file.size} bytes, type: ${file.type}`);

      // Try face detection
      const result = await firstValueFrom(this.detectFaces(file));
      console.log('🎯 Face detection result:', result);

      return result || {
        faces: [],
        success: false,
        error: 'No result from face detection',
        source: 'unknown'
      };
    } catch (error) {
      console.error('💥 Face detection from URL failed:', error);
      return {
        faces: [],
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: 'error'
      };
    }
  }

  // Enhanced image validation with better error handling
  validateProfileImage(imageUrl: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      const timeoutId = setTimeout(() => {
        resolve(false);
      }, 10000); // 10 second timeout

      img.onload = () => {
        clearTimeout(timeoutId);
        // Check if image has reasonable dimensions
        if (img.width < 50 || img.height < 50) {
          resolve(false);
        } else {
          resolve(true);
        }
      };

      img.onerror = () => {
        clearTimeout(timeoutId);
        resolve(false);
      };

      img.src = imageUrl;
    });
  }

  // Get API status for debugging
  getApiStatus(): { available: boolean; hasKey: boolean } {
    return {
      available: true,
      hasKey: !!this.apiKey
    };
  }

  // Quick API connectivity test
  async testApiQuick(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      console.log('🧪 Quick API test starting...');

      // Test with minimal payload
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'X-Api-Key': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });

      const responseText = await response.text();
      console.log('🧪 Quick test response:', { status: response.status, text: responseText });

      return {
        success: response.status !== 401 && response.status !== 403,
        message: `API responded with status ${response.status}`,
        details: {
          status: response.status,
          statusText: response.statusText,
          response: responseText
        }
      };
    } catch (error) {
      console.error('🧪 Quick API test failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown test error'
      };
    }
  }

  // Test method to verify API connectivity
  async testApiConnection(): Promise<{ success: boolean; message: string }> {
    try {
      // Create a small test image (1x1 pixel PNG)
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(0, 0, 100, 100);
      }

      return new Promise((resolve) => {
        canvas.toBlob(async (blob) => {
          if (!blob) {
            resolve({ success: false, message: 'Failed to create test image' });
            return;
          }

          const testFile = new File([blob], 'test.png', { type: 'image/png' });
          console.log('Testing API with file:', testFile.name, testFile.size, testFile.type);

          try {
            const result = await firstValueFrom(this.detectFaces(testFile));
            resolve({
              success: result.success,
              message: result.success ? 'API is working correctly' : (result.error || 'API test failed')
            });
          } catch (error) {
            resolve({
              success: false,
              message: error instanceof Error ? error.message : 'Unknown API test error'
            });
          }
        }, 'image/png');
      });
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create test image'
      };
    }
  }
}
