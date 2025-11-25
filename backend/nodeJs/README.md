# Health & Nutrition Backend API

Node.js/Express backend with TypeScript for health and nutrition management system integrating FastAPI services for OCR and RAG analysis.

## Features

✅ **User Profile Management** - Store user health information (height, weight, age, allergies, diseases)
✅ **OCR Image Processing** - Extract nutritional data from food product images via FastAPI
✅ **RAG Analysis** - AI-powered personalized nutrition recommendations
✅ **JWT Authentication** - Secure user authentication and authorization
✅ **Mock FastAPI Integration** - Development fallbacks for FastAPI services

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express 5.x
- **Database**: MySQL 8.x
- **Authentication**: JWT (jsonwebtoken)
- **File Upload**: Multer
- **External API**: Axios for FastAPI integration

## Project Structure

```
backend/nodeJs/
├── src/
│   ├── controllers/        # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── profile.controller.ts
│   │   ├── ocr.controller.ts
│   │   └── rag.controller.ts
│   ├── routes/             # API routes
│   │   ├── auth.router.ts
│   │   ├── profile.router.ts
│   │   ├── ocr.router.ts
│   │   └── rag.router.ts
│   ├── services/           # Business logic
│   │   ├── fastapi.service.ts
│   │   └── validation.service.ts
│   ├── middleware/         # Express middleware
│   │   ├── auth.middleware.ts
│   │   └── upload.middleware.ts
│   ├── types/              # TypeScript definitions
│   │   ├── profile.types.ts
│   │   ├── ocr.types.ts
│   │   └── rag.types.ts
│   ├── utils/              # Utilities
│   │   └── parser.util.ts
│   ├── config/             # Configuration
│   │   └── db.ts
│   └── index.ts            # Main entry point
├── database/
│   └── migrations/
│       └── 001_create_tables.sql
├── .env.example
└── package.json
```

## Installation

### 1. Install Dependencies

```bash
cd backend/nodeJs
npm install
```

### 2. Configure Environment

Create `.env` file from example:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=health_nutrition_db
DB_USER=root
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your-secret-key-here

# FastAPI (optional - uses mock data if unavailable)
FASTAPI_BASE_URL=http://localhost:8000
FASTAPI_API_KEY=your-api-key
```

### 3. Run Database Migration

Execute the SQL migration script:

```bash
# Using MySQL CLI
mysql -u root -p health_nutrition_db < database/migrations/001_create_tables.sql

# Or using a MySQL client
# Import: database/migrations/001_create_tables.sql
```

### 4. Start the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

Server runs at: `http://localhost:3000`

## API Endpoints

### Authentication

**Register**
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Login**
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

# Response includes JWT token
```

### User Profile (Requires JWT)

**Create Profile**
```bash
POST /api/profile
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "height": 175,
  "weight": 70,
  "ageRange": "20대",
  "allergies": ["peanuts", "shellfish"],
  "diseases": ["diabetes"]
}
```

**Get Profile**
```bash
GET /api/profile
Authorization: Bearer YOUR_JWT_TOKEN
```

**Update Profile**
```bash
PUT /api/profile
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "weight": 68,
  "allergies": ["peanuts"]
}
```

### OCR Processing (Requires JWT)

**Process Image**
```bash
POST /api/ocr/process
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: multipart/form-data

image: [binary file - jpg/png, max 10MB]
```

**Get Scan History**
```bash
GET /api/ocr/history?limit=10&offset=0
Authorization: Bearer YOUR_JWT_TOKEN
```

### RAG Analysis (Requires JWT)

**Analyze Product**
```bash
POST /api/rag/analyze
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "scanId": "uuid-from-ocr-scan",
  "productData": {
    "nutritionalInfo": {
      "calories": 250,
      "carbohydrates": 30,
      "protein": 10,
      "fat": 8,
      "sodium": 500
    },
    "allergens": ["wheat", "milk"]
  }
}
```

**Get Analysis History**
```bash
GET /api/rag/history?limit=10&offset=0
Authorization: Bearer YOUR_JWT_TOKEN
```

### Health Check

```bash
GET /health

# Response: { "status": "ok", "timestamp": "..." }
```

## Testing Workflow

### 1. Register & Login

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPassword123!"}'

# Login (save the token)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPassword123!"}'

# Save token from response
TOKEN="your-jwt-token-here"
```

### 2. Create User Profile

```bash
curl -X POST http://localhost:3000/api/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "height": 170,
    "weight": 65,
    "ageRange": "30대",
    "allergies": ["peanuts"],
    "diseases": []
  }'
```

### 3. Upload Image for OCR

