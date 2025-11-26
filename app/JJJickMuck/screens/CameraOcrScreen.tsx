import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { extractTextFromImage, extractStructuredData } from '../services/geminiOcrService';

export default function CameraOcrScreen() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const cameraRef = useRef<any>(null);

  // 디버그 로그 추가 함수
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    setDebugLogs(prev => [...prev, logMessage].slice(-10)); // 최근 10개만 유지
  };

  // 카메라 권한 확인
  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>카메라 권한이 필요합니다</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>권한 요청</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 카메라 전환
  const toggleCameraFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  // 사진 촬영
  const takePicture = async () => {
    if (!cameraRef.current) return;

    addLog('📸 사진 촬영 시작...');

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      addLog(`✅ 사진 촬영 성공! ${photo.width}x${photo.height}`);
      addLog(`📷 URI: ${photo.uri.substring(0, 50)}...`);

      setCapturedImage(photo.uri);
      setExtractedText('');
    } catch (error) {
      addLog(`❌ 촬영 실패: ${error}`);
      Alert.alert('오류', '사진 촬영에 실패했습니다.');
    }
  };

  // OCR 텍스트 추출
  const performOcr = async () => {
    if (!capturedImage) return;

    setLoading(true);
    addLog('🔍 텍스트 추출 시작...');

    try {
      const result = await extractTextFromImage(capturedImage);
      addLog(`📊 API 응답 받음: ${result.success ? '성공' : '실패'}`);

      if (result.success && result.text) {
        addLog(`✅ 텍스트 추출 성공! (${result.text.length}자)`);
        setExtractedText(result.text);
        Alert.alert('성공', '텍스트가 추출되었습니다!');
      } else {
        addLog(`❌ 추출 실패: ${result.error}`);
        Alert.alert('오류', result.error || '텍스트를 추출할 수 없습니다.');
      }
    } catch (error) {
      addLog(`❌ OCR 오류: ${error}`);
      Alert.alert('오류', 'OCR 처리 중 문제가 발생했습니다.');
    } finally {
      setLoading(false);
      addLog('🏁 OCR 처리 완료');
    }
  };

  // 구조화된 데이터 추출 (명함 예시)
  const extractBusinessCard = async () => {
    if (!capturedImage) return;

    setLoading(true);
    addLog('💼 명함 데이터 추출 시작...');

    try {
      const result = await extractStructuredData(capturedImage, 'business-card');
      addLog(`📊 API 응답 받음: ${result.success ? '성공' : '실패'}`);

      if (result.success && result.data) {
        addLog('✅ 명함 데이터 추출 성공!');

        // 구조화된 데이터를 보기 좋게 표시
        const formatted = JSON.stringify(result.data, null, 2);
        setExtractedText(formatted);
        Alert.alert('성공', '명함 데이터가 추출되었습니다!');
      } else {
        addLog(`❌ 추출 실패: ${result.error}`);
        Alert.alert('오류', result.error || '데이터를 추출할 수 없습니다.');
      }
    } catch (error) {
      addLog(`❌ 명함 오류: ${error}`);
      Alert.alert('오류', '데이터 추출 중 문제가 발생했습니다.');
    } finally {
      setLoading(false);
      addLog('🏁 명함 처리 완료');
    }
  };

  // 다시 촬영
  const retakePicture = () => {
    setCapturedImage(null);
    setExtractedText('');
  };

  // 촬영된 이미지가 있을 때
  if (capturedImage) {
    return (
      <View style={styles.container}>
        <ScrollView style={styles.resultContainer}>
          <Image source={{ uri: capturedImage }} style={styles.capturedImage} />

          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary]}
              onPress={performOcr}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>텍스트 추출</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={extractBusinessCard}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>명함 인식</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonOutline]}
              onPress={retakePicture}
              disabled={loading}
            >
              <Text style={[styles.buttonText, styles.outlineText]}>다시 촬영</Text>
            </TouchableOpacity>
          </View>

          {extractedText ? (
            <View style={styles.textContainer}>
              <Text style={styles.label}>추출된 텍스트:</Text>
              <ScrollView style={styles.textScrollView}>
                <Text style={styles.extractedText}>{extractedText}</Text>
              </ScrollView>
            </View>
          ) : null}

          {/* 디버그 로그 패널 */}
          {debugLogs.length > 0 && (
            <View style={styles.debugContainer}>
              <Text style={styles.debugLabel}>🐛 디버그 로그:</Text>
              <ScrollView style={styles.debugScrollView}>
                {debugLogs.map((log, index) => (
                  <Text key={index} style={styles.debugText}>
                    {log}
                  </Text>
                ))}
              </ScrollView>
            </View>
          )}
        </ScrollView>
      </View>
    );
  }

  // 카메라 화면
  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
        <View style={styles.cameraControls}>
          <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
            <Text style={styles.flipButtonText}>🔄</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>

          <View style={styles.placeholder} />
        </View>
      </CameraView>

      <View style={styles.instructions}>
        <Text style={styles.instructionText}>
          문서나 텍스트가 보이도록 촬영해주세요
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    color: '#fff',
    fontSize: 16,
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    padding: 20,
    paddingBottom: 40,
  },
  flipButton: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flipButtonText: {
    fontSize: 30,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: '#fff',
  },
  placeholder: {
    width: 60,
  },
  instructions: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  instructionText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  resultContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  capturedImage: {
    width: '100%',
    height: 300,
    resizeMode: 'contain',
    backgroundColor: '#000',
  },
  buttonGroup: {
    padding: 20,
    gap: 10,
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  buttonPrimary: {
    backgroundColor: '#007AFF',
  },
  buttonSecondary: {
    backgroundColor: '#34C759',
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  outlineText: {
    color: '#007AFF',
  },
  textContainer: {
    padding: 20,
    paddingTop: 0,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  textScrollView: {
    maxHeight: 300,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 15,
  },
  extractedText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
  debugContainer: {
    padding: 20,
    paddingTop: 0,
  },
  debugLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    color: '#666',
  },
  debugScrollView: {
    maxHeight: 200,
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    padding: 12,
  },
  debugText: {
    fontSize: 11,
    lineHeight: 16,
    color: '#00ff00',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
});
