import { API_BASE_URL, API_ENDPOINTS } from '../constants/api';

interface LoginResponse {
  message: string;
  token: string;
}

interface RegisterResponse {
  message: string;
  uuid: string;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.LOGIN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || '로그인에 실패했습니다.');
    }

    return data;
  } catch (error: any) {
    if (error.message) {
      throw error;
    }
    throw new Error('네트워크 오류가 발생했습니다.');
  }
}

export async function register(email: string, password: string): Promise<RegisterResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.REGISTER}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || '회원가입에 실패했습니다.');
    }

    return data;
  } catch (error: any) {
    if (error.message) {
      throw error;
    }
    throw new Error('네트워크 오류가 발생했습니다.');
  }
}

export async function logout(): Promise<void> {
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  await AsyncStorage.removeItem('authToken');
}

export async function getAuthToken(): Promise<string | null> {
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  return await AsyncStorage.getItem('authToken');
}

export async function isAuthenticated(): Promise<boolean> {
  const token = await getAuthToken();
  return token !== null;
}
