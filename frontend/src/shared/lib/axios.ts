// src/shared/lib/axios.ts
import axios from "axios";

type ClerkWindow = Window & {
  Clerk?: {
    session?: {
      getToken: () => Promise<string | null>;
    };
  };
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach Clerk JWT to every request automatically
api.interceptors.request.use(async (config) => {
  const token = await (window as ClerkWindow).Clerk?.session?.getToken();
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
