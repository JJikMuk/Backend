# Backend API Features Documentation

## Overview
This document describes the backend API features for the health and nutrition management system. The backend integrates with FastAPI services for OCR processing and RAG-based recommendations.

---

## Feature 1: User Profile Management

### Description
Collect and store comprehensive user health information including physical attributes, age range, allergies, and medical conditions.

### Endpoint
```
POST /api/user/profile
```

### Request Body
```json
{
  "height": 175,
  "weight": 70,
  "ageRange": "20대",
  "allergies": ["peanuts", "shellfish"],
  "diseases": ["diabetes", "hypertension"]
}
```

### Field Specifications

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `height` | number | User's height in centimeters | Required, 50-300 cm |
| `weight` | number | User's weight in kilograms | Required, 20-300 kg |
| `ageRange` | string | Age range in 10-year intervals | Required, enum: ["10대", "20대", "30대", "40대", "50대", "60대", "70대", "80대+"] |
| `allergies` | string[] | List of food allergies | Optional, array of strings |
| `diseases` | string[] | List of medical conditions | Optional, array of strings |

### Response
```json
{
  "success": true,
  "message": "User profile created successfully",
  "data": {
    "userId": "uuid-v4-string",
    "height": 175,
    "weight": 70,
    "ageRange": "20대",
    "allergies": ["peanuts", "shellfish"],
    "diseases": ["diabetes", "hypertension"],
    "createdAt": "2025-11-24T10:30:00Z"
  }
}
```

### Error Responses
```json
{
  "success": false,
  "error": "Validation error: Invalid age range"
}
```

### Database Schema
```sql
CREATE TABLE user_profiles (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  height DECIMAL(5,2) NOT NULL,
  weight DECIMAL(5,2) NOT NULL,
  age_range VARCHAR(10) NOT NULL,
  allergies JSON,
  diseases JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(uuid)
);
```

### Business Logic
1. Validate all required fields (height, weight, ageRange)
2. Validate ageRange against allowed enum values
3. Sanitize and validate allergy and disease arrays
4. Generate UUID for profile record
5. Store profile data in database with user association
6. Return created profile with generated ID

---

## Feature 2: OCR Image Processing

### Description
Process uploaded food product images through FastAPI OCR service to extract nutritional information and product details.

### Endpoint
```
POST /api/ocr/process
```

### Request
```
Content-Type: multipart/form-data

image: [binary file data]
userId: "uuid-v4-string"
```

### Processing Flow
1. Frontend uploads image file
2. Backend receives multipart form data
3. Backend calls FastAPI OCR service
4. FastAPI extracts text from image
5. Backend parses OCR results into structured JSON
6. Backend returns parsed nutritional data

### FastAPI Integration
```typescript
// Temporary API endpoint (to be replaced)
const FASTAPI_OCR_ENDPOINT = "http://localhost:8000/api/v1/ocr/extract";

// Request to FastAPI
const formData = new FormData();
formData.append('image', imageFile);

const response = await fetch(FASTAPI_OCR_ENDPOINT, {
  method: 'POST',
  body: formData,
  headers: {
    'Authorization': `Bearer ${API_KEY}`
  }
});
```

### FastAPI OCR Response (Expected)
```json
{
  "success": true,
  "extractedText": "영양정보\n열량 250kcal\n탄수화물 30g\n단백질 10g\n지방 8g\n나트륨 500mg",
  "confidence": 0.95
}
```

### Parsed JSON Output
```json
{
  "success": true,
  "data": {
    "productName": "제품명",
    "nutritionalInfo": {
      "calories": 250,
      "carbohydrates": 30,
      "protein": 10,
      "fat": 8,
      "sodium": 500,
      "unit": "per 100g"
    },
    "ingredients": ["밀가루", "설탕", "계란", "우유"],
    "allergens": ["밀", "계란", "우유"],
    "manufacturingDate": "2025-10-01",
    "expirationDate": "2026-04-01",
    "manufacturer": "제조사명",
    "confidence": 0.95
  }
}
```

