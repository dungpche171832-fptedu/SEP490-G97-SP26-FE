import axios from "axios";
import type {
  AccountStatus,
  CreateEmployeePayload,
  CreateEmployeeResponse,
  UpdateAccountStatusPayload,
  UpdateAccountStatusResponse,
} from "@/model/account";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

const employeeClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

employeeClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

export interface EmployeeRole {
  roleId: number;
  name: string;
  createdAt?: string | null;
  updatedAt?: string | null;
  isActive?: boolean | null;
}

export interface EmployeeItem {
  accountId: number;
  password?: string;
  fullName: string;
  email: string;
  phone: string;
  role: EmployeeRole | null;
  branchId: number | null;
  status?: AccountStatus | null;
  createdAt?: string | null;
  isActive?: boolean | null;
  updatedAt?: string | null;
}

export interface EmployeeListResponse {
  accounts: EmployeeItem[];
  message: string;
  totalCount: number;
}

interface ApiErrorResponse {
  message?: string;
  error?: string;
  details?: string | string[];
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const getEmployeeApiErrorMessage = (error: unknown, fallbackMessage: string): string => {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data;

    if (typeof responseData === "string" && responseData.trim()) {
      return responseData;
    }

    if (isRecord(responseData)) {
      const data = responseData as ApiErrorResponse;

      if (typeof data.message === "string" && data.message.trim()) {
        return data.message;
      }

      if (typeof data.error === "string" && data.error.trim()) {
        return data.error;
      }

      if (Array.isArray(data.details)) {
        return data.details.join(", ");
      }

      if (typeof data.details === "string" && data.details.trim()) {
        return data.details;
      }
    }

    if (error.response?.status === 401) {
      return "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại";
    }

    if (error.response?.status === 403) {
      return "Bạn không có quyền thực hiện chức năng này";
    }

    if (error.response?.status === 404) {
      return "API nhân viên không tồn tại";
    }

    return error.message || fallbackMessage;
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallbackMessage;
};

export async function getAllEmployees(): Promise<EmployeeListResponse> {
  try {
    const response = await employeeClient.get<EmployeeListResponse>("/account");

    return response.data;
  } catch (error) {
    throw new Error(getEmployeeApiErrorMessage(error, "Không thể tải danh sách nhân viên"));
  }
}

export async function updateEmployeeStatus(
  accountId: number,
  newStatus: AccountStatus,
): Promise<UpdateAccountStatusResponse> {
  try {
    const payload: UpdateAccountStatusPayload = {
      status: newStatus,
    };

    const response = await employeeClient.put<UpdateAccountStatusResponse>(
      `/account/${accountId}/status`,
      payload,
    );

    return response.data;
  } catch (error) {
    throw new Error(getEmployeeApiErrorMessage(error, "Không thể cập nhật trạng thái nhân viên"));
  }
}

export async function createEmployeeByAdmin(
  payload: CreateEmployeePayload,
): Promise<CreateEmployeeResponse> {
  try {
    const response = await employeeClient.post<CreateEmployeeResponse>(
      "/account/admin/create-account",
      payload,
    );

    return response.data;
  } catch (error) {
    throw new Error(getEmployeeApiErrorMessage(error, "Không thể tạo nhân viên mới"));
  }
}
