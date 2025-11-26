import { GoogleGenerativeAI } from '@google/generative-ai';

// Gemini API 키 설정 (환경 변수에서 가져오기)
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error('EXPO_PUBLIC_GEMINI_API_KEY is not defined in environment variables');
}

// Gemini AI 인스턴스 생성
const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * 이미지를 Base64로 변환
 */
export const imageToBase64 = async (uri: string): Promise<string> => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // "data:image/xxx;base64," 부분 제거
        const base64Data = base64String.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Image to Base64 conversion error:', error);
    throw error;
  }
};

/**
 * Gemini Vision API를 사용하여 이미지에서 텍스트 추출 (OCR)
 */
export const extractTextFromImage = async (imageUri: string): Promise<{
  success: boolean;
  text?: string;
  error?: string;
}> => {
  try {
    // Gemini Pro Vision 모델 사용
    const model = genAI.getGenerativeModel({ model: 'gemini-3.0-pro' });

    // 이미지를 Base64로 변환
    const base64Image = await imageToBase64(imageUri);

    // 이미지 데이터 준비
    const imageParts = [
      {
        inlineData: {
          data: base64Image,
          mimeType: 'image/jpeg',
        },
      },
    ];

    // OCR 프롬프트
    const prompt = `
이 이미지에서 모든 텍스트를 추출해주세요.
텍스트가 한글이면 한글로, 영어면 영어로 정확히 추출해주세요.
레이아웃이나 서식은 무시하고 순수한 텍스트만 추출해주세요.
텍스트가 없으면 "텍스트 없음"이라고 응답해주세요.
    `.trim();

    // Gemini API 호출
    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const text = response.text();

    if (!text || text === '텍스트 없음') {
      return {
        success: false,
        error: '이미지에서 텍스트를 찾을 수 없습니다.',
      };
    }

    return {
      success: true,
      text: text.trim(),
    };
  } catch (error: any) {
    console.error('Gemini OCR error:', error);
    return {
      success: false,
      error: error.message || 'OCR 처리 중 오류가 발생했습니다.',
    };
  }
};

/**
 * 이미지에서 구조화된 데이터 추출 (예: 명함, 영수증 등)
 */
export const extractStructuredData = async (
  imageUri: string,
  dataType: 'business-card' | 'receipt' | 'document' = 'document'
): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const base64Image = await imageToBase64(imageUri);

    const imageParts = [
      {
        inlineData: {
          data: base64Image,
          mimeType: 'image/jpeg',
        },
      },
    ];

    // 데이터 타입별 프롬프트
    const prompts = {
      'business-card': `
이 명함 이미지에서 다음 정보를 JSON 형식으로 추출해주세요:
- name: 이름
- company: 회사명
- position: 직책
- phone: 전화번호
- email: 이메일
- address: 주소
- website: 웹사이트

정보가 없는 필드는 null로 표시해주세요.
JSON만 응답하고 다른 설명은 하지 마세요.
      `.trim(),
      'receipt': `
이 영수증 이미지에서 다음 정보를 JSON 형식으로 추출해주세요:
- storeName: 상점명
- date: 날짜
- totalAmount: 총 금액
- items: 항목 배열 (각 항목은 {name: string, price: number})
- paymentMethod: 결제 방법

정보가 없는 필드는 null로 표시해주세요.
JSON만 응답하고 다른 설명은 하지 마세요.
      `.trim(),
      'document': `
이 문서 이미지에서 모든 텍스트와 구조를 분석하여 JSON 형식으로 추출해주세요:
- title: 문서 제목
- content: 본문 내용
- metadata: 기타 메타데이터

정보가 없는 필드는 null로 표시해주세요.
JSON만 응답하고 다른 설명은 하지 마세요.
      `.trim(),
    };

    const prompt = prompts[dataType];
    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const text = response.text();

    // JSON 파싱 시도
    try {
      // 마크다운 코드 블록 제거 (```json ... ```)
      const jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const data = JSON.parse(jsonText);

      return {
        success: true,
        data,
      };
    } catch (parseError) {
      // JSON 파싱 실패 시 원본 텍스트 반환
      return {
        success: true,
        data: { rawText: text },
      };
    }
  } catch (error: any) {
    console.error('Gemini structured data extraction error:', error);
    return {
      success: false,
      error: error.message || '데이터 추출 중 오류가 발생했습니다.',
    };
  }
};

export default {
  extractTextFromImage,
  extractStructuredData,
  imageToBase64,
};