### Parsing Logic
```typescript
interface OCRParsedData {
  productName?: string;
  nutritionalInfo: {
    calories?: number;
    carbohydrates?: number;
    protein?: number;
    fat?: number;
    sodium?: number;
    unit?: string;
  };
  ingredients?: string[];
  allergens?: string[];
  manufacturingDate?: string;
  expirationDate?: string;
  manufacturer?: string;
  confidence: number;
}

function parseOCRText(extractedText: string): OCRParsedData {
  // Parse nutritional values using regex patterns
  // Extract product information
  // Identify allergens from ingredients
  // Return structured JSON
}
```

### Error Responses
```json
{
  "success": false,
  "error": "Image processing failed",
  "details": "FastAPI service unavailable"
}
```

### Database Schema
```sql
CREATE TABLE ocr_scans (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  image_url VARCHAR(500),
  extracted_text TEXT,
  parsed_data JSON,
  confidence DECIMAL(3,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(uuid)
);
```

---

## Feature 3: RAG Integration for Recommendations

### Description
Connect to FastAPI RAG (Retrieval-Augmented Generation) service to provide personalized nutrition recommendations based on user profile and scanned product information.

### Endpoint
```
POST /api/rag/recommend
```

### Request Body
```json
{
  "userId": "uuid-v4-string",
  "productData": {
    "productName": "제품명",
    "nutritionalInfo": {
      "calories": 250,
      "carbohydrates": 30,
      "protein": 10,
      "fat": 8,
      "sodium": 500
    },
    "allergens": ["밀", "계란", "우유"]
  },
  "userProfile": {
    "height": 175,
    "weight": 70,
    "ageRange": "20대",
    "allergies": ["peanuts"],
    "diseases": ["diabetes"]
  }
}
```

### FastAPI RAG Integration
```typescript
// Temporary API endpoint (to be replaced)
const FASTAPI_RAG_ENDPOINT = "http://localhost:8000/api/v1/rag/analyze";

interface RAGRequest {
  userId: string;
  productData: ProductData;
  userProfile: UserProfile;
  query?: string;
}

async function callRAGService(requestData: RAGRequest) {
  const response = await fetch(FASTAPI_RAG_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify(requestData)
  });

  return await response.json();
}
```

### FastAPI RAG Response (Expected)
```json
{
  "success": true,
  "analysis": {
    "suitability": "warning",
    "score": 65,
    "recommendations": [
      "이 제품은 높은 나트륨 함량으로 인해 고혈압 환자에게 적합하지 않을 수 있습니다.",
      "당뇨병 환자는 탄수화물 섭취를 주의해야 합니다.",
      "제품에 포함된 알레르기 유발 성분이 사용자 프로필과 일치하지 않습니다."
    ],
    "alternatives": [
      {
        "productName": "대체 제품 1",
        "reason": "저나트륨, 저당"
      }
    ],
    "nutritionalAdvice": "하루 권장 섭취량의 30%에 해당하는 나트륨이 포함되어 있습니다."
  }
}
```

### Response to Frontend
```json
{
  "success": true,
  "data": {
    "productAnalysis": {
      "suitability": "warning",
      "score": 65,
      "isAllergenSafe": true,
      "isDiseaseCompatible": false
    },
    "recommendations": [
      "이 제품은 높은 나트륨 함량으로 인해 고혈압 환자에게 적합하지 않을 수 있습니다.",
      "당뇨병 환자는 탄수화물 섭취를 주의해야 합니다."
    ],
    "alternatives": [
      {
        "productName": "대체 제품 1",
        "reason": "저나트륨, 저당"
      }
    ],
    "nutritionalAdvice": "하루 권장 섭취량의 30%에 해당하는 나트륨이 포함되어 있습니다.",
    "timestamp": "2025-11-24T10:30:00Z"
  }
}
```

