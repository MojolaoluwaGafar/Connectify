import axios, { type AxiosError } from "axios";

import { clearAuth, getAuthToken } from "../utils/authToken";

const redirectToLogin = () => {
  if (typeof window === "undefined") return;

  clearAuth();
  window.location.replace("/login");
};

const apiBaseUrl =
  import.meta.env.VITE_BASE_URL;

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

const PublicApi = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401 || status === 403) {
      redirectToLogin();
    }
    return Promise.reject(error);
  },
);

export default api;
export { PublicApi };

export function isAxiosError(error: unknown): error is AxiosError {
  return (error as AxiosError).isAxiosError === true;
}
export const getUser = async () => {
  return await api.get("/api/v1/auth/me");
};
