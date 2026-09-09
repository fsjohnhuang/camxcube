import axios from "axios";
import fetchAdapter from "@haverstack/axios-fetch-adapter";
import localforage from "localforage";

export const $axios = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL,
  adapter: fetchAdapter,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor
$axios.interceptors.request.use(
  async (config) => {
    // Add auth token if available
    const token = await localforage.getItem<string>("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor
$axios.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localforage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);
