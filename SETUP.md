# 로그인 기능 설정 가이드

## 백엔드 설정

### 1. 환경 변수 설정

`backend/nodeJs/.env.example` 파일을 `.env`로 복사하고 필요한 값을 설정하세요:

```bash
cd backend/nodeJs
cp .env.example .env
```

`.env` 파일 수정:
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=health_nutrition_db
DB_USER=root
DB_PASSWORD=your_actual_password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=1h
```

### 2. 데이터베이스 설정

MySQL에서 USERS 테이블이 생성되어 있는지 확인하세요:

```sql
CREATE TABLE USERS (
  uuid VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. 백엔드 서버 실행

```bash
cd backend/nodeJs
npm install
npm run dev
```

서버가 `http://localhost:3000`에서 실행됩니다.

## 프론트엔드 설정

### 1. 환경 변수 설정

`app/JJJickMuck/.env.example` 파일을 `.env`로 복사:

```bash
cd app/JJJickMuck
cp .env.example .env
```

`.env` 파일 확인 (기본값 사용 가능):
```env
EXPO_PUBLIC_API_URL=http://localhost:3000
```

### 2. 의존성 설치

```bash
cd app/JJJickMuck
npm install
```

### 3. 프론트엔드 실행

```bash
npm start
```

## 구현된 기능

### 1. 로그인 화면 (`/login`)
- 이메일/비밀번호 입력
- 로그인 성공 시 JWT 토큰 저장
- 회원가입 화면으로 이동

### 2. 회원가입 화면 (`/register`)
- 이메일 형식 검증
- 비밀번호 최소 12자 검증
- 비밀번호 확인
- 회원가입 성공 시 로그인 화면으로 이동

### 3. 인증 흐름
- 앱 시작 시 토큰 확인
- 토큰이 없으면 로그인 화면으로 리다이렉트
- 로그인 성공 시 홈 화면으로 이동
- 프로필 화면에서 로그아웃 기능

### 4. API 엔드포인트

**로그인**
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your_password"
}

Response:
{
  "message": "Login successful",
  "token": "jwt_token_here"
}
```

**회원가입**
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your_password"
}

Response:
{
  "message": "User registered successfully",
  "uuid": "user_uuid_here"
}
```

## 파일 구조

### 프론트엔드
```
app/JJJickMuck/
├── app/
│   ├── _layout.tsx          # AuthProvider 추가
│   ├── index.tsx             # 인증 확인 및 리다이렉트
│   ├── login.tsx             # 로그인 라우트
│   ├── register.tsx          # 회원가입 라우트
│   └── profile.tsx           # 로그아웃 기능 추가
├── screens/
│   ├── LoginScreen.tsx       # 로그인 화면 컴포넌트
│   └── RegisterScreen.tsx    # 회원가입 화면 컴포넌트
├── services/
│   └── authService.ts        # API 호출 서비스
├── contexts/
│   └── AuthContext.tsx       # 인증 상태 관리
└── constants/
    └── api.ts                # API 엔드포인트 설정
```

### 백엔드
```
backend/nodeJs/src/
├── index.ts                  # Express 서버 설정
├── routes/
│   └── auth.router.ts        # 인증 라우트
├── controllers/
│   └── auth.controller.ts    # 로그인/회원가입 로직
└── middleware/
    └── auth.middleware.ts    # JWT 검증 미들웨어
```

## 테스트 방법

1. 백엔드 서버가 실행 중인지 확인
2. 프론트엔드 앱 시작
3. 회원가입 화면에서 새 계정 생성
4. 로그인 화면에서 로그인
5. 홈 화면으로 자동 이동 확인
6. 프로필 화면에서 로그아웃 테스트

## 주의사항

- 실제 프로덕션 환경에서는 JWT_SECRET을 안전한 값으로 변경하세요
- HTTPS를 사용하여 통신을 암호화하세요
- 비밀번호는 bcrypt로 해싱되어 저장됩니다 (salt rounds: 10)
- JWT 토큰 유효기간은 1시간입니다
