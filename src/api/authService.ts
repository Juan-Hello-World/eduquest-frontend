
import { axiosInstance } from './axiosInstance';
import { AuthResponse, LoginRequest, RegisterRequest } from '../types';

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const { data } = await axiosInstance.post<AuthResponse>('/auth/login', credentials);
    return data;
  },

  async register(payload: RegisterRequest): Promise<AuthResponse> {
    const { data } = await axiosInstance.post<AuthResponse>('/auth/register', payload);
    return data;
  },

  async refresh(refreshToken: string): Promise<AuthResponse> {
    const { data } = await axiosInstance.post<AuthResponse>('/auth/refresh', { refreshToken });
    return data;
  },
};
