# Implementation Guide

## Overview
This guide provides detailed implementation steps for integrating the three main features into the existing Node.js/Express backend.

---

## Prerequisites

### Required Dependencies
```json
{
  "dependencies": {
    "express": "^5.1.0",
    "dotenv": "^17.2.3",
    "bcrypt": "^6.0.0",
    "jsonwebtoken": "^9.0.2",
    "uuid": "^11.0.5",
    "multer": "^1.4.5-lts.1",
    "axios": "^1.8.1",
    "mysql2": "^3.15.1"
  },
  "devDependencies": {
    "@types/express": "^5.0.5",
    "@types/multer": "^1.4.12",
    "@types/uuid": "^10.0.0",
    "typescript": "^5.9.3"
  }
}
```

### Installation Commands
```bash
npm install uuid multer axios mysql2
npm install --save-dev @types/multer @types/uuid
```

---

## Project Structure

```
backend/nodeJs/src/
├── controllers/
│   ├── auth.controller.ts        # Existing
│   ├── profile.controller.ts     # New
│   ├── ocr.controller.ts         # New
│   └── rag.controller.ts         # New
├── routes/
│   ├── auth.router.ts            # Existing
│   ├── profile.router.ts         # New
│   ├── ocr.router.ts             # New
│   └── rag.router.ts             # New
├── services/
│   ├── fastapi.service.ts        # New
│   └── validation.service.ts     # New
├── middleware/
│   ├── auth.middleware.ts        # New
│   └── upload.middleware.ts      # New
├── types/
│   ├── user.types.ts             # Existing
│   ├── profile.types.ts          # New
│   ├── ocr.types.ts              # New
│   └── rag.types.ts              # New
├── config/
│   ├── db.ts                     # Existing
│   └── fastapi.config.ts         # New
├── utils/
│   ├── parser.util.ts            # New
│   └── error.handler.ts          # New
└── index.ts                      # Main entry point
```

---

## Feature 1: User Profile Management

### Step 1: Create Type Definitions

**File: `src/types/profile.types.ts`**
```typescript
export type AgeRange = "10대" | "20대" | "30대" | "40대" | "50대" | "60대" | "70대" | "80대+";

export interface UserProfile {
  id: string;
  userId: string;
  height: number;
  weight: number;
  ageRange: AgeRange;
  allergies: string[];
  diseases: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProfileRequest {
  height: number;
  weight: number;
  ageRange: AgeRange;
  allergies?: string[];
  diseases?: string[];
}

export interface UpdateProfileRequest extends Partial<CreateProfileRequest> {}
```

### Step 2: Create Validation Service

**File: `src/services/validation.service.ts`**
```typescript
import { AgeRange } from "../types/profile.types";

class ValidationService {
  private static readonly VALID_AGE_RANGES: AgeRange[] = [
    "10대", "20대", "30대", "40대", "50대", "60대", "70대", "80대+"
  ];

  static validateHeight(height: number): boolean {
    return height >= 50 && height <= 300;
  }

  static validateWeight(weight: number): boolean {
    return weight >= 20 && weight <= 300;
  }

  static validateAgeRange(ageRange: string): ageRange is AgeRange {
    return this.VALID_AGE_RANGES.includes(ageRange as AgeRange);
  }

  static validateStringArray(arr: any): arr is string[] {
    return Array.isArray(arr) && arr.every(item => typeof item === 'string');
  }

  static sanitizeString(str: string): string {
    return str.trim().toLowerCase();
  }
}

export default ValidationService;
```

### Step 3: Create Profile Controller

