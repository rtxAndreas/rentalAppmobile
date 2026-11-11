import { apiRequest } from '@/api/client';
import type { AuthPayload, User } from '@/types/user';

export interface RegisterInput {
  name: string;
  email: string;
  phone?: string | null;
  password: string;
  password_confirmation: string;
  device_name?: string;
}

interface Envelope<T> {
  data: T;
}

export async function login(
  email: string,
  password: string,
  deviceName = 'mobile'
): Promise<AuthPayload> {
  const response = await apiRequest<Envelope<AuthPayload>>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password, device_name: deviceName }),
  });

  return response.data;
}

export async function register(input: RegisterInput): Promise<AuthPayload> {
  const response = await apiRequest<Envelope<AuthPayload>>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ device_name: 'mobile', ...input }),
  });

  return response.data;
}

export async function me(): Promise<User> {
  const response = await apiRequest<Envelope<User>>('/auth/me');

  return response.data;
}

export async function logout(): Promise<void> {
  await apiRequest<void>('/auth/logout', { method: 'POST' });
}
