// screens/HomeScreen.tsx
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../constants/theme';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  const handleScanPress = () => {
    router.push('/scan');   // 🔹 스캔 화면으로 이동
  };

  const handleProfilePress = () => {
    router.push('/profile');
  };

  const handleHistoryPress = () => {
    router.push('/history'); // History 화면으로 (push)
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* 상단 타이틀 영역 */}
        <View style={styles.header}>
          <Text style={styles.appName}>찍먹 GO?</Text>
          <Text style={styles.subtitle}>
            성분표 한 번 찍고,{' '}
            <Text style={styles.highlight}>3초 안에</Text> 건강 체크 끝!
          </Text>
        </View>

        {/* 중앙 설명/테마 영역 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>오늘 뭐 먹을까?</Text>
          <Text style={styles.cardText}>
            성분표를 찍으면 AI가 알레르기, 나트륨, 당분을 분석해서
            {'\n'}🔴 먹지 마세요 / 🟡 고민해보세요 / 🟢 안심하고 드세요
            {'\n'}로 한 번에 알려줘요.
          </Text>
        </View>

        {/* 주요 버튼들 */}
        <View style={styles.buttonGroup}>
          <TouchableOpacity style={styles.mainButton} onPress={handleScanPress}>
            <Text style={styles.mainButtonText}>성분표 스캔하기 📷</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={handleProfilePress}>
            <Text style={styles.secondaryButtonText}>내 알레르기 / 식단 설정</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={handleHistoryPress}>
            <Text style={styles.secondaryButtonText}>최근 스캔 기록 보기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing(2),
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(3),
    backgroundColor: theme.colors.background,
  },
  header: {
    marginBottom: theme.spacing(2),
  },
  appName: {
    fontSize: theme.typography.title,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: theme.spacing(0.5),
  },
  subtitle: {
    fontSize: theme.typography.body,
    color: theme.colors.textMuted,
    lineHeight: 20,
  },
  highlight: {
    color: theme.colors.accent,
    fontWeight: '600',
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing(2),
    marginVertical: theme.spacing(2),
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardTitle: {
    fontSize: theme.typography.subtitle,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing(1),
  },
  cardText: {
    fontSize: theme.typography.body,
    color: theme.colors.textMuted,
    lineHeight: 20,
  },
  buttonGroup: {
    marginTop: theme.spacing(2),
    gap: theme.spacing(1.5),
  },
  mainButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing(1.5),
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  mainButtonText: {
    color: '#FFFFFF',
    fontSize: theme.typography.subtitle,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: theme.colors.secondary,
    paddingVertical: theme.spacing(1.2),
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: '500',
  },
});
