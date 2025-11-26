// app/scan.tsx
import { useEffect, useRef, useState } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { theme } from '../constants/theme';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, API_ENDPOINTS } from '../constants/api';
import { extractTextFromImage } from '../services/geminiOcrService';

export default function ScanScreen() {
  const router = useRouter();

  // 카메라 권한
  const [permission, requestPermission] = useCameraPermissions();

  // 카메라 Ref
  const cameraRef = useRef<any>(null);

  // 로딩 표시
  const [loading, setLoading] = useState(false);

  // 디버그 로그
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  // 디버그 로그 추가 함수
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    setDebugLogs(prev => [...prev, logMessage].slice(-10)); // 최근 10개만 유지
  };

  // 권한 요청
  useEffect(() => {
    if (!permission) return;
    if (!permission.granted) {
      requestPermission();
    }
  }, [permission]);

  // 권한 체크
  if (!permission) {
    return (
      <SafeAreaView style={styles.center}>
        <Text>카메라 권한 확인중...</Text>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={{ marginBottom: 10 }}>카메라 권한이 필요합니다.</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
          <Text style={styles.mainButtonText}>권한 허용하기</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // 촬영 및 Gemini OCR 처리
  const handleTakePhoto = async () => {
    console.log('🔥 촬영 버튼 클릭됨!');
    Alert.alert('알림', '촬영 버튼이 눌렸습니다!');

    if (!cameraRef.current) {
      console.log('❌ 카메라 ref가 없음');
      Alert.alert('오류', '카메라가 준비되지 않았습니다.');
      return;
    }

    if (cameraRef.current) {
      setLoading(true);
      addLog('📸 사진 촬영 시작...');

      try {
        // 사진 촬영
        const photo = await cameraRef.current.takePictureAsync({
          base64: false,
          quality: 0.8,
        });

        addLog(`✅ 사진 촬영 성공! ${photo.width}x${photo.height}`);
        addLog('🔍 Gemini OCR 시작...');

        // Gemini OCR로 텍스트 추출
        const ocrResult = await extractTextFromImage(photo.uri);

        if (ocrResult.success && ocrResult.text) {
          addLog(`✅ OCR 성공! (${ocrResult.text.length}자)`);
          addLog(`📝 추출된 텍스트: ${ocrResult.text.substring(0, 50)}...`);

          // OCR 결과로 데모 데이터 생성
          const demoData = {
            scanId: 'ocr-scan-' + Date.now(),
            extractedText: ocrResult.text,
            ingredients: parseIngredients(ocrResult.text),
            allergens: parseAllergens(ocrResult.text),
            sodium: 450,
            sugar: 12,
            recommendation: 'caution',
            analysis: `성분표에서 ${ocrResult.text.length}자의 텍스트를 추출했습니다.`,
          };

          addLog('🎯 결과 화면으로 이동...');

          router.replace({
            pathname: '/result',
            params: {
              scanId: demoData.scanId,
              data: JSON.stringify(demoData),
            },
          });
        } else {
          addLog(`❌ OCR 실패: ${ocrResult.error}`);
          Alert.alert('오류', ocrResult.error || '텍스트를 추출할 수 없습니다.');
          setLoading(false);
        }

      } catch (error) {
        addLog(`❌ 오류 발생: ${error}`);
        console.error('Photo error:', error);
        Alert.alert('오류', '처리 중 문제가 발생했습니다.');
        setLoading(false);
      }
    }
  };

  // 간단한 성분 파싱 (실제로는 더 정교한 파싱 필요)
  const parseIngredients = (text: string): string[] => {
    // 기본 성분 키워드 추출 (예시)
    const commonIngredients = ['물', '설탕', '소금', '밀가루', '식용유', '간장', '고추가루'];
    return commonIngredients.filter(ingredient => text.includes(ingredient));
  };

  // 간단한 알레르기 유발 성분 파싱
  const parseAllergens = (text: string): string[] => {
    const commonAllergens = ['밀', '대두', '우유', '계란', '땅콩', '새우', '게'];
    return commonAllergens.filter(allergen => text.includes(allergen));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* 상단 헤더 (화살표 X, 가운데 제목만) */}
        <View style={styles.headerCenter}>
          <Text style={styles.title}>성분표 스캔</Text>
        </View>

        {/* 카메라 미리보기 */}
        <View style={styles.previewWrapper}>
          <CameraView
            style={styles.camera}
            ref={cameraRef}
          />

          {/* 🔥 로딩 오버레이 */}
          {loading && (
            <View style={styles.loadingOverlay}>
              <Text style={styles.loadingText}>분석중...</Text>
            </View>
          )}
        </View>

        {/* 원형 촬영 버튼 */}
        <View style={styles.captureWrapper}>
          <TouchableOpacity
            style={styles.captureButton}
            onPress={handleTakePhoto}
            disabled={loading}
          >
            <Ionicons name="camera" size={32} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* 디버그 로그 패널 */}
        {debugLogs.length > 0 && (
          <View style={styles.debugContainer}>
            <Text style={styles.debugLabel}>🐛 디버그 로그</Text>
            <ScrollView style={styles.debugScrollView}>
              {debugLogs.map((log, index) => (
                <Text key={index} style={styles.debugText}>
                  {log}
                </Text>
              ))}
            </ScrollView>
          </View>
        )}

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
  },

  headerCenter: {
    alignItems: 'center',
    marginBottom: theme.spacing(1.5),
  },

  title: {
    fontSize: theme.typography.subtitle,
    fontWeight: '600',
    color: theme.colors.text,
  },

  previewWrapper: {
    width: '100%',
    height: '55%',
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: theme.colors.primary,
    marginVertical: theme.spacing(2),
    position: 'relative',
  },

  camera: {
    width: '100%',
    height: '100%',
  },

  loadingOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },

  loadingText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },

  captureWrapper: {
    width: '100%',
    alignItems: 'center',
    marginTop: theme.spacing(1.5),
  },

  captureButton: {
    width: 65,
    height: 65,
    borderRadius: 65 / 2,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
  },

  permissionButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing(1.4),
    paddingHorizontal: theme.spacing(2),
    borderRadius: theme.radius.lg,
  },

  mainButtonText: {
    fontSize: theme.typography.subtitle,
    color: '#FFFFFF',
    fontWeight: '600',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  debugContainer: {
    marginTop: theme.spacing(2),
    padding: theme.spacing(1.5),
    backgroundColor: '#f5f5f5',
    borderRadius: theme.radius.md,
  },
  debugLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: theme.spacing(1),
    color: '#666',
  },
  debugScrollView: {
    maxHeight: 150,
    backgroundColor: '#1e1e1e',
    borderRadius: theme.radius.sm,
    padding: theme.spacing(1),
  },
  debugText: {
    fontSize: 10,
    lineHeight: 14,
    color: '#00ff00',
    fontFamily: 'monospace',
    marginBottom: 2,
  },
});
