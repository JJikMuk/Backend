// constants/theme.ts

export const theme = {
  colors: {
    // 메인 팔레트
    primary: '#4CAF50',      // 진한 그린
    secondary: '#A5D6A7',    // 라이트 그린
    accent: '#FFC107',       // 옐로 포인트

    // 기본 배경 & 표면
    background: '#FFFFFF',   // 화이트 베이스
    surface: '#F6F8F6',      // 카드/컨테이너 배경

    // 텍스트
    text: '#222222',         // 기본 텍스트
    textMuted: '#6B6B6B',    // 보조 설명 텍스트

    // 보더 / 디바이더
    border: '#E0E0E0',

    // 상태 색상 (추가로 활용 가능)
    success: '#4CAF50',
    warning: '#FFC107',
    danger: '#F44336',
  },

  // 여백 단위 (8px 기준)
  spacing: (value: number) => value * 8,

  // 모서리 라운드
  radius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 20,
    pill: 999,
  },

  // 폰트 사이즈
  typography: {
    title: 28,
    subtitle: 20,
    body: 16,
    small: 14,
    caption: 12,
  },
} as const;

export type Theme = typeof theme;

// Re-export Colors from the dedicated file so other modules can import
// `Colors` from `@/constants/theme` (existing code expects this).
import ColorsDefault from './Colors';
export const Colors = ColorsDefault;

// Minimal Fonts object used by a few components. Adjust font-family
// names as needed for your app's typography.
export const Fonts = {
  rounded: 'System',
  mono: 'Menlo',
};