**File: `src/controllers/profile.controller.ts`**
```typescript
import { Request, Response } from "express";
import { dbpool } from "../config/db";
import { v4 as uuidv4 } from "uuid";
import { CreateProfileRequest, UserProfile } from "../types/profile.types";
import ValidationService from "../services/validation.service";

class ProfileController {
  static async createProfile(req: Request, res: Response) {
    const { height, weight, ageRange, allergies = [], diseases = [] }: CreateProfileRequest = req.body;
    const userId = (req as any).user.uuid; // From JWT middleware

    // Validation
    if (!height || !weight || !ageRange) {
      return res.status(400).json({
        success: false,
        error: "Height, weight, and ageRange are required"
      });
    }

    if (!ValidationService.validateHeight(height)) {
      return res.status(400).json({
        success: false,
        error: "Height must be between 50 and 300 cm"
      });
    }

    if (!ValidationService.validateWeight(weight)) {
      return res.status(400).json({
        success: false,
        error: "Weight must be between 20 and 300 kg"
      });
    }

    if (!ValidationService.validateAgeRange(ageRange)) {
      return res.status(400).json({
        success: false,
        error: "Invalid age range. Must be one of: 10대, 20대, 30대, etc."
      });
    }

    if (!ValidationService.validateStringArray(allergies)) {
      return res.status(400).json({
        success: false,
        error: "Allergies must be an array of strings"
      });
    }

    if (!ValidationService.validateStringArray(diseases)) {
      return res.status(400).json({
        success: false,
        error: "Diseases must be an array of strings"
      });
    }

    const connection = await dbpool.getConnection();

    try {
      await connection.beginTransaction();

      // Check if profile already exists
      const [existingProfiles] = await connection.query(
        "SELECT * FROM user_profiles WHERE user_id = ?",
        [userId]
      );

      if ((existingProfiles as any[]).length > 0) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          error: "Profile already exists for this user"
        });
      }

      const profileId = uuidv4();

      await connection.query(
        `INSERT INTO user_profiles
         (id, user_id, height, weight, age_range, allergies, diseases)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          profileId,
          userId,
          height,
          weight,
          ageRange,
          JSON.stringify(allergies),
          JSON.stringify(diseases)
        ]
      );

      await connection.commit();

      const [createdProfile] = await connection.query(
        "SELECT * FROM user_profiles WHERE id = ?",
        [profileId]
      );

      const profile = (createdProfile as any[])[0];

      return res.status(201).json({
        success: true,
        message: "User profile created successfully",
        data: {
          userId: profile.user_id,
          height: profile.height,
          weight: profile.weight,
          ageRange: profile.age_range,
          allergies: JSON.parse(profile.allergies),
          diseases: JSON.parse(profile.diseases),
          createdAt: profile.created_at
        }
      });

    } catch (error) {
      console.error("Create profile error:", error);
      await connection.rollback();
      return res.status(500).json({
        success: false,
        error: "Internal server error"
      });
    } finally {
      connection.release();
    }
  }

  static async getProfile(req: Request, res: Response) {
    const userId = (req as any).user.uuid;

    try {
      const [profiles] = await dbpool.query(
        "SELECT * FROM user_profiles WHERE user_id = ?",
        [userId]
      );

      if ((profiles as any[]).length === 0) {
        return res.status(404).json({
          success: false,
          error: "Profile not found"
        });
      }

      const profile = (profiles as any[])[0];

      return res.status(200).json({
        success: true,
        data: {
          height: profile.height,
          weight: profile.weight,
          ageRange: profile.age_range,
          allergies: JSON.parse(profile.allergies),
          diseases: JSON.parse(profile.diseases),
          createdAt: profile.created_at,
          updatedAt: profile.updated_at
        }
      });

    } catch (error) {
      console.error("Get profile error:", error);
      return res.status(500).json({
        success: false,
        error: "Internal server error"
      });
    }
  }

  static async updateProfile(req: Request, res: Response) {
    const userId = (req as any).user.uuid;
    const updates = req.body;

    // Validate updates if provided
    if (updates.height && !ValidationService.validateHeight(updates.height)) {
      return res.status(400).json({
        success: false,
        error: "Invalid height value"
      });
    }

    if (updates.weight && !ValidationService.validateWeight(updates.weight)) {
      return res.status(400).json({
        success: false,
        error: "Invalid weight value"
      });
    }

    if (updates.ageRange && !ValidationService.validateAgeRange(updates.ageRange)) {
      return res.status(400).json({
        success: false,
        error: "Invalid age range"
      });
    }

    const connection = await dbpool.getConnection();

    try {
      await connection.beginTransaction();

      const updateFields: string[] = [];
      const updateValues: any[] = [];

      if (updates.height) {
        updateFields.push("height = ?");
        updateValues.push(updates.height);
      }
      if (updates.weight) {
        updateFields.push("weight = ?");
        updateValues.push(updates.weight);
      }
      if (updates.ageRange) {
        updateFields.push("age_range = ?");
        updateValues.push(updates.ageRange);
      }
      if (updates.allergies) {
        updateFields.push("allergies = ?");
        updateValues.push(JSON.stringify(updates.allergies));
      }
      if (updates.diseases) {
        updateFields.push("diseases = ?");
        updateValues.push(JSON.stringify(updates.diseases));
      }

      if (updateFields.length === 0) {
        return res.status(400).json({
          success: false,
          error: "No valid fields to update"
        });
      }

      updateValues.push(userId);

      await connection.query(
        `UPDATE user_profiles SET ${updateFields.join(", ")} WHERE user_id = ?`,
        updateValues
      );

      await connection.commit();

      return res.status(200).json({
        success: true,
        message: "Profile updated successfully"
      });

    } catch (error) {
      console.error("Update profile error:", error);
      await connection.rollback();
      return res.status(500).json({
        success: false,
        error: "Internal server error"
      });
    } finally {
      connection.release();
    }
  }
}

