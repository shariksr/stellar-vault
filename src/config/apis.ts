const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const API = {
  baseURL: BASE_URL,

  auth: {
    signup: `${BASE_URL}/v1/auth/signup`,
    login: `${BASE_URL}/v1/auth/login`,
    me: `${BASE_URL}/v1/auth/me`,
    refresh: `${BASE_URL}/v1/auth/refresh`,
    verifyEmail: `${BASE_URL}/v1/auth/verify-email`,
    logout: `${BASE_URL}/v1/auth/logout`,
    forgotPassword: `${BASE_URL}/v1/auth/forgot-password`,
    resetPassword: `${BASE_URL}/v1/auth/reset-password`,
    changePassword: `${BASE_URL}/v1/auth/change-password`, // TODO: update route when backend is ready
  },

  files: {
    list: `${BASE_URL}/v1/files/list`,
    upload: `${BASE_URL}/v1/files/uploads`,
    download: (fileId: string) => `${BASE_URL}/v1/files/downloads/${fileId}`,
    delete: (fileId: string) => `${BASE_URL}/v1/files/delete/${fileId}`,
    rename: (fileId: string) => `${BASE_URL}/v1/files/rename/${fileId}`,
  },

  payments: {
    createSession: `${BASE_URL}/v1/payments/create-session`,
  },
} as const;