### Processing Logic
1. Receive user request with product and profile data
2. Validate user profile exists in database
3. Prepare RAG request payload
4. Call FastAPI RAG endpoint
5. Process RAG response
6. Check allergen compatibility
7. Check disease compatibility
8. Store analysis results in database
9. Return recommendations to frontend

### Error Responses
```json
{
  "success": false,
  "error": "RAG service unavailable",
  "details": "Connection timeout to FastAPI service"
}
```

### Database Schema
```sql
CREATE TABLE rag_analyses (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  ocr_scan_id VARCHAR(36),
  request_data JSON,
  rag_response JSON,
  suitability_score INT,
  recommendations JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(uuid),
  FOREIGN KEY (ocr_scan_id) REFERENCES ocr_scans(id)
);
```

---

## API Configuration

### Environment Variables
```env
# FastAPI Service Configuration
FASTAPI_BASE_URL=http://localhost:8000
FASTAPI_OCR_ENDPOINT=/api/v1/ocr/extract
FASTAPI_RAG_ENDPOINT=/api/v1/rag/analyze
FASTAPI_API_KEY=your-api-key-here

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=health_nutrition_db
DB_USER=admin
DB_PASSWORD=secure_password

# JWT Configuration
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=1h
```

### Error Handling Strategy
1. **Validation Errors**: Return 400 with detailed error messages
2. **Authentication Errors**: Return 401 with authentication required message
3. **FastAPI Service Errors**: Return 503 with service unavailable message
4. **Database Errors**: Return 500 with internal server error message
5. **Not Found Errors**: Return 404 with resource not found message

### Rate Limiting
- User Profile: 10 requests/minute
- OCR Processing: 5 requests/minute (due to computational cost)
- RAG Analysis: 5 requests/minute

---

## Integration Workflow

### Complete User Journey
```
1. User Registration/Login
   ↓
2. Create User Profile (Feature 1)
   ↓
3. Upload Product Image
   ↓
4. OCR Processing (Feature 2)
   ↓
5. Parse Nutritional Data
   ↓
6. RAG Analysis (Feature 3)
   ↓
7. Display Recommendations to User
```

### Data Flow Diagram
```
Frontend → Backend → FastAPI OCR → Backend → Database
                                     ↓
Frontend ← Backend ← FastAPI RAG ← Backend
```

---

## Testing Endpoints

### Mock FastAPI Endpoints (Temporary)
```typescript
// Mock OCR endpoint response
app.post('/mock/ocr', (req, res) => {
  res.json({
    success: true,
    extractedText: "Sample OCR text...",
    confidence: 0.92
  });
});

// Mock RAG endpoint response
app.post('/mock/rag', (req, res) => {
  res.json({
    success: true,
    analysis: {
      suitability: "safe",
      score: 85,
      recommendations: ["This product is suitable for your profile"]
    }
  });
});
```

---

## Security Considerations

1. **Image Upload**: Validate file type and size (max 10MB, only jpg/png)
2. **Data Sanitization**: Sanitize all user inputs before database storage
3. **JWT Authentication**: Require valid JWT token for all API endpoints
4. **Rate Limiting**: Prevent abuse of OCR and RAG services
5. **API Key Management**: Secure FastAPI service keys in environment variables
6. **HTTPS**: All communication with FastAPI services over HTTPS
7. **Data Privacy**: Encrypt sensitive health information in database

---

## Performance Optimization

1. **Caching**: Cache OCR results for identical images (hash-based)
2. **Async Processing**: Use async/await for FastAPI calls
3. **Database Indexing**: Index user_id and created_at columns
4. **Image Compression**: Compress images before sending to OCR service
5. **Connection Pooling**: Maintain connection pool for database queries

---

## Future Enhancements

1. Batch OCR processing for multiple products
2. Historical analysis tracking and trends
3. Meal planning based on RAG recommendations
4. Barcode scanning integration
5. Offline OCR processing capability
6. Multi-language support for product labels