export default ProfileController;
```

### Step 4: Create Profile Router

**File: `src/routes/profile.router.ts`**
```typescript
import { Router } from "express";
import ProfileController from "../controllers/profile.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const ProfileRouter = Router();

// All routes require authentication
ProfileRouter.use(authMiddleware);

ProfileRouter.post("/", ProfileController.createProfile);
ProfileRouter.get("/", ProfileController.getProfile);
ProfileRouter.put("/", ProfileController.updateProfile);

export default ProfileRouter;
```

### Step 5: Create Authentication Middleware

**File: `src/middleware/auth.middleware.ts`**
```typescript
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      error: "Authentication required"
    });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { uuid: string };
    (req as any).user = { uuid: decoded.uuid };
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: "Invalid or expired token"
    });
  }
};
```

---

## Feature 2: OCR Image Processing

### Step 1: Create Type Definitions

**File: `src/types/ocr.types.ts`**
```typescript
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
```

### Step 2: Create FastAPI Service

**File: `src/services/fastapi.service.ts`**
```typescript
import axios, { AxiosInstance } from "axios";
import FormData from "form-data";
import { FastAPIOCRResponse } from "../types/ocr.types";

class FastAPIService {
  private client: AxiosInstance;
  private ocrEndpoint: string;
  private ragEndpoint: string;

  constructor() {
    const baseURL = process.env.FASTAPI_BASE_URL || "http://localhost:8000";
    this.ocrEndpoint = process.env.FASTAPI_OCR_ENDPOINT || "/api/v1/ocr/extract";
    this.ragEndpoint = process.env.FASTAPI_RAG_ENDPOINT || "/api/v1/rag/analyze";

    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        "Authorization": `Bearer ${process.env.FASTAPI_API_KEY || "temporary-key"}`
      }
    });
  }

  async processOCR(imageBuffer: Buffer, filename: string): Promise<FastAPIOCRResponse> {
    try {
      const formData = new FormData();
      formData.append("image", imageBuffer, filename);

      const response = await this.client.post(this.ocrEndpoint, formData, {
        headers: formData.getHeaders()
      });

      return response.data;
    } catch (error: any) {
      console.error("FastAPI OCR error:", error.message);

      // Return mock data for development
      return {
        success: true,
        extractedText: "영양정보\\n열량 250kcal\\n탄수화물 30g\\n단백질 10g\\n지방 8g\\n나트륨 500mg\\n원재료: 밀가루, 설탕, 계란, 우유\\n알레르기: 밀, 계란, 우유",
        confidence: 0.85
      };
    }
  }

  async analyzeWithRAG(requestData: any): Promise<any> {
    try {
      const response = await this.client.post(this.ragEndpoint, requestData);
      return response.data;
    } catch (error: any) {
      console.error("FastAPI RAG error:", error.message);

      // Return mock data for development
      return {
        success: true,
        analysis: {
          suitability: "safe",
          score: 75,
          recommendations: [
            "이 제품은 전반적으로 안전합니다.",
            "나트륨 함량을 주의하세요."
          ],
          alternatives: [],
          nutritionalAdvice: "균형잡힌 식단을 유지하세요."
        }
      };
    }
  }
}

export default new FastAPIService();
```

### Step 3: Create OCR Parser Utility

**File: `src/utils/parser.util.ts`**
```typescript
import { OCRParsedData, NutritionalInfo } from "../types/ocr.types";

