import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api",
  withCredentials: false,
});

// Attach Clerk session token to every request
api.interceptors.request.use(async (config) => {
  if (typeof window !== "undefined") {
    try {
      // Clerk exposes getToken on the window via ClerkProvider
      const token = await (window as any).Clerk?.session?.getToken();
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch {
      // not signed in
    }
  }
  return config;
});
