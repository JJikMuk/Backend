export interface NutritionalInfo {
  calories?: number;
  carbohydrates?: number;
  protein?: number;
  fat?: number;
  sodium?: number;
  sugar?: number;
  fiber?: number;
  cholesterol?: number;
  unit?: string;
}

export interface OCRParsedData {
  productName?: string;
  nutritionalInfo: NutritionalInfo;
  ingredients?: string[];
  allergens?: string[];
  manufacturingDate?: string;
  expirationDate?: string;
  manufacturer?: string;
  confidence: number;
}

export interface FastAPIOCRResponse {
  success: boolean;
  extractedText?: string;
  confidence?: number;
  error?: string;
}

export interface OCRScanRecord {
  id: string;
  userId: string;
  imageUrl: string;
  extractedText: string;
  parsedData: OCRParsedData;
  confidence: number;
  createdAt: Date;
}
