import axios, { type AxiosError } from "axios";

import { clearAuth, getAuthToken } from "../utils/authToken";
import type { ICreateProfile } from "../types";

const redirectToLogin = () => {
  if (typeof window === "undefined") return;

  clearAuth();
  window.location.replace("/login");
};

const apiBaseUrl =
  import.meta.env.VITE_BASE_URL ??
  import.meta.env.VITE_API_URL ??
  "http://localhost:3001";

const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const PublicApi = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
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

export const createProfile = async (data: ICreateProfile) => {
  return await api.post("/api/v1/profiles/createProfile", data);
};

export const getLikedByMe = async () => {
  return await api.get("/api/v1/likes/liked-by-me");
};

export const likeProfile = async (profileId: string) => {
  return await api.put(`/api/v1/likes/profiles/${profileId}/like`);
}