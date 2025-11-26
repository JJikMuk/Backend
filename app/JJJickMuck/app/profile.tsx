// app/profile.tsx
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { theme } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';

const ALLERGY_OPTIONS = [
  { key: 'milk', label: '우유' },
  { key: 'egg', label: '계란' },
  { key: 'peanut', label: '땅콩' },
  { key: 'soy', label: '대두' },
  { key: 'wheat', label: '밀' },
  { key: 'tree_nut', label: '견과류' },
  { key: 'shellfish', label: '갑각류' },
  { key: 'fish', label: '생선' },
];

const DIET_OPTIONS = [
  { key: 'normal', label: '일반 식단' },
  { key: 'vegetarian', label: '채식 위주' },
  { key: 'vegan', label: '비건' },
  { key: 'pesco', label: '페스코' },
];

const STORAGE_KEY = '@user_profile_settings';

export default function ProfileScreen() {
  const router = useRouter();
  const { logout } = useAuth();

  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [diet, setDiet] = useState<string>('normal');
  const [memo, setMemo] = useState<string>('');

  // 저장된 설정 불러오기
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const json = await AsyncStorage.getItem(STORAGE_KEY);
        if (json) {
          const data = JSON.parse(json);
          if (Array.isArray(data.allergies)) {
            setSelectedAllergies(data.allergies);
          }
          if (typeof data.diet === 'string') {
            setDiet(data.diet);
          }
          if (typeof data.memo === 'string') {
            setMemo(data.memo);
          }
        }
      } catch (e) {
        console.log('알레르기 설정 로드 실패:', e);
      }
    };

    loadSettings();
  }, []);

  // 알레르기 토글
  const toggleAllergy = (key: string) => {
    setSelectedAllergies((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  // 저장
  const handleSave = async () => {
    try {
      const payload = {
        allergies: selectedAllergies,
        diet,
        memo,
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      Alert.alert('저장 완료', '알레르기 / 식단 정보가 저장되었습니다.');
      router.back(); // 이전 화면으로 (Home으로 돌아가기)
    } catch (e) {
      console.log('저장 실패:', e);
      Alert.alert('오류', '설정을 저장하는 중 오류가 발생했습니다.');
    }
  };

  // 로그아웃
  const handleLogout = () => {
    Alert.alert(
      '로그아웃',
      '로그아웃 하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* 타이틀 */}
        <Text style={styles.title}>내 알레르기 / 식단 설정</Text>
        <Text style={styles.subtitle}>
          자주 먹는 음식과 알레르기를 미리 알려주면
          {'\n'}스캔 결과를 더 정확하게 보여줄 수 있어요.
        </Text>

        {/* 알레르기 선택 */}
        <Text style={styles.sectionTitle}>알레르기</Text>
        <View style={styles.chipContainer}>
          {ALLERGY_OPTIONS.map((item) => {
            const isSelected = selectedAllergies.includes(item.key);
            return (
              <TouchableOpacity
                key={item.key}
                style={[
                  styles.chip,
                  isSelected && styles.chipSelected,
                ]}
                onPress={() => toggleAllergy(item.key)}
              >
                <Text
                  style={[
                    styles.chipText,
                    isSelected && styles.chipTextSelected,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 식단 설정 */}
        <Text style={styles.sectionTitle}>식단 타입</Text>
        <View style={styles.dietContainer}>
          {DIET_OPTIONS.map((item) => {
            const isSelected = diet === item.key;
            return (
              <TouchableOpacity
                key={item.key}
                style={[
                  styles.dietButton,
                  isSelected && styles.dietButtonSelected,
                ]}
                onPress={() => setDiet(item.key)}
              >
                <Text
                  style={[
                    styles.dietText,
                    isSelected && styles.dietTextSelected,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 메모 */}
        <Text style={styles.sectionTitle}>추가 메모 (선택)</Text>
        <Text style={styles.memoHint}>
          예) 나트륨 높은 음식은 피하고 싶어요, 카페인 적은 음료 선호 등
        </Text>
        <TextInput
          style={styles.memoInput}
          placeholder="자유롭게 적어주세요."
          placeholderTextColor={theme.colors.textMuted}
          multiline
          value={memo}
          onChangeText={setMemo}
        />

        {/* 저장 버튼 */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>설정 저장하기</Text>
        </TouchableOpacity>

        {/* 로그아웃 버튼 */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>로그아웃</Text>
        </TouchableOpacity>
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
    paddingBottom: theme.spacing(4),
  },
  title: {
    fontSize: theme.typography.subtitle,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing(0.5),
  },
  subtitle: {
    fontSize: theme.typography.body,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing(2.5),
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: theme.typography.subtitle,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: theme.spacing(1.5),
    marginBottom: theme.spacing(1),
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
  chip: {
    paddingHorizontal: theme.spacing(1.6),
    paddingVertical: theme.spacing(0.8),
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: theme.colors.surface,
  },
  chipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipText: {
    fontSize: theme.typography.body,
    color: theme.colors.text,
  },
  chipTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  dietContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
  dietButton: {
    paddingHorizontal: theme.spacing(1.8),
    paddingVertical: theme.spacing(0.9),
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dietButtonSelected: {
    backgroundColor: '#FFE8B3',
    borderColor: theme.colors.primary,
  },
  dietText: {
    fontSize: theme.typography.body,
    color: theme.colors.text,
  },
  dietTextSelected: {
    fontWeight: '600',
    color: theme.colors.text,
  },
  memoHint: {
    fontSize: theme.typography.small,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing(1),
  },
  memoInput: {
    minHeight: 80,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: theme.spacing(1.4),
    paddingVertical: theme.spacing(1),
    backgroundColor: theme.colors.surface,
    textAlignVertical: 'top',
    marginBottom: theme.spacing(3),
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    paddingVertical: theme.spacing(1.6),
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: theme.typography.subtitle,
    fontWeight: '700',
    color: '#fff',
  },
  logoutButton: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    paddingVertical: theme.spacing(1.6),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginTop: theme.spacing(2),
  },
  logoutButtonText: {
    fontSize: theme.typography.subtitle,
    fontWeight: '600',
    color: '#DC3545',
  },
});
