import axios, {AxiosError, InternalAxiosRequestConfig} from "axios";
import {tokenStorage} from "../utils/tokenStorage";
import {AuthResponse} from "../types";

const BASE_URL= import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1";

export const axiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 15000, // 15 seconds
});


axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = tokenStorage.getAccessToken();
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error)=> Promise.reject(error)
);

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else if (token) {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Interceptor de Response: Maneja 401 con Refresh Token automático
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string; error?: string }>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (!error.response) {
      return Promise.reject(new Error('Sin conexión con el servidor. Verifica tu red.'));
    }

    const status = error.response.status;
    const isAuthEndpoint =
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/register') ||
      originalRequest?.url?.includes('/auth/refresh');

    if (status === 401 && originalRequest && !originalRequest._retry && !isAuthEndpoint) {
      const refreshToken = tokenStorage.getRefreshToken();

      if (!refreshToken) {
        tokenStorage.clearSession();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (newToken: string) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
              }
              resolve(axiosInstance(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post<AuthResponse>(`${BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        tokenStorage.setSession(data);
        processQueue(null, data.token);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${data.token}`;
        }
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        tokenStorage.clearSession();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export const extractErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const backendMsg =
      error.response?.data?.message ||
      error.response?.data?.error ||
      (typeof error.response?.data === 'string' ? error.response.data : null);

    if (backendMsg) return backendMsg;

    switch (status) {
      case 400:
        return 'Datos inválidos. Revisa los campos del formulario.';
      case 401:
        return 'Credenciales incorrectas o sesión expirada.';
      case 403:
        return 'No tienes permisos para realizar esta acción (debes ser miembro del grupo).';
      case 404:
        return 'El recurso solicitado no existe.';
      case 409:
        return 'Este registro ya existe o ya eres miembro del grupo.';
      case 500:
      case 503:
        return 'Error en el servidor o servicio externo temporalmente no disponible.';
      default:
        return 'Ocurrió un error inesperado al comunicarse con el servidor.';
    }
  }
  if (error instanceof Error) return error.message;
  return 'Error desconocido.';
};
