import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "홈" }} />
      <Stack.Screen name="scan" options={{ title: "스캔" }} />
      <Stack.Screen name="result" options={{ title: "결과" }} />
      <Stack.Screen name="history" options={{ title: "기록" }} />
      <Stack.Screen name="profile" options={{ title: "내 정보" }} />  
    </Stack>
  );
}
