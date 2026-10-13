// src/shared/lib/axios.ts
import axios from "axios";
import { getClerkToken } from "@/shared/lib/clerkAuth";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach Clerk JWT to every request automatically
api.interceptors.request.use(async (config) => {
  const token = await getClerkToken();
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

// Handle 401 globally — redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.assign("/login");
    }
    return Promise.reject(error);
  },
);

export default api;
