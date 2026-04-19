import axios from "axios";

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
  status?: string | null;
  createdAt?: string | null;
  isActive?: boolean | null;
  updatedAt?: string | null;
}

export interface EmployeeListResponse {
  accounts: EmployeeItem[];
  message: string;
  totalCount: number;
}

export async function getAllEmployees(): Promise<EmployeeListResponse> {
  const response = await employeeClient.get<EmployeeListResponse>("/account");
  return response.data;
}
