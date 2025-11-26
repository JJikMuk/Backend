# 네트워크 오류 문제 해결 가이드

## "Network request failed" 오류 해결

### 1단계: 백엔드 서버 시작

먼저 백엔드 서버가 실행 중인지 확인하세요.

```bash
cd backend/nodeJs

# .env 파일이 없으면 생성
copy .env.example .env

# 서버 시작
npm run dev
```

서버가 성공적으로 시작되면 다음과 같은 메시지가 표시됩니다:
```
Server is running on http://localhost:3000
```

### 2단계: API URL 설정 확인

실행 환경에 따라 올바른 API URL을 설정해야 합니다.

#### Android Emulator
`app/JJJickMuck/.env` 파일:
```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000
```

#### iOS Simulator
`app/JJJickMuck/.env` 파일:
```env
EXPO_PUBLIC_API_URL=http://localhost:3000
```

#### 실제 디바이스 (Physical Device)

1. 컴퓨터의 IP 주소를 확인:
   ```bash
   # Windows
   ipconfig

   # Mac/Linux
   ifconfig
   ```

2. `IPv4 Address`를 찾으세요 (예: `192.168.1.100`)

3. `.env` 파일 업데이트:
   ```env
   EXPO_PUBLIC_API_URL=http://192.168.1.100:3000
   ```

4. **중요**: 컴퓨터와 디바이스가 같은 WiFi 네트워크에 연결되어 있어야 합니다!

### 3단계: Expo 앱 재시작

`.env` 파일을 수정한 후에는 **반드시 Expo 앱을 재시작**해야 합니다.

```bash
# Expo 개발 서버 중지 (Ctrl+C)
# 그리고 다시 시작
npm start
```

앱도 완전히 닫고 다시 실행하세요.

### 4단계: 방화벽 확인

Windows 방화벽이 포트 3000을 차단하고 있을 수 있습니다.

#### Windows 방화벽 설정:

1. Windows 설정 > 업데이트 및 보안 > Windows 보안 > 방화벽 및 네트워크 보호
2. "고급 설정" 클릭
3. "인바운드 규칙" > "새 규칙"
4. "포트" 선택 > "다음"
5. "TCP" 선택, "특정 로컬 포트": `3000` 입력
6. "연결 허용" 선택
7. 규칙 이름: "Node.js Backend Server"

### 5단계: 테스트

#### 백엔드 API 테스트 (브라우저 또는 curl)

```bash
# Health check
curl http://localhost:3000/health

# 또는 브라우저에서
http://localhost:3000/health
```

응답 예시:
```json
{
  "status": "ok",
  "timestamp": "2025-11-26T..."
}
```

#### 프론트엔드에서 테스트

앱에서 회원가입을 시도하고 오류 메시지를 확인하세요.

## 일반적인 문제들

### 문제 1: "Network request failed"

**원인**:
- 백엔드 서버가 실행되지 않음
- 잘못된 API URL
- 방화벽 차단

**해결**:
1. 백엔드 서버 실행 확인
2. 올바른 API URL 설정 (위 2단계 참조)
3. 방화벽 규칙 추가 (위 4단계 참조)

### 문제 2: "ECONNREFUSED"

**원인**: 서버가 해당 포트에서 실행되지 않음

**해결**:
```bash
# 포트 3000이 사용 중인지 확인
netstat -ano | findstr :3000

# 서버 재시작
cd backend/nodeJs
npm run dev
```

### 문제 3: .env 파일 변경이 적용되지 않음

**원인**: Expo는 .env 파일을 캐시함

**해결**:
```bash
# Expo 캐시 클리어 및 재시작
npx expo start --clear
```

### 문제 4: "Invalid email or password"

**원인**:
- 이메일이 등록되지 않음
- 비밀번호가 틀림
- 데이터베이스 연결 문제

**해결**:
1. 먼저 회원가입 시도
2. MySQL 서버가 실행 중인지 확인
3. `.env` 파일의 데이터베이스 설정 확인

### 문제 5: 실제 디바이스에서 연결 안 됨

**원인**:
- 다른 WiFi 네트워크 사용
- 잘못된 IP 주소

**해결**:
1. 컴퓨터와 디바이스가 **같은 WiFi**에 연결되어 있는지 확인
2. `ipconfig` (Windows) 또는 `ifconfig` (Mac/Linux)로 정확한 IP 확인
3. IP 주소가 `192.168.x.x` 형식인지 확인

## 디버깅 팁

### 백엔드 로그 확인

백엔드 터미널에서 요청이 들어오는지 확인:
```bash
cd backend/nodeJs
npm run dev
```

요청이 들어오면 터미널에 로그가 표시됩니다.

### 프론트엔드 네트워크 요청 확인

`app/JJJickMuck/services/authService.ts`에 로그 추가:

```typescript
export async function login(email: string, password: string): Promise<LoginResponse> {
  try {
    console.log('Attempting login to:', `${API_BASE_URL}${API_ENDPOINTS.LOGIN}`);

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.LOGIN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    console.log('Response status:', response.status);
    // ... rest of code
  }
}
```

## 빠른 체크리스트

✅ 백엔드 서버 실행 중? (`npm run dev`)
✅ `.env` 파일 존재? (backend와 frontend 모두)
✅ 올바른 API URL 설정? (Android: 10.0.2.2, iOS: localhost, 실제기기: IP)
✅ Expo 앱 재시작? (`.env` 변경 후)
✅ 방화벽 허용? (Windows)
✅ 같은 WiFi 네트워크? (실제 디바이스)
✅ MySQL 서버 실행 중?

## 여전히 문제가 있나요?

1. 백엔드 터미널 로그 확인
2. Expo 터미널 로그 확인
3. 브라우저에서 `http://localhost:3000/health` 접속 테스트
4. 위의 디버깅 팁 참조