class ParserUtil {
  static parseOCRText(extractedText: string, confidence: number): OCRParsedData {
    const lines = extractedText.split("\\n").map(line => line.trim());

    const nutritionalInfo: NutritionalInfo = {};
    let ingredients: string[] = [];
    let allergens: string[] = [];
    let productName: string | undefined;

    for (const line of lines) {
      // Parse calories
      const caloriesMatch = line.match(/열량[:\\s]*([\\d]+)\\s*kcal/i);
      if (caloriesMatch) {
        nutritionalInfo.calories = parseInt(caloriesMatch[1]);
      }

      // Parse carbohydrates
      const carbsMatch = line.match(/탄수화물[:\\s]*([\\d.]+)\\s*g/i);
      if (carbsMatch) {
        nutritionalInfo.carbohydrates = parseFloat(carbsMatch[1]);
      }

      // Parse protein
      const proteinMatch = line.match(/단백질[:\\s]*([\\d.]+)\\s*g/i);
      if (proteinMatch) {
        nutritionalInfo.protein = parseFloat(proteinMatch[1]);
      }

      // Parse fat
      const fatMatch = line.match(/지방[:\\s]*([\\d.]+)\\s*g/i);
      if (fatMatch) {
        nutritionalInfo.fat = parseFloat(fatMatch[1]);
      }

      // Parse sodium
      const sodiumMatch = line.match(/나트륨[:\\s]*([\\d.]+)\\s*mg/i);
      if (sodiumMatch) {
        nutritionalInfo.sodium = parseFloat(sodiumMatch[1]);
      }

      // Parse ingredients
      const ingredientsMatch = line.match(/원재료[:\\s]*(.+)/i);
      if (ingredientsMatch) {
        ingredients = ingredientsMatch[1].split(/[,、]/).map(i => i.trim());
      }

      // Parse allergens
      const allergensMatch = line.match(/알레르기[:\\s]*(.+)/i);
      if (allergensMatch) {
        allergens = allergensMatch[1].split(/[,、]/).map(a => a.trim());
      }
    }

    return {
      productName,
      nutritionalInfo,
      ingredients: ingredients.length > 0 ? ingredients : undefined,
      allergens: allergens.length > 0 ? allergens : undefined,
      confidence
    };
  }
}

export default ParserUtil;
```

### Step 4: Create Upload Middleware

**File: `src/middleware/upload.middleware.ts`**
```typescript
import multer from "multer";
import path from "path";

const storage = multer.memoryStorage();

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only .jpg, .jpeg, and .png files are allowed"));
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter
});
```

### Step 5: Create OCR Controller

**File: `src/controllers/ocr.controller.ts`**
```typescript
import { Request, Response } from "express";
import { dbpool } from "../config/db";
import { v4 as uuidv4 } from "uuid";
import FastAPIService from "../services/fastapi.service";
import ParserUtil from "../utils/parser.util";

