export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt?: string;
}

