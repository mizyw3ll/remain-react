import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api/v1";

export const ACCESS_TOKEN_KEY = "remain.accessToken";
export const THEME_KEY = "remain.theme";

export const http = axios.create({
  baseURL: API_BASE,
  withCredentials: false,
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
