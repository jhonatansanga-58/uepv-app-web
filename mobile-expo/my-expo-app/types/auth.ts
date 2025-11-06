export interface LoginCredentials {
  usernameOrEmail: string;
  password: string;
}

// API returns at minimum id, name and role. Other fields are optional.
export interface User {
  id: number;
  name: string;
  role: string;
  email?: string;
  userName?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface AuthError {
  message: string;
}