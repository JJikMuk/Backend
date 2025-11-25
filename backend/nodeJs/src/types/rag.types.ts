import { OCRParsedData } from "./ocr.types";
import { UserProfile } from "./profile.types";

export interface RAGAnalysisRequest {
  userId: string;
  productData: OCRParsedData;
  userProfile: UserProfile;
}

export interface RAGRecommendation {
  suitability: "safe" | "warning" | "danger";
  score: number;
  recommendations: string[];
  alternatives?: Array<{
    productName: string;
    reason: string;
  }>;
  nutritionalAdvice: string;
}

export interface RAGAnalysisResponse {
  success: boolean;
  analysis?: RAGRecommendation;
  error?: string;
}

export interface RAGAnalysisRecord {
  id: string;
  userId: string;
  ocrScanId?: string;
  requestData: RAGAnalysisRequest;
  ragResponse: RAGRecommendation;
  suitabilityScore: number;
  createdAt: Date;
}
