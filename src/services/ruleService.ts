import axios, { AxiosError } from "axios";

export type CarType = "SEAT_9" | "SEAT_16" | "LIMOUSINE_11";

export interface Rule {
  id: number;
  carType: CarType;
  minKm: number;
  maxKm: number | null;
  price: number;
}

export interface RuleListResponse {
  rules: Rule[];
  message: string;
  totalCount: number;
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    console.error("API error:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
    });

    return Promise.reject(error);
  },
);

export const ruleService = {
  async getRules(carType: CarType): Promise<RuleListResponse> {
    try {
      const response = await api.get<RuleListResponse>("/rules", {
        params: { carType },
      });

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;

      const message =
        axiosError.response?.data?.message ||
        `Không thể tải danh sách rule (${axiosError.response?.status || "unknown error"})`;

      throw new Error(message);
    }
  },
};
