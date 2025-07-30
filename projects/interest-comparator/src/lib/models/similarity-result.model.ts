export interface SimilarityResult {
  user1Interests: string[];
  user2Interests: string[];
  similarityMatrix: number[][];
  orderedUser1Interests: string[];
  orderedUser2Interests: string[];
}

export interface InterestSimilarity {
  interest1: string;
  interest2: string;
  similarity: number;
}

export interface FaceAlignmentResult {
  originalImage: string;
  alignedImage: string;
  success: boolean;
  error?: string;
}