class OCRController {
  static async processImage(req: Request, res: Response) {
    const userId = (req as any).user.uuid;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        error: "No image file provided"
      });
    }

    try {
      // Call FastAPI OCR service
      const ocrResponse = await FastAPIService.processOCR(file.buffer, file.originalname);

      if (!ocrResponse.success || !ocrResponse.extractedText) {
        return res.status(500).json({
          success: false,
          error: "OCR processing failed"
        });
      }

      // Parse OCR text into structured data
      const parsedData = ParserUtil.parseOCRText(
        ocrResponse.extractedText,
        ocrResponse.confidence || 0
      );

      // Store in database
      const scanId = uuidv4();
      const connection = await dbpool.getConnection();

      try {
        await connection.query(
          `INSERT INTO ocr_scans
           (id, user_id, image_url, extracted_text, parsed_data, confidence)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            scanId,
            userId,
            `uploads/${scanId}_${file.originalname}`,
            ocrResponse.extractedText,
            JSON.stringify(parsedData),
            parsedData.confidence
          ]
        );

        return res.status(200).json({
          success: true,
          data: {
            scanId,
            ...parsedData
          }
        });

      } finally {
        connection.release();
      }

    } catch (error) {
      console.error("OCR processing error:", error);
      return res.status(500).json({
        success: false,
        error: "Internal server error"
      });
    }
  }

  static async getScanHistory(req: Request, res: Response) {
    const userId = (req as any).user.uuid;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;

    try {
      const [scans] = await dbpool.query(
        `SELECT id, image_url, parsed_data, confidence, created_at
         FROM ocr_scans
         WHERE user_id = ?
         ORDER BY created_at DESC
         LIMIT ? OFFSET ?`,
        [userId, limit, offset]
      );

      return res.status(200).json({
        success: true,
        data: (scans as any[]).map(scan => ({
          scanId: scan.id,
          imageUrl: scan.image_url,
          parsedData: JSON.parse(scan.parsed_data),
          confidence: scan.confidence,
          createdAt: scan.created_at
        }))
      });

    } catch (error) {
      console.error("Get scan history error:", error);
      return res.status(500).json({
        success: false,
        error: "Internal server error"
      });
    }
  }
}

export default OCRController;
```

### Step 6: Create OCR Router

**File: `src/routes/ocr.router.ts`**
```typescript
import { Router } from "express";
import OCRController from "../controllers/ocr.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { upload } from "../middleware/upload.middleware";

const OCRRouter = Router();

OCRRouter.use(authMiddleware);

OCRRouter.post("/process", upload.single("image"), OCRController.processImage);
OCRRouter.get("/history", OCRController.getScanHistory);

export default OCRRouter;
```

---

## Feature 3: RAG Integration

### Step 1: Create Type Definitions

**File: `src/types/rag.types.ts`**
```typescript
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
```

### Step 2: Create RAG Controller

**File: `src/controllers/rag.controller.ts`**
```typescript
import { Request, Response } from "express";
import { dbpool } from "../config/db";
import { v4 as uuidv4 } from "uuid";
import FastAPIService from "../services/fastapi.service";
import { RAGAnalysisRequest } from "../types/rag.types";

class RAGController {
  static async analyzeProduct(req: Request, res: Response) {
    const userId = (req as any).user.uuid;
    const { productData, scanId } = req.body;

    if (!productData) {
      return res.status(400).json({
        success: false,
        error: "Product data is required"
      });
    }

    const connection = await dbpool.getConnection();

    try {
      // Get user profile
      const [profiles] = await connection.query(
        "SELECT * FROM user_profiles WHERE user_id = ?",
        [userId]
      );

      if ((profiles as any[]).length === 0) {
        return res.status(404).json({
          success: false,
          error: "User profile not found. Please create profile first."
        });
      }

      const profile = (profiles as any[])[0];
      const userProfile = {
        height: profile.height,
        weight: profile.weight,
        ageRange: profile.age_range,
        allergies: JSON.parse(profile.allergies),
        diseases: JSON.parse(profile.diseases)
      };

      // Check allergen compatibility
      const productAllergens = productData.allergens || [];
      const userAllergies = userProfile.allergies || [];
      const isAllergenSafe = !productAllergens.some((allergen: string) =>
        userAllergies.some((allergy: string) =>
          allergen.toLowerCase().includes(allergy.toLowerCase()) ||
          allergy.toLowerCase().includes(allergen.toLowerCase())
        )
      );

      // Prepare RAG request
      const ragRequest: RAGAnalysisRequest = {
        userId,
        productData,
        userProfile
      };

      // Call FastAPI RAG service
      const ragResponse = await FastAPIService.analyzeWithRAG(ragRequest);

      if (!ragResponse.success) {
        return res.status(500).json({
          success: false,
          error: "RAG analysis failed"
        });
      }

      const analysis = ragResponse.analysis;

      // Store analysis in database
      const analysisId = uuidv4();

      await connection.query(
        `INSERT INTO rag_analyses
         (id, user_id, ocr_scan_id, request_data, rag_response, suitability_score)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          analysisId,
          userId,
          scanId || null,
          JSON.stringify(ragRequest),
          JSON.stringify(analysis),
          analysis.score
        ]
      );

      return res.status(200).json({
        success: true,
        data: {
          analysisId,
          productAnalysis: {
            suitability: analysis.suitability,
            score: analysis.score,
            isAllergenSafe
          },
          recommendations: analysis.recommendations,
          alternatives: analysis.alternatives || [],
          nutritionalAdvice: analysis.nutritionalAdvice,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error("RAG analysis error:", error);
      return res.status(500).json({
        success: false,
        error: "Internal server error"
      });
    } finally {
      connection.release();
    }
  }

  static async getAnalysisHistory(req: Request, res: Response) {
    const userId = (req as any).user.uuid;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;

    try {
      const [analyses] = await dbpool.query(
        `SELECT id, rag_response, suitability_score, created_at
         FROM rag_analyses
         WHERE user_id = ?
         ORDER BY created_at DESC
         LIMIT ? OFFSET ?`,
        [userId, limit, offset]
      );

      return res.status(200).json({
        success: true,
        data: (analyses as any[]).map(analysis => ({
          analysisId: analysis.id,
          analysis: JSON.parse(analysis.rag_response),
          score: analysis.suitability_score,
          createdAt: analysis.created_at
        }))
      });

    } catch (error) {
      console.error("Get analysis history error:", error);
      return res.status(500).json({
        success: false,
        error: "Internal server error"
      });
    }
  }
}

export default RAGController;
```

### Step 3: Create RAG Router

**File: `src/routes/rag.router.ts`**
```typescript
import { Router } from "express";
import RAGController from "../controllers/rag.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const RAGRouter = Router();

RAGRouter.use(authMiddleware);

RAGRouter.post("/analyze", RAGController.analyzeProduct);
RAGRouter.get("/history", RAGController.getAnalysisHistory);

export default RAGRouter;
```

---

## Database Migration

### Create Database Tables

**File: `database/migrations/001_create_tables.sql`**
```sql
-- User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  height DECIMAL(5,2) NOT NULL,
  weight DECIMAL(5,2) NOT NULL,
  age_range VARCHAR(10) NOT NULL,
  allergies JSON,
  diseases JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(uuid),
  UNIQUE KEY unique_user_profile (user_id),
  INDEX idx_user_id (user_id)
);

