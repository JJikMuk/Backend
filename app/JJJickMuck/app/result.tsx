// app/result.tsx
import { SafeAreaView, View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { theme } from '../constants/theme';
import { useEffect, useState } from 'react';

interface OCRData {
  scanId: string;
  productName?: string;
  ingredients?: string[];
  nutritionInfo?: {
    calories?: number;
    sodium?: number;
    sugar?: number;
    fat?: number;
  };
  allergyWarnings?: string[];
  confidence: number;
}

export default function ResultScreen() {
  const params = useLocalSearchParams();
  const [ocrData, setOcrData] = useState<OCRData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      if (params.data) {
        const parsedData = JSON.parse(params.data as string);
        setOcrData(parsedData);
      }
    } catch (error) {
      console.error('Failed to parse OCR data:', error);
    } finally {
      setLoading(false);
    }
  }, [params.data]);

  // 로딩 중
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>분석 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // 데이터 없음
  if (!ocrData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Text style={styles.errorText}>분석 결과를 불러올 수 없습니다.</Text>
        </View>
      </SafeAreaView>
    );
  }

  // 평가 등급 결정 (간단한 로직)
  const calculateGrade = (): 'good' | 'warn' | 'danger' => {
    const allergyCount = ocrData.allergyWarnings?.length || 0;
    const sodium = ocrData.nutritionInfo?.sodium || 0;
    const sugar = ocrData.nutritionInfo?.sugar || 0;

    if (allergyCount > 0 || sodium > 500 || sugar > 20) {
      return 'danger';
    } else if (sodium > 300 || sugar > 10) {
      return 'warn';
    }
    return 'good';
  };

  const finalGrade = calculateGrade();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* 1. 제품명 */}
        {ocrData.productName && (
          <View style={styles.productNameContainer}>
            <Text style={styles.productName}>{ocrData.productName}</Text>
            <Text style={styles.confidence}>신뢰도: {Math.round(ocrData.confidence * 100)}%</Text>
          </View>
        )}

        {/* 2. 평가 (신호등) */}
        <Text style={styles.sectionTitle}>평가</Text>

        <View style={styles.signalWrapper}>
          
          {/* 양호(초록) */}
          <View style={styles.signalItem}>
            <View
              style={[
                styles.signalLight,
                { backgroundColor: '#40C057' },
                finalGrade === 'good' ? styles.active : styles.inactive,
              ]}
            />
            <Text
              style={[
                styles.signalText,
                finalGrade === 'good' ? styles.signalTextActive : styles.signalTextInactive,
              ]}
            >
              양호
            </Text>
          </View>

          {/* 주의(노랑) */}
          <View style={styles.signalItem}>
            <View
              style={[
                styles.signalLight,
                { backgroundColor: '#FAB005' },
                finalGrade === 'warn' ? styles.active : styles.inactive,
              ]}
            />
            <Text
              style={[
                styles.signalText,
                finalGrade === 'warn' ? styles.signalTextActive : styles.signalTextInactive,
              ]}
            >
              주의
            </Text>
          </View>

          {/* 위험(빨강) */}
          <View style={styles.signalItem}>
            <View
              style={[
                styles.signalLight,
                { backgroundColor: '#FA5252' },
                finalGrade === 'danger' ? styles.active : styles.inactive,
              ]}
            />
            <Text
              style={[
                styles.signalText,
                finalGrade === 'danger' ? styles.signalTextActive : styles.signalTextInactive,
              ]}
            >
              위험
            </Text>
          </View>

        </View>

        {/* 3. 상세결과 */}
        <Text style={styles.sectionTitle}>상세결과</Text>
        <Text style={styles.summaryDesc}>
          성분표를 기반으로 주요 위험 요소를 분석했습니다.
          아래 항목을 확인하세요.
        </Text>

        <View style={styles.cardGrid}>
          {/* 알레르기 */}
          <View style={[
            styles.resultCard,
            (ocrData.allergyWarnings?.length || 0) > 0 ? styles.red : styles.green
          ]}>
            <Text style={styles.cardTitle}>알레르기</Text>
            <Text style={styles.cardValue}>
              {(ocrData.allergyWarnings?.length || 0) > 0 ? '주의' : '안전'}
            </Text>
          </View>

          {/* 나트륨 */}
          <View style={[
            styles.resultCard,
            (ocrData.nutritionInfo?.sodium || 0) > 500 ? styles.red :
            (ocrData.nutritionInfo?.sodium || 0) > 300 ? styles.yellow : styles.green
          ]}>
            <Text style={styles.cardTitle}>나트륨</Text>
            <Text style={styles.cardValue}>
              {ocrData.nutritionInfo?.sodium ? `${ocrData.nutritionInfo.sodium}mg` : '정보없음'}
            </Text>
          </View>

          {/* 당분 */}
          <View style={[
            styles.resultCard,
            (ocrData.nutritionInfo?.sugar || 0) > 20 ? styles.red :
            (ocrData.nutritionInfo?.sugar || 0) > 10 ? styles.yellow : styles.green
          ]}>
            <Text style={styles.cardTitle}>당분</Text>
            <Text style={styles.cardValue}>
              {ocrData.nutritionInfo?.sugar ? `${ocrData.nutritionInfo.sugar}g` : '정보없음'}
            </Text>
          </View>

          {/* 칼로리 */}
          <View style={[
            styles.resultCard,
            (ocrData.nutritionInfo?.calories || 0) > 500 ? styles.red :
            (ocrData.nutritionInfo?.calories || 0) > 300 ? styles.yellow : styles.green
          ]}>
            <Text style={styles.cardTitle}>칼로리</Text>
            <Text style={styles.cardValue}>
              {ocrData.nutritionInfo?.calories ? `${ocrData.nutritionInfo.calories}kcal` : '정보없음'}
            </Text>
          </View>
        </View>

        {/* 4. 알레르기 경고 */}
        {ocrData.allergyWarnings && ocrData.allergyWarnings.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>알레르기 경고</Text>
            <View style={styles.allergyContainer}>
              {ocrData.allergyWarnings.map((allergy, index) => (
                <View key={index} style={styles.allergyChip}>
                  <Text style={styles.allergyText}>{allergy}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* 5. 성분 목록 */}
        {ocrData.ingredients && ocrData.ingredients.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>성분 목록</Text>
            <View style={styles.ingredientsContainer}>
              <Text style={styles.ingredientsText}>
                {ocrData.ingredients.join(', ')}
              </Text>
            </View>
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scroll: {
    padding: theme.spacing(2),
  },

  /* 로딩/에러 */
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing(2),
    fontSize: theme.typography.body,
    color: theme.colors.textMuted,
  },
  errorText: {
    fontSize: theme.typography.body,
    color: theme.colors.textMuted,
  },

  /* 제품명 */
  productNameContainer: {
    marginBottom: theme.spacing(2),
    padding: theme.spacing(1.5),
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
  },
  productName: {
    fontSize: theme.typography.title,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing(0.5),
  },
  confidence: {
    fontSize: theme.typography.small,
    color: theme.colors.textMuted,
  },

  /* 섹션 타이틀 */
  sectionTitle: {
    fontSize: theme.typography.subtitle,
    fontWeight: '700',
    marginBottom: theme.spacing(1.5),
    color: theme.colors.text,
  },

  /* 신호등 전체 */
  signalWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(3),
    paddingHorizontal: theme.spacing(1),
  },

  signalItem: {
    alignItems: 'center',
    width: '30%',
  },

  signalLight: {
    width: 55,
    height: 55,
    borderRadius: 55 / 2,
    marginBottom: theme.spacing(0.5),
  },

  /* 활성/비활성 */
  active: { opacity: 1 },
  inactive: { opacity: 0.3 },

  signalText: {
    fontSize: theme.typography.body,
  },
  signalTextActive: {
    fontWeight: '700',
    color: theme.colors.text,
  },
  signalTextInactive: {
    color: theme.colors.textMuted,
  },

  /* 상세결과 설명 */
  summaryDesc: {
    fontSize: theme.typography.body,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing(2),
    lineHeight: 20,
  },

  /* 카드들 */
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing(1.5),
    justifyContent: 'space-between',
    marginBottom: theme.spacing(3),
  },
  resultCard: {
    width: '48%',
    paddingVertical: theme.spacing(2),
    borderRadius: theme.radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },

  cardTitle: {
    fontSize: theme.typography.body,
    color: '#fff',
  },
  cardValue: {
    fontSize: theme.typography.subtitle,
    fontWeight: '700',
    color: '#fff',
    marginTop: theme.spacing(0.5),
  },

  /* 카드 색 */
  green: { backgroundColor: '#40C057' },
  yellow: { backgroundColor: '#FAB005' },
  red: { backgroundColor: '#FA5252' },

  /* 알레르기 */
  allergyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
  allergyChip: {
    backgroundColor: '#FA5252',
    paddingHorizontal: theme.spacing(1.5),
    paddingVertical: theme.spacing(0.8),
    borderRadius: theme.radius.lg,
  },
  allergyText: {
    color: '#fff',
    fontSize: theme.typography.body,
    fontWeight: '600',
  },

  /* 성분 목록 */
  ingredientsContainer: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing(1.5),
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing(2),
  },
  ingredientsText: {
    fontSize: theme.typography.body,
    color: theme.colors.text,
    lineHeight: 20,
  },
});
