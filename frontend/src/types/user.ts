export type UserRole = 'admin' | 'manager' | 'client';

export type UserStatus = 'active' | 'inactive';

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  role_label: string;
  status: UserStatus;
  status_label: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthPayload {
  user: User;
  token: string;
}

export interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

export interface PaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  links: PaginationLink[];
  path: string;
  per_page: number;
  to: number | null;
  total: number;
}

export interface Paginated<T> {
  data: T[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: PaginationMeta;
}

export interface CreateUserInput {
  name: string;
  email: string;
  phone?: string | null;
  password: string;
  password_confirmation: string;
  role: UserRole;
  status?: UserStatus;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  phone?: string | null;
  password?: string;
  password_confirmation?: string;
  role?: UserRole;
  status?: UserStatus;
}