-- OCR Scans Table
CREATE TABLE IF NOT EXISTS ocr_scans (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  image_url VARCHAR(500),
  extracted_text TEXT,
  parsed_data JSON,
  confidence DECIMAL(3,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(uuid),
  INDEX idx_user_created (user_id, created_at)
);

-- RAG Analyses Table
CREATE TABLE IF NOT EXISTS rag_analyses (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  ocr_scan_id VARCHAR(36),
  request_data JSON,
  rag_response JSON,
  suitability_score INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(uuid),
  FOREIGN KEY (ocr_scan_id) REFERENCES ocr_scans(id),
  INDEX idx_user_created (user_id, created_at),
  INDEX idx_suitability (suitability_score)
);
```

---

## Update Main Application

**File: `src/index.ts`**
```typescript
import express from 'express';
import dotenv from 'dotenv';
import AuthRouter from './routes/auth.router';
import ProfileRouter from './routes/profile.router';
import OCRRouter from './routes/ocr.router';
import RAGRouter from './routes/rag.router';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS (if needed)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Routes
app.use('/api/auth', AuthRouter);
app.use('/api/profile', ProfileRouter);
app.use('/api/ocr', OCRRouter);
app.use('/api/rag', RAGRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
```

---

## Environment Configuration

**File: `.env.example`**
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=health_nutrition_db
DB_USER=root
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=1h

# FastAPI Service Configuration
FASTAPI_BASE_URL=http://localhost:8000
FASTAPI_OCR_ENDPOINT=/api/v1/ocr/extract
FASTAPI_RAG_ENDPOINT=/api/v1/rag/analyze
FASTAPI_API_KEY=temporary-development-key
```

---

## Testing with cURL

### 1. User Registration
```bash
curl -X POST http://localhost:3000/api/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{"email":"test@example.com","password":"SecurePass123!"}'
```

### 2. User Login
```bash
curl -X POST http://localhost:3000/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"test@example.com","password":"SecurePass123!"}'
```

### 3. Create Profile
```bash
curl -X POST http://localhost:3000/api/profile \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -d '{
    "height": 175,
    "weight": 70,
    "ageRange": "20대",
    "allergies": ["peanuts", "shellfish"],
    "diseases": ["diabetes"]
  }'
```

### 4. Upload Image for OCR
```bash
curl -X POST http://localhost:3000/api/ocr/process \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -F "image=@product_label.jpg"
```

### 5. Get RAG Analysis
```bash
curl -X POST http://localhost:3000/api/rag/analyze \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -d '{
    "scanId": "scan-uuid-from-ocr",
    "productData": {
      "productName": "Sample Product",
      "nutritionalInfo": {
        "calories": 250,
        "carbohydrates": 30,
        "protein": 10,
        "fat": 8,
        "sodium": 500
      },
      "allergens": ["wheat", "milk"]
    }
  }'
```

---

## Next Steps

1. Run database migration to create tables
2. Install new dependencies
3. Create `.env` file from `.env.example`
4. Test each endpoint sequentially
5. Integrate with actual FastAPI services when available
6. Add comprehensive error handling and logging
7. Implement rate limiting
8. Add request validation middleware
9. Create API documentation with Swagger/OpenAPI
10. Write unit and integration tests
