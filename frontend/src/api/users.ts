import { apiRequest } from '@/api/client';
import type {
  CreateUserInput,
  Paginated,
  UpdateUserInput,
  User,
  UserRole,
  UserStatus,
} from '@/types/user';

interface Envelope<T> {
  data: T;
}

export interface ListUsersParams {
  search?: string;
  role?: UserRole;
  status?: UserStatus;
  sort?: 'name' | 'email' | 'role' | 'status' | 'created_at';
  direction?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}

function toQueryString(params: ListUsersParams): string {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, String(value));
    }
  });

  const serialized = query.toString();

  return serialized ? `?${serialized}` : '';
}

export function listUsers(params: ListUsersParams = {}): Promise<Paginated<User>> {
  return apiRequest<Paginated<User>>(`/users${toQueryString(params)}`);
}

export async function getUser(id: number): Promise<User> {
  const response = await apiRequest<Envelope<User>>(`/users/${id}`);

  return response.data;
}

export async function createUser(input: CreateUserInput): Promise<User> {
  const response = await apiRequest<Envelope<User>>('/users', {
    method: 'POST',
    body: JSON.stringify(input),
  });

  return response.data;
}

export async function updateUser(id: number, input: UpdateUserInput): Promise<User> {
  const response = await apiRequest<Envelope<User>>(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });

  return response.data;
}

export async function deleteUser(id: number): Promise<void> {
  await apiRequest<void>(`/users/${id}`, { method: 'DELETE' });
}
