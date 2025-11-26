// app/scan.tsx
import { useEffect, useRef, useState } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { theme } from '../constants/theme';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, API_ENDPOINTS } from '../constants/api';
import { extractTextFromImage } from '../services/gptOcrService';

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

  // 🧪 테스트 OCR (base64 샘플 이미지 사용)
  const handleTestOcr = async () => {
    // 간단한 "TEST" 텍스트가 포함된 base64 인코딩 샘플 이미지
    // 실제 사용 시에는 촬영된 이미지를 사용하게 됩니다
    const testImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAABkCAYAAAA8AQ3AAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAABBZSURBVHhe7Z0HeFRV+sd/M5n0RkIIJfQOUkKHUBJAOhZEFAQVXXvZdV1dXV3XsquuXde1YEFdVxQVFRVEQHpLQocECL2E9JCQZPa/3+/ce2cyM8lkJgkBNO/nec5z7j333HObnO+cUkqAQAgEwm0A+SAQCLcBIlgIhNsGESwEwm2DCBYqX4S1xpQEQh0ggmUR4cOHx7dt2zZi0KBBfcPDwzsDQH1i/UlZVDqaAJGRkU0SExMjO3ToEBcTE9NBHS+hSovOXEuUCmPu3LnK22+/rfz+++/K/v37lezsbO0sgu8Ieh6OHj2qfPnll8rMmTOVuLg4VRAGCn+lWbNmE5599tno+++/P4D8IQS/wfUaEYCPAOAmHoBg9O/fv1VaWlqfHj16jHzmmWeeWbNmzev79u37ftOmTWtt2rTpy0uXLl1ksViuEOqSrVu3mtasWaPs2bNH0RyScurUKfKusvXu3XulEIW4rl273vLUU081EoKRKgQrYO3atQm//vrroLfffjti2LBhXdzXkl+cw6mZKPyJ9bV5Uffu3eNGjx49ZtasWc/ceuutt544ceIH0ZO+y8rKOqfNwmGz2cwWi6XUarVa1K9SxWa1WmxWi81aUmGzFZVZbIWlZdaC4gpb/lWbteBqifXq5Qpr/oXS8gvHyyzHDlus+04ZbXsyS207tiulueuKTNc3/V5WumFjuWnzpguWLVuPmLZu/b1Ue0xqc8TpSqPk2LHD5lOnTp0T7SsV+Va7P4XeEy+lsiwvK1/0F24sNxvPhg/+bLR43nPfuHHjqm3atGnz/Pz8cyUlJRU2m21Vhw4dOkjBMZB/hBmffPJJ0+nTp48wGAxf//zzz8nTp0+//aGHHkqZP39+j1WrVsWJwXqtrKzMqv0WlJWWWq75XVpcUlFlsZSWikFcIq7/rqzkkrj+n1abpaS0zFpSVGq+WlhqvnS51HzufKm54JL4fcVoMV4VIvRnYan526IS0+drr5i+3VZY/PPGq6bF2y8b/7/Vl43fLj9jXPTDceP/bcgzfrXojOHT/508afh0YZ7hk/l5ho+/OZH/6bf7L/33+9TsD79MOPnvF/vn/+vxrvnv/a3vlVemdyj56M3E0i/fiTYvWRhe+OPCkEvLV+qurvqtyLpujcm6dYvRunevyXT8hNGcmWk2nz1vLrlwwVKWn28V73aFwVBSUVFROW/evBeOHz9eog1hDq1d++vu3bt//+abb97fsmXLDzt37ly8f//+A9nZ2afOfZ1z+OjRow9t3rz5a/Ge/0DsP27evHnI3r17u+/Zs2cg36Pu3bt3DduxY8doMW5ipkyZsmn16tXr1q9fv1mI69bVq1f/tmXLloU7duz4YN++fZ8eOnTo0BdffPHVBx988MY//vGPf/zrX/966+9///t///a3v/3nxRdf/NcDDzzw+mOPPfbEggULZi9atGjG4sWLH/jpp58WfPXVV18vXrz42z/+8Y8rNGdqI3JuFquvvvpK+fbbbxXRy1SGDx+u/Pzzz8rChQuVP/74wxsB+P3331WcOfTlPGJdRkSAnnnmGT/ffvvt30VjfvmHH354gS59+fLln//000/f/PDDD0vET+rMmTNfvu+++554+OGHn3j00Uf/fscdd8wTPS1hxowZvVNTU/utXLmyr7pmKunp6f1E7+vTvXv3fldcXOy+0f3Dhw8f+fbb7/RLliyx//TTT+pvv/1uF92/+/LlywViqBZu3749edWqVXEbN25su3Hjxqht27aNyMzMlJdqLn1Xrlw5ct26dT1+//334X///ffEzZs3Jy5ZsqTjrFmzxh44cGDQtGnTxhcXF1faVSC9zFZjy5Z9+0uP/pVe/u2yc6WfLL1YOveb0+VvrMw3v/FNrvmN5aeYxhc/S2N69kPxs3je6vxbXt8kpue/z7/lX8vPtv3XN/lx733w2+AZD32f8sbMZx7a+K83H//9w4lDf0weFnP42JD2G/cn9tp3IqXnjtPJ3Tedar9q9e7uyxds6fTXZxb3+NO/vr790SXzBzwyf+79j/xwz0v/t7Tb4r9//s7/fT5mzYufjvzXPXdn/vFiWPvNXw04t/r1vsf/75HZvz/f7vKC/pnP37Px4Ru/njF/1BePzh3+1kfzks+syRjz7aqt419fvvbh17/be/cr326/9YUfdtz40G9/PHffwoyMH+6/Nn/+xv+dPWL2+G4Pvjzv85ceufWfzy6Y9sLtj773t0dff+qrO6f+K+O555/6y9kv/vZEwXevPlP4w+uz8779+5slP73y6N/m3PGvV75d+K+/LP7k04ff//zznMvT2hpO1Q+xfPt6l4q1U3spK6fFWH6aEWVdOy3avGG6q2zjTElp86Uec+rfauzl66YYj6yebNn3++TSjJ/nlx78MfXS/u+fy1x3fOHqIvE+LX1b+rYOx18v63X6i0dGW48taTjyowf6t6lTxayvJSF/EOwKq23hN3mFr/2Yf/njJSXFz/+0+/zDGzafun/Vlv0PrFqbcd9Pv228d8nXv9350re/3j3/8+WPzXju7y+++/jjs59/cN6sB++f+9zDC//+yOOvPv3wqy/P/fPr7/y/F179x2Ovvvr+nU//+5Fp01fc+/Tcn15++Nlfnr9//v+ef+DRu+e//Pji+x9a+dqz3/zpk/cen/WP137+yz++f/Evr77y9IsPf/v6i//4/J8vPvjN03fP+/H5P8+48xrUK3HUPX5z//zF0+9+78Unpr719CMLXnr43s9eeeKBhX994aFFrzx2/+KX7nlg8V/vfmDp63+++KenX/rz4/e9Nv+RN19+ZN7rL3z4wquv/vP9V178+x//+Ue+u0Djk9+0/XXXSt/ehh+ndrX9fkdvW8a9fW1H7ulryz6/rzX73IG2ktz+tsLcZE1ltuQLBq1ZzrPZyh3K39M+NP6RYDYap7w5w/TRr1PyP1yWYn578v6K3xfc/u/HPvzL7W8+cd/r7zw35tUPFt/1/kfz5/3znS+efO/d+c8vfPO5+9//59svvPXcgrdfe2DBW/98ftFb//jLwrdfe/qtN5954/VX//L2v19f8Pbrf1nw9utPL3j79acXvP2PhW//+x+v//vf//rv3//vv//+17//+/b/+9e///XfF96Z/9IHzzz16hNPPvvs40/94+lHnvvbU0/M/cuTf3luzhMvzrv7+f87/eST9yx8d+78Z55/+ZmX//nyS3994+6Xn1jw4ssvvPLCGy+89vLLr/39jece/ttfn/7H3//30jP/fvmZf7z89L9feebvL/z9qacXvjL/+U+ee/6VZ5577rmnnn3u2Wefnjd//rzbb7/97nvuuWfufffdN+/xxx+f++qrr8596aWX/vzcc8/Nffnll+c8//zzf7r//vv/dN999/3p4YcfnjN37tw5zz777JyXXnppzltvvTVn4cKFc5588sm5M2fOnDN16tSJt99++9h77713zqxZs+Y+/vjjc59//vm577zzTnUhOggtLNuJ99/P+27xJ70++nB5j4X//LnHx/98qNcHr/2/Xq+++Hyvf//7z73efv7RPg8/fE//e+95oN/tM+f1n/LnJ/sPHTij/8ChkwZEtR834ckX59/+5HPvznr2tW9nv/T5l9MXfvfJrc9+8vG7b73/+uyXnh72yONzHp73v8VzX/jyl8ffXfbma0u+en3Rr8+9+u1HT7/w9aevL/rlyRe+WT7/+a//cf+TC5/+87t/+fsb37/xj3cWP/f2L0uffuGX1554/oeVL//fsp+efP67d577ZlnGU//+8sTDb//y26MvLln+0Cvf/v7A67+svu+N7xbc87elCx949fM1D7z+xa8P/OeLzXe+9OGye+Y8vXDm4+88MOPJJ15/4KVnHpz+wry7Jj+84IGZjz0+5/6nH3vxnqemTZ53x+wZt7/45vw5bzzx0KS3nnjonjcfuf2Zt5/443OPPzrj/Xv/MufZP82e9efJs/+87Pa579z+0GP3T37miXnvPffc9DdefGDGO/c8+thzt02f+48p771z70N/u+/W+Y/dNuW5u6dNnz333mlzJzxz39QxTz2cPHXOk9O+fnjezO+emPvE53dOe+rbO+c/87e77nx8wT1znn/ursd/eVq854O7p93z/D1zFrxy9z1f/vWhh75+5M6p/5lz771v33HX3z64Y/ac/86e/eqCWbNe/3rWrNe+njVr1rezZr3+/axZr383a9bCxbNmvfv1rFmvfztr1qu/z5r1268zZ/76n1mzXv9x5qzXvp8569XXZ8564Y25s15YMHvW/N/vnPnQfXNnPjbvjpmPzL979sNzX7jlgYW3PPXgn95d8oeX5z77r+df+OezL/7tmZff+tezz/3t2RdfvufFl+e99uJzz7/50tN/+duzf3nxpfvue+H++R89/9BLC155Zu7L/3z+4fvmvjx37ov3PjT33rtmv3D3vfffce+c++fdc8/8e++//657p865+9Y/z717yvy77nxw7p133/vArFmP3HfvvY/MPXDgQA1z1p6NTqQE3P1LK5xBBQcOHFBESVHGjBmjvPfee8rjjz+uzJo1S3nzzTeVadOmKQsWLFCeeOIJ5eGHH1YeeuihRY888sgjc+bMmfsf8e9lzpw5cxcsWHD3ggUL7pn/0uz7vlp49wePL77n9eeeuz1l8aTZvZ955J4/vfLOndPm33PrJ+/fPvvlZ+fN+L95j7w46+HnHrz1nw/dNvf1e+bO/dezD9w6748P3zZ3+YK5c1+dc9fdDz906z1fPfx/c997Zt7cb1+4f95LTz7w8IMP3vPwq+8+MHv2vDfv+dNd9/1p+tx7HnvqT3P+/sS8+Y/eNW3a67Nn3zn1zukP3z1rwZ/uuW3q7PtunTZl+pSp986cOu2Oe/80+8777rrv1jvumT97zsy7H77/9vtmLZh+/wMz7r7vrlm3PzBj2l13T5s+9UF6P3rPvffcOe1Pkx+85/bbp91zx9vvT581e+r0Dx6Y+eCCB/80bcGCBbfPmTNnwj333HPPhAkTJk2bNm3SPffcM/m2226bdM8990y67777Js2bN29SQkLC5EGDBk0dO3bsZPpLmJKSMm7s2LFTx40bN+Wmm266ZeLEiePnzZs3/p577hn/0EMPjZ8/f/74xYsXj1+wYMG0u+++e8LcuXNvefjhh6fcf//9N91///2T7rnnnknvvffeJBEy5T333NO1oKCgWnldpw4WiESFu7m58tbXIqImCdWJhYWF3gTx9mCdEMGLL76oPP/888oTTzyhChKZPXu2OqFvscwyOX5dcR1Suwg0afzzwfP4zn9vZMR7dUvQpqoVx49Uw0rrOzZtPl6l/qsU9mB/xDH+ffLLJUm//ZIW0aFlqxZt2zRu0qhBZOP6EY2jaI6/wWBo3LBBvYiIMIMhLLRe/fohISEhxiHR4cZ24cHGHmH1StuGGku61as0NTSUtwky9DdVGoOUSKUz3jTwXx76FPqfMKXe/6+h0vv/asqvAO15RvvcKvuXKhXO+36UqvffX/n1v9dQ7vuXSm66/tU/hStd//JKp+v5K1ffv1TKfe7X71xS7+qfVCm3/1n1n/x6/P9XmAXw9fYpVZ6oSnr5b+GulKpTKzr6r1ZhOXTqRKXMqQ3lWc+/c/vSokstKF0Rw4blJ8Z/9Nj4Fo89//j4T6eMl6WuT/38Yfzxpxvh+I8jRp55ZXz2wsnD9k4aP+TFSeN7f3nz+J5fThvfc+EdN3X/4r5J/efcfWf/2bcNGHzXhGH9H7lz0rhbp4299bbJ425P7dC9VYt2kS2bN2jQMKxBaEhofXN5veIQg6E0zBhiMunLMplDGzVu0rRZs2b1Ii0W+9UKm91usdrteVZ1EWb+FZvtSoXNdrbSZj9kq7DtsVltO22a1nLRvdRqt20qsdlW223W5SU226K8svKvs8rKluaZzYtyLeVfHi+3fX7KYv5gs8X88c6K8n+vKy9/a63N/tqKsvI3Vlot76wtLX19dan1jaXlljc3Wi0v/l5ifmWx2fz3pSWGlxeVmf+2pKTibwuLzX9bUGp5/ofi8ucXlZmf+7HY+Oz3JrPovufnX7O88Oveyuc+sliffNfyzAfC7fNf/cdrs26aeNPok4fPXIxu37r0aIS+3Bimr5h5c+K/nh3/x8ND+76UFFv/YGx4aY/ooIu3dGqXN6xJqDG9SWTZzlbRZ4Y0Ds/v3zCkqFtEWMmIMKPF2C7CnBkbaTxvKLeVFZlsFSFhYXp7eL0KVd39fH8IHFzntAqP0z+i5/Fua28fgZugljusI0eO5P9v9WH88ccfEkn85NcbqBMQ0agFj6TxmDVrli9iVaC34T0oO1+hfg2Fm6AGv6YApRO5SX8Cga6F/uXfg1rXiODpg7vk3BxOb65BPV5n/R8HhDpGFx0eYtQPrh+BEADoBwQC4baAAQbBf4hUH4IQCAjBAEJAIPgPIgICgXDbIIKFQLhdEMH6P0Kxo36LekO6AAAAAElFTkSuQmCC';

    setLoading(true);
    addLog('🧪 테스트 이미지로 OCR 시작...');
    addLog('ℹ️ base64 인코딩된 샘플 이미지 사용');

    try {
      const result = await extractTextFromImage(testImageBase64);

      if (result.success) {
        addLog(`✅ 테스트 성공! (${result.text?.length || 0}자)`);
        addLog(`📝 추출된 텍스트: ${result.text?.substring(0, 100)}...`);

        Alert.alert(
          '테스트 성공',
          `추출된 텍스트:\n\n${result.text}`,
          [{ text: '확인' }]
        );
      } else {
        addLog(`❌ 테스트 실패: ${result.error}`);
        Alert.alert('테스트 실패', result.error || '알 수 없는 오류');
      }
    } catch (error) {
      addLog(`❌ 테스트 오류: ${error}`);
      Alert.alert('오류', String(error));
    } finally {
      setLoading(false);
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
          <TouchableOpacity
            style={styles.captureButton}
            onPress={handleTakePhoto}
            disabled={loading}
          >
            <Ionicons name="camera" size={32} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* 🧪 테스트 버튼 */}
        <View style={styles.testButtonWrapper}>
          <TouchableOpacity
            style={styles.testButton}
            onPress={handleTestOcr}
            disabled={loading}
          >
            <Text style={styles.testButtonText}>🧪 테스트 이미지로 OCR 실행</Text>
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

  testButtonWrapper: {
    width: '100%',
    alignItems: 'center',
    marginTop: theme.spacing(1),
  },

  testButton: {
    backgroundColor: '#6c757d',
    paddingVertical: theme.spacing(1.2),
    paddingHorizontal: theme.spacing(2),
    borderRadius: theme.radius.md,
  },

  testButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
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
