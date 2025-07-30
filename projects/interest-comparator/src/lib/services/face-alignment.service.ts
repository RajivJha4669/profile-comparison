import { Injectable } from '@angular/core';
import { FaceDetectService, FaceDetectionResult } from './face-align.service';

export interface AlignmentResult {
  success: boolean;
  user1AlignedImage?: string; // Base64 data URL
  user2AlignedImage?: string; // Base64 data URL
  user1FaceData?: FaceData;
  user2FaceData?: FaceData;
  error?: string;
}

export interface FaceData {
  x: number;
  y: number;
  width: number;
  height: number;
  eyeCenter?: { x: number; y: number };
}

@Injectable({
  providedIn: 'root'
})
export class FaceAlignmentService {
  constructor(private faceDetectService: FaceDetectService) {}

  /**
   * Align two user images eye-to-eye for consistent comparison
   */
  async alignUserImages(user1ImageUrl: string, user2ImageUrl: string): Promise<AlignmentResult> {
    try {
      console.log('Starting face alignment for two users...');

      // Detect faces in both images
      const [user1Detection, user2Detection] = await Promise.all([
        this.faceDetectService.detectFacesFromUrl(user1ImageUrl),
        this.faceDetectService.detectFacesFromUrl(user2ImageUrl)
      ]);

      // Check if face detection was successful for both users
      if (!user1Detection.success || !user2Detection.success) {
        return {
          success: false,
          error: `Face detection failed: User1=${user1Detection.success}, User2=${user2Detection.success}. ` +
                 `Errors: ${user1Detection.error || 'none'}, ${user2Detection.error || 'none'}`
        };
      }

      // Check if faces were found
      if (user1Detection.faces.length === 0 || user2Detection.faces.length === 0) {
        return {
          success: false,
          error: `No faces detected: User1=${user1Detection.faces.length} faces, User2=${user2Detection.faces.length} faces`
        };
      }

      // Get the largest face from each image (assuming it's the main subject)
      const user1Face = this.getLargestFace(user1Detection.faces);
      const user2Face = this.getLargestFace(user2Detection.faces);

      // Calculate estimated eye positions
      const user1FaceData: FaceData = {
        ...user1Face,
        eyeCenter: this.estimateEyeCenter(user1Face)
      };

      const user2FaceData: FaceData = {
        ...user2Face,
        eyeCenter: this.estimateEyeCenter(user2Face)
      };

      // Load and align the images
      const [user1AlignedImage, user2AlignedImage] = await Promise.all([
        this.alignImageToStandardSize(user1ImageUrl, user1FaceData),
        this.alignImageToStandardSize(user2ImageUrl, user2FaceData)
      ]);

      return {
        success: true,
        user1AlignedImage,
        user2AlignedImage,
        user1FaceData,
        user2FaceData
      };

    } catch (error) {
      console.error('Face alignment error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown alignment error'
      };
    }
  }

  /**
   * Get the largest face from detected faces (most likely to be the main subject)
   */
  private getLargestFace(faces: Array<{ x: number; y: number; width: number; height: number }>) {
    return faces.reduce((largest, current) => {
      const currentArea = current.width * current.height;
      const largestArea = largest.width * largest.height;
      return currentArea > largestArea ? current : largest;
    });
  }

  /**
   * Estimate eye center position based on face bounding box
   * Eyes are typically located at about 1/3 down from the top of the face
   * and centered horizontally
   */
  private estimateEyeCenter(face: { x: number; y: number; width: number; height: number }) {
    return {
      x: face.x + (face.width / 2),
      y: face.y + (face.height * 0.35) // Eyes are roughly 35% down from top of face
    };
  }

  /**
   * Align image to standard size with face centered and eyes at consistent position
   */
  private async alignImageToStandardSize(imageUrl: string, faceData: FaceData): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          // Standard output size
          const outputSize = 300;
          canvas.width = outputSize;
          canvas.height = outputSize;

          // Calculate scaling and positioning
          const scale = outputSize / Math.max(faceData.width, faceData.height) * 0.8; // Scale face to 80% of canvas
          const scaledFaceWidth = faceData.width * scale;
          const scaledFaceHeight = faceData.height * scale;

          // Center the face in the canvas
          const targetX = (outputSize - scaledFaceWidth) / 2;
          const targetY = (outputSize - scaledFaceHeight) / 2;

          // Calculate source position to crop around the face
          const sourceX = Math.max(0, faceData.x - (faceData.width * 0.3)); // Include some margin
          const sourceY = Math.max(0, faceData.y - (faceData.height * 0.4)); // Include forehead
          const sourceWidth = Math.min(img.width - sourceX, faceData.width * 1.6);
          const sourceHeight = Math.min(img.height - sourceY, faceData.height * 1.8);

          // Draw the aligned image
          ctx.fillStyle = '#f0f0f0'; // Light gray background
          ctx.fillRect(0, 0, outputSize, outputSize);

          ctx.drawImage(
            img,
            sourceX, sourceY, sourceWidth, sourceHeight,
            targetX, targetY, scaledFaceWidth, scaledFaceHeight
          );

          // Draw face detection overlay for debugging
          if (faceData.eyeCenter) {
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 2;
            ctx.strokeRect(targetX, targetY, scaledFaceWidth, scaledFaceHeight);

            // Draw eye center point
            ctx.fillStyle = '#ff0000';
            ctx.beginPath();
            const eyeX = targetX + (faceData.eyeCenter.x - faceData.x) * scale;
            const eyeY = targetY + (faceData.eyeCenter.y - faceData.y) * scale;
            ctx.arc(eyeX, eyeY, 3, 0, 2 * Math.PI);
            ctx.fill();
          }

          resolve(canvas.toDataURL('image/jpeg', 0.9));
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load image for alignment'));
      };

      img.src = imageUrl;
    });
  }

  /**
   * Get debug information about face detection
   */
  async getDebugInfo(imageUrl: string): Promise<any> {
    try {
      const detection = await this.faceDetectService.detectFacesFromUrl(imageUrl);

      return {
        imageUrl,
        detection,
        faces: detection.faces.map(face => ({
          ...face,
          area: face.width * face.height,
          estimatedEyes: this.estimateEyeCenter(face)
        }))
      };
    } catch (error) {
      return {
        imageUrl,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
