// app/history.tsx
import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../constants/theme';

type Grade = 'good' | 'warn' | 'danger';

type HistoryItem = {
  id: string;
  image: string;   // 썸네일 URL
  grade: Grade;
  date: string;
};

const mockHistory: HistoryItem[] = [
  {
    id: '1',
    image: 'https://via.placeholder.com/200x150',
    grade: 'good',
    date: '2025-11-23 21:20',
  },
  {
    id: '2',
    image: 'https://via.placeholder.com/200x150',
    grade: 'warn',
    date: '2025-11-22 19:11',
  },
  {
    id: '3',
    image: 'https://via.placeholder.com/200x150',
    grade: 'danger',
    date: '2025-11-21 12:05',
  },
];

export default function HistoryScreen() {
  const router = useRouter();

  const renderItem = ({ item }: { item: HistoryItem }) => {
    const gradeLabel =
      item.grade === 'good'
        ? '🟢 섭취 가능'
        : item.grade === 'warn'
        ? '🟡 주의 필요'
        : '🔴 섭취 비추천';

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          // 🔥 History → Result 는 push 사용
          router.push({
            pathname: '/result',
            params: {
              image: item.image, // 지금은 URL, 나중에 base64로 바꿔도 됨
            },
          })
        }
      >
        <Image source={{ uri: item.image }} style={styles.thumbnail} />

        <View style={styles.cardTextBox}>
          <Text style={styles.date}>{item.date}</Text>
          <Text style={styles.grade}>{gradeLabel}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>최근 스캔 기록</Text>

        <FlatList
          data={mockHistory}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: theme.spacing(2) }}
        />
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
  },
  title: {
    fontSize: theme.typography.subtitle,
    fontWeight: '700',
    marginBottom: theme.spacing(2),
    color: theme.colors.text,
  },
  card: {
    flexDirection: 'row',
    padding: theme.spacing(1.5),
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing(1.5),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  thumbnail: {
    width: 70,
    height: 70,
    borderRadius: theme.radius.md,
    backgroundColor: '#EEE',
  },
  cardTextBox: {
    marginLeft: theme.spacing(1.5),
  },
  date: {
    fontSize: theme.typography.body,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing(0.5),
  },
  grade: {
    fontSize: theme.typography.body,
    fontWeight: '600',
    color: theme.colors.text,
  },
});
