export interface LoginCredentials {
  usernameOrEmail: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  userName: string;
  role: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface AuthError {
  message: string;
}