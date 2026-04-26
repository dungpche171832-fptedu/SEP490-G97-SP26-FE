import axios from "axios";
import type { RouteResponse } from "@/model/route";

const API_BASE = "http://localhost:8080";

const routeClient = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

routeClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error: unknown) => Promise.reject(error),
);

routeClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        console.error("Unauthorized - Token hết hạn");
      }

      if (error.response?.status === 403) {
        console.error("Forbidden - Không có quyền");
      }

      if (error.response?.status === 404) {
        console.error("API route không tồn tại:", error.config?.url);
      }
    }

    return Promise.reject(error);
  },
);

export const getRoutes = async (): Promise<RouteResponse[]> => {
  const response = await routeClient.get<RouteResponse[]>("/api/routes");
  return response.data;
};

export const getRouteDetail = async (routeId: number): Promise<RouteResponse> => {
  const response = await routeClient.get<RouteResponse>(`/api/routes/${routeId}`);

  return response.data;
};
