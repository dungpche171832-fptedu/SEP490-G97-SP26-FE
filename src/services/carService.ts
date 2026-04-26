import axios from "axios";
import { getAccountInfo } from "@/services/accountService";
import type { Car, CarBranch, CarListResponse } from "@/model/car";

/* ================= AXIOS INSTANCE ================= */

const API_BASE = "http://localhost:8080";

const axiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ================= REQUEST INTERCEPTOR ================= */

axiosInstance.interceptors.request.use(
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

/* ================= RESPONSE INTERCEPTOR ================= */

axiosInstance.interceptors.response.use(
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
        console.error("API không tồn tại:", error.config?.url);
      }
    }

    return Promise.reject(error);
  },
);

/* ================= TYPES ================= */

export type Branch = CarBranch;
export type CarResponse = CarListResponse;

export type CarType =
  | "LIMOUSINE_9"
  | "LIMOUSINE_11"
  | "SLEEPER_22"
  | "SLEEPER_34"
  | "SEAT_16"
  | "SEAT_29";

export type CarStatus = "RUNNING" | "STOP" | "MAINTENANCE";

export interface CarAddRequest {
  licensePlate: string;
  branchId: number;
  carType: CarType | string;
  totalSeat: number;
  status: CarStatus | string;
  manufactureYear?: number;
  description?: string;
}

export interface CarAddResponse {
  id: number;
  licensePlate: string;
  branchId: number;
  carType: string;
  totalSeat: number;
  status: string;
  manufactureYear: number;
  description: string;
}

export interface CarViewResponse {
  id: number;
  licensePlate: string;
  branchName: string;
  branchCode: string;
  branchEmail: string;
  carType: string;
  totalSeat: number;
  status: string;
  manufactureYear: number;
  description: string;
  isActive: boolean;
}

interface BranchListResponse {
  branches?: CarBranch[];
  data?: CarBranch[];
  result?: CarBranch[];
}

/* ================= HELPERS ================= */

function extractBranches(responseBody: BranchListResponse | CarBranch[]): CarBranch[] {
  if (Array.isArray(responseBody)) {
    return responseBody;
  }

  return responseBody.branches || responseBody.data || responseBody.result || [];
}

/* ================= API ================= */

export const getCars = async (
  branchId?: number,
  licensePlate?: string,
): Promise<CarListResponse> => {
  const response = await axiosInstance.get<CarListResponse>("/api/cars", {
    params: {
      branchId,
      licensePlate,
    },
  });

  return response.data;
};

export const getCarsByCurrentManagerBranch = async (): Promise<Car[]> => {
  const currentAccount = await getAccountInfo();
  const managerBranchId = Number(currentAccount.branchId);

  if (Number.isNaN(managerBranchId)) {
    throw new Error("Tài khoản đang đăng nhập chưa có branchId hợp lệ");
  }

  const data = await getCars(managerBranchId);
  const cars = data.cars || [];

  return cars.filter((car) => {
    const carBranchId = Number(car.branch?.id);
    const status = String(car.status).toUpperCase();

    const sameBranch = carBranchId === managerBranchId;

    const isActive = car.isActive === true || car.isActive === null || car.isActive === undefined;

    const canCreatePlan =
      status === "RUNNING" || status === "STOP" || status === "ACTIVE" || status === "AVAILABLE";

    return sameBranch && isActive && canCreatePlan;
  });
};

export const addCar = async (data: CarAddRequest): Promise<CarAddResponse> => {
  const response = await axiosInstance.post<CarAddResponse>("/api/cars", data);
  return response.data;
};

export const getBranchesForSelect = async (): Promise<CarBranch[]> => {
  try {
    const response = await axiosInstance.get<BranchListResponse | CarBranch[]>("/api/branches");

    return extractBranches(response.data);
  } catch (error: unknown) {
    console.error("Lỗi lấy danh sách chi nhánh:", error);
    return [];
  }
};

export const getCarDetail = async (id: string | number): Promise<CarViewResponse | null> => {
  try {
    const response = await axiosInstance.get<CarViewResponse>(`/api/cars/cars/${id}`);

    return response.data;
  } catch (error: unknown) {
    console.error("Lỗi lấy chi tiết xe:", error);
    return null;
  }
};
