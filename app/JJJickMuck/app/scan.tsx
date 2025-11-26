// app/scan.tsx
import { useEffect, useRef, useState } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { theme } from '../constants/theme';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, API_ENDPOINTS } from '../constants/api';

export default function ScanScreen() {
  const router = useRouter();

  // 카메라 권한
  const [permission, requestPermission] = useCameraPermissions();

  // 카메라 Ref
  const cameraRef = useRef<any>(null);

  // 로딩 표시
  const [loading, setLoading] = useState(false);

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

  // 촬영 및 하드코딩 결과 전송
  const handleTakePhoto = async () => {
    if (cameraRef.current) {
      setLoading(true);

      try {
        // 사진 촬영
        const photo = await cameraRef.current.takePictureAsync({
          base64: false,
          quality: 0.8,
        });

        // 하드코딩: 짧은 분석 시뮬레이션
        setTimeout(() => {
          // 가짜 데이터로 결과 화면 이동
          const demoData = {
            scanId: 'demo-scan-' + Date.now(),
            ingredients: ['물', '설탕', '밀가루', '소금'],
            allergens: ['밀'],
            sodium: 450,
            sugar: 12,
            recommendation: 'caution', // safe, caution, danger
            analysis: '나트륨 함량이 다소 높습니다. 적당히 섭취하세요.',
          };

          router.replace({
            pathname: '/result',
            params: {
              scanId: demoData.scanId,
              data: JSON.stringify(demoData),
            },
          });
        }, 1500);

      } catch (error) {
        console.error('Photo error:', error);
        Alert.alert('오류', '사진 촬영에 실패했습니다.');
        setLoading(false);
      }
    }
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
          <TouchableOpacity style={styles.captureButton} onPress={handleTakePhoto}>
            <Ionicons name="camera" size={32} color="#fff" />
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
});
