import axios from "axios";

/* ================= AXIOS INSTANCE ================= */

const axiosInstance = axios.create({
  baseURL: "http://localhost:8080",
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
        // ✅ Cách đúng với Axios v1
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);

/* ================= RESPONSE INTERCEPTOR ================= */

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("Unauthorized - Token hết hạn");
    }

    if (error.response?.status === 403) {
      console.error("Forbidden - Không có quyền");
    }

    if (error.response?.status === 404) {
      console.error("API không tồn tại:", error.config?.url);
    }

    return Promise.reject(error);
  },
);

/* ================= TYPES ================= */

export interface Branch {
  id: number;
  code: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  isActive: boolean;
}

export interface Car {
  id: number;
  licensePlate: string;
  branch: Branch;
  carType: string;
  totalSeat: number;
  status: "RUNNING" | "STOP";
  manufactureYear: number;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CarResponse {
  cars: Car[];
  message: string;
  totalCount: number;
}
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

/* ================= API ================= */

// export const getCars = async (): Promise<CarResponse> => {
//   console.log("Calling API: http://localhost:8080/api/cars");

//   const response = await axiosInstance.get<CarResponse>("/api/cars");

//   return response.data;
// };
export const getCars = async (branchId?: number, licensePlate?: string): Promise<CarResponse> => {
  const response = await axiosInstance.get<CarResponse>("/api/cars", {
    params: {
      branchId,
      licensePlate,
    },
  });

  return response.data;
};

export const addCar = async (data: CarAddRequest): Promise<CarAddResponse> => {
  const response = await axiosInstance.post<CarAddResponse>("/api/cars", data);
  return response.data;
};

export const getBranchesForSelect = async (): Promise<Branch[]> => {
  try {
    const response = await axiosInstance.get("/api/branches");
    // Bóc vỏ JSON từ Backend
    return response.data.branches || response.data.data || response.data || [];
  } catch (error) {
    console.error("Lỗi lấy danh sách chi nhánh:", error);
    return [];
  }
};
export const getCarDetail = async (id: string | number): Promise<CarViewResponse | null> => {
  try {
    const response = await axiosInstance.get<CarViewResponse>(`/api/cars/cars/${id}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi lấy chi tiết xe:", error);
    return null;
  }
};
