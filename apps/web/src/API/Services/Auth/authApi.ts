import type { User } from '../../../types';
import { clearAuth, getAuthToken, setAuthToken } from '../../../utils/authToken';
import api, { PublicApi } from '../../api';

export async function signUp(
  fullName: string,
  email: string,
  password: string,
): Promise<{ email: string }> {
  const { data } = await PublicApi.post('/api/v1/auth/register', {
    fullName,
    email,
    password,
  });

  return data?.user ?? data?.data ?? { email };
}

export async function verifyEmail(email: string, code: string): Promise<void> {
  await PublicApi.post('/api/v1/auth/verify-email', { email, code });
}

export async function resendVerificationCode(email: string): Promise<void> {
  await PublicApi.post('/api/v1/auth/resend-verification', { email });
}

export async function requestPasswordReset(email: string): Promise<void> {
  await PublicApi.post('/api/v1/auth/forgot-password', { email });
}

export async function resetPassword(
  email: string,
  token: string,
  newPassword: string,
): Promise<void> {
  await PublicApi.post('/api/v1/auth/reset-password', {
    email,
    token,
    newPassword,
    confirmPassword: newPassword,
  });
}

export async function login(email: string, password: string): Promise<User> {
  const { data } = await PublicApi.post('/api/v1/auth/login', {
    email,
    password,
  });

  const user = data?.user ?? data?.data?.user ?? data;
  const token = data?.token ?? data?.data?.token;

  if (token) {
    setAuthToken(token);
  }

  return user as User;
}

export async function googleLogin(idToken: string): Promise<User> {
  const { data } = await PublicApi.post('/api/v1/auth/google', {
    idToken,
  });

  const user = data?.user ?? data?.data?.user ?? data;
  const token = data?.token ?? data?.data?.token;

  if (token) {
    setAuthToken(token);
  }

  return user as User;
}

export async function logout(): Promise<void> {
  clearAuth();
}

export async function getCurrentUser(): Promise<User | null> {
  const { data } = await api.get('/api/v1/auth/me');
  return (data?.data as User | null) ?? null;
}


export async function getSession() {
  const token = getAuthToken();
  return token ? { token } : null;
}

