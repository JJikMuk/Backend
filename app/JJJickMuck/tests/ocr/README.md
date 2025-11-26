# OCR 테스트 가이드

GPT OCR 서비스를 테스트하는 여러 가지 방법입니다.

## 방법 1: Node.js 스크립트로 테스트

### 준비
1. 테스트 이미지를 `tests/ocr/sample-image.jpg`에 저장
2. `testOcr.ts`에서 이미지 경로 수정

### 실행
```bash
cd c:\Backend-1\app\JJJickMuck
npx ts-node tests/ocr/testOcr.ts
```

## 방법 2: 웹 URL 이미지 사용

코드에서 직접 웹 이미지 URL 사용:
```typescript
const result = await extractTextFromImage('https://example.com/test-image.jpg');
```

테스트 가능한 공개 이미지 URL:
- https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/PNG_transparency_demonstration_1.png/280px-PNG_transparency_demonstration_1.png
- https://via.placeholder.com/300x200.png?text=Test+Image

## 방법 3: React Native 앱에서 테스트 버튼 추가

`app/scan.tsx`에 테스트 버튼 추가:

```typescript
const handleTestOcr = async () => {
  const testImageUrl = 'https://example.com/test-image.jpg';

  setLoading(true);
  addLog('🧪 테스트 이미지로 OCR 시작...');

  try {
    const result = await extractTextFromImage(testImageUrl);
    console.log('테스트 결과:', result);
    addLog(`테스트 결과: ${result.text}`);
  } catch (error) {
    console.error('테스트 실패:', error);
  } finally {
    setLoading(false);
  }
};

// 렌더링에 버튼 추가
<TouchableOpacity onPress={handleTestOcr}>
  <Text>🧪 테스트</Text>
</TouchableOpacity>
```

## 방법 4: Expo Asset 사용

1. `assets/test-images/` 폴더 생성
2. 테스트 이미지 저장
3. Asset으로 로드하여 테스트

```typescript
import { Asset } from 'expo-asset';

const asset = Asset.fromModule(require('../assets/test-images/sample.jpg'));
await asset.downloadAsync();
const result = await extractTextFromImage(asset.localUri || asset.uri);
```

## 방법 5: 개발 도구 사용

### Postman/Thunder Client
GPT API를 직접 호출하여 테스트:

```bash
POST https://api.openai.com/v1/chat/completions
Headers:
  Authorization: Bearer YOUR_API_KEY
  Content-Type: application/json

Body:
{
  "model": "gpt-4o",
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "이 이미지에서 텍스트를 추출해주세요."
        },
        {
          "type": "image_url",
          "image_url": {
            "url": "https://example.com/test-image.jpg"
          }
        }
      ]
    }
  ]
}
```

## 권장 방법

**개발 중**: 방법 3 (앱에 테스트 버튼 추가) 가장 실용적
**단위 테스트**: 방법 1 (Node.js 스크립트)
**빠른 확인**: 방법 2 (웹 URL 사용)
