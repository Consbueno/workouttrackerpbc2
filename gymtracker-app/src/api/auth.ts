import api from './axios'

export interface LoginData { email: string; password: string }
export interface RegisterData { email: string; password: string; full_name: string }

export const authApi = {
  login: (data: LoginData) => api.post('/auth/login', data),
  register: (data: RegisterData) => api.post('/auth/register', data),
  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', {}, { headers: { Authorization: `Bearer ${refreshToken}` } }),
  me: () => api.get('/auth/me'),
}
