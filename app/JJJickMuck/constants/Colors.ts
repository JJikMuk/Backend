// constants/Colors.ts

const tintColorLight = '#4CAF50';   // 메인 그린
const tintColorDark = '#A5D6A7';    // 라이트 그린 (다크 모드에서 포인트)

export default {
  light: {
    text: '#222222',
    background: '#FFFFFF',
    tint: tintColorLight,
    tabIconDefault: '#9E9E9E',
    tabIconSelected: tintColorLight,
    icon: '#9E9E9E',
  },
  dark: {
    text: '#FFFFFF',
    background: '#000000',
    tint: tintColorDark,
    tabIconDefault: '#BDBDBD',
    tabIconSelected: tintColorDark,
    icon: '#BDBDBD',
  },
};
