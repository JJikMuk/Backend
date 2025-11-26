/**
 * GPT OCR 서비스 테스트 스크립트
 *
 * 사용 방법:
 * 1. tests/ocr/sample-image.jpg 파일 준비
 * 2. npx ts-node tests/ocr/testOcr.ts 실행
 */

import { extractTextFromImage, extractStructuredData } from '../../services/gptOcrService';
import * as path from 'path';

async function testOcr() {
  console.log('🧪 GPT OCR 테스트 시작...\n');

  // 테스트할 이미지 경로들
  const testImages = [
    // 로컬 파일 경로 (file:// 형식)
    'file:///path/to/test/image.jpg',

    // 또는 웹 URL
    'https://example.com/test-image.jpg',

    // 실제 테스트 이미지 경로로 변경하세요
    path.join(__dirname, 'sample-image.jpg'),
  ];

  // 1. 기본 텍스트 추출 테스트
  console.log('📝 테스트 1: 기본 텍스트 추출');
  try {
    const result = await extractTextFromImage(testImages[0]);

    if (result.success) {
      console.log('✅ 성공!');
      console.log('추출된 텍스트:', result.text);
    } else {
      console.log('❌ 실패:', result.error);
    }
  } catch (error) {
    console.error('❌ 오류:', error);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // 2. 구조화된 데이터 추출 테스트
  console.log('📊 테스트 2: 구조화된 데이터 추출 (명함)');
  try {
    const result = await extractStructuredData(testImages[0], 'business-card');

    if (result.success) {
      console.log('✅ 성공!');
      console.log('추출된 데이터:', JSON.stringify(result.data, null, 2));
    } else {
      console.log('❌ 실패:', result.error);
    }
  } catch (error) {
    console.error('❌ 오류:', error);
  }
}

// 테스트 실행
testOcr().then(() => {
  console.log('\n✅ 모든 테스트 완료!');
}).catch((error) => {
  console.error('\n❌ 테스트 실패:', error);
});