```bash
# Prepare a test image (product_label.jpg)
curl -X POST http://localhost:3000/api/ocr/process \
  -H "Authorization: Bearer $TOKEN" \
  -F "image=@product_label.jpg"

# Save scanId from response
SCAN_ID="uuid-from-response"
```

### 4. Get RAG Analysis

```bash
curl -X POST http://localhost:3000/api/rag/analyze \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "scanId": "'$SCAN_ID'",
    "productData": {
      "productName": "테스트 제품",
      "nutritionalInfo": {
        "calories": 300,
        "carbohydrates": 45,
        "protein": 8,
        "fat": 12,
        "sodium": 600
      },
      "allergens": ["wheat"]
    }
  }'
```

## FastAPI Integration

### Mock Mode (Default)

When FastAPI services are unavailable, the system automatically returns mock data:

**OCR Mock Response:**
```json
{
  "success": true,
  "extractedText": "영양정보\\n열량 250kcal\\n탄수화물 30g...",
  "confidence": 0.85
}
```

**RAG Mock Response:**
```json
{
  "success": true,
  "analysis": {
    "suitability": "safe",
    "score": 75,
    "recommendations": ["이 제품은 전반적으로 안전합니다."],
    "nutritionalAdvice": "균형잡힌 식단을 유지하세요."
  }
}
```

### Production Mode

Update `.env` with actual FastAPI endpoints:

```env
FASTAPI_BASE_URL=https://your-fastapi-server.com
FASTAPI_OCR_ENDPOINT=/api/v1/ocr/extract
FASTAPI_RAG_ENDPOINT=/api/v1/rag/analyze
FASTAPI_API_KEY=your-production-api-key
```

## Database Schema

### user_profiles
- `id` - UUID primary key
- `user_id` - Foreign key to users table
- `height` - Decimal (5,2) in cm
- `weight` - Decimal (5,2) in kg
- `age_range` - VARCHAR(10) enum
- `allergies` - JSON array
- `diseases` - JSON array
- `created_at` - Timestamp
- `updated_at` - Timestamp

### ocr_scans
- `id` - UUID primary key
- `user_id` - Foreign key to users table
- `image_url` - VARCHAR(500)
- `extracted_text` - TEXT
- `parsed_data` - JSON
- `confidence` - Decimal (3,2)
- `created_at` - Timestamp

### rag_analyses
- `id` - UUID primary key
- `user_id` - Foreign key to users table
- `ocr_scan_id` - Foreign key to ocr_scans (optional)
- `request_data` - JSON
- `rag_response` - JSON
- `suitability_score` - INT
- `created_at` - Timestamp

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message here"
}
```

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `404` - Not Found
- `500` - Internal Server Error
- `503` - Service Unavailable (FastAPI down)

## Security Features

✅ JWT token authentication
✅ Password hashing with bcrypt
✅ File type validation (only jpg/png)
✅ File size limit (10MB max)
✅ Input validation and sanitization
✅ CORS configuration
✅ SQL injection prevention (parameterized queries)

## Development Tips

### Run TypeScript Compiler

```bash
npx tsc --watch
```

### Check for Type Errors

```bash
npx tsc --noEmit
```

### Database Connection

Ensure MySQL is running and accessible:

```bash
mysql -u root -p -e "SHOW DATABASES;"
```

### View Logs

Application logs errors to console. Monitor for:
- Database connection errors
- FastAPI service errors (auto-fallback to mock data)
- Authentication failures

## Troubleshooting

### Database Connection Failed

```bash
# Check MySQL status
service mysql status

# Verify credentials in .env
# Ensure database exists
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS health_nutrition_db;"
```

### JWT Token Invalid

- Ensure `JWT_SECRET` is set in `.env`
- Token expires in 1 hour by default
- Re-login to get new token

### File Upload Fails

- Check file size (must be < 10MB)
- Verify file type (only .jpg, .jpeg, .png)
- Ensure proper multipart/form-data encoding

### FastAPI Service Errors

- System automatically falls back to mock data
- Check FASTAPI_BASE_URL in `.env`
- Verify FastAPI service is running
- Check API key if required

## Next Steps

1. ✅ All features implemented
2. 📝 Run database migration
3. 🔧 Configure environment variables
4. 🧪 Test each endpoint
5. 🚀 Deploy to production
6. 📊 Add monitoring and logging
7. 🔒 Implement rate limiting
8. 📖 Generate API documentation (Swagger)
9. ✅ Write unit tests
10. 🔄 Integrate with actual FastAPI services

## Support

For questions or issues:
- Review documentation in `claudedocs/`
- Check implementation guide
- Verify database schema
- Test with mock data first

## License

ISC
