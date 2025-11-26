import { Stack } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext';

export default function Layout() {
  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen name="login" options={{ title: "로그인", headerShown: false }} />
        <Stack.Screen name="register" options={{ title: "회원가입" }} />
        <Stack.Screen name="index" options={{ title: "홈" }} />
        <Stack.Screen name="scan" options={{ title: "스캔" }} />
        <Stack.Screen name="result" options={{ title: "결과" }} />
        <Stack.Screen name="history" options={{ title: "기록" }} />
        <Stack.Screen name="profile" options={{ title: "내 정보" }} />
      </Stack>
    </AuthProvider>
  );
}
