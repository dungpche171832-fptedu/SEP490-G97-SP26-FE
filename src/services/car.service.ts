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
    (error) => Promise.reject(error)
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
    }
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

/* ================= API ================= */

export const getCars = async (): Promise<CarResponse> => {
    console.log("Calling API: http://localhost:8080/api/cars");

    const response = await axiosInstance.get<CarResponse>("/api/cars");

    return response.data;
};