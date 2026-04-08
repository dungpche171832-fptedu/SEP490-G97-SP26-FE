import axios from "axios";

// ============================================================================
// 1. TYPES & INTERFACES (Định nghĩa kiểu dữ liệu)
// ============================================================================

export type BranchManagerAccount = {
  id: number;
  fullName: string;
  email: string;
};

export type Branch = {
  id: number;
  code: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  isActive: boolean;
  managerAccount: BranchManagerAccount | null;
};

export type BranchListResponse = {
  branches: Branch[];
  message: string;
  totalCount: number;
};

export type AddBranchRequest = {
  code: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  isActive: boolean;
  managerAccountId: number;
};

export type AddBranchResponse = {
  id: number;
  code: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  isActive: boolean;
  managerAccountId: number;
};

export type LocationItem = {
  label: string;
  value: number | string;
};

export interface BranchViewResponse {
  id: number;
  code: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  isActive: boolean;
  managerId: number;
  managerName: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

// ============================================================================
// 2. AXIOS CONFIG (Cấu hình gọi API)
// ============================================================================

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

const branchClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

// Gắn JWT token từ localStorage vào mỗi request
branchClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ============================================================================
// 3. API CAllS & SERVICES
// ============================================================================

export async function getAllBranches(): Promise<Branch[]> {
  try {
    const { data } = await branchClient.get<BranchListResponse>("/branches");
    return data.branches ?? [];
  } catch (error) {
    console.error("Lỗi lấy danh sách chi nhánh:", error);
    return [];
  }
}

export async function addBranch(request: AddBranchRequest): Promise<AddBranchResponse> {
  const response = await branchClient.post<AddBranchResponse>("/branches", request);
  return response.data;
}

export async function getBranchDetail(id: number | string): Promise<BranchViewResponse | null> {
  try {
    const response = await branchClient.get(`/branches/${id}`);
    const responseData = response.data;
    
    let data = responseData;
    if (responseData && responseData.data) {
        data = responseData.data;
    } else if (responseData && responseData.result) {
        data = responseData.result;
    }

    return data as BranchViewResponse;
  } catch (error) {
    console.error("Lỗi lấy chi tiết chi nhánh:", error);
    return null;
  }
}

export async function getBranchManagers(): Promise<BranchManagerAccount[]> {
  try {
    const response = await branchClient.get("/accounts/managers");
    const responseData = response.data;
    
    let accountList = [];
    if (Array.isArray(responseData)) {
        accountList = responseData; 
    } else if (responseData && Array.isArray(responseData.data)) {
        accountList = responseData.data; 
    } else if (responseData && Array.isArray(responseData.result)) {
        accountList = responseData.result; 
    } else if (responseData && Array.isArray(responseData.content)) {
        accountList = responseData.content; 
    }

    return accountList.map((acc: any) => ({
        id: Number(acc.accountId || acc.account_id || acc.id), // Ép kiểu số
        fullName: acc.email || acc.fullName || acc.name || `Tài khoản ${acc.account_id || acc.id}`, 
        email: acc.email || "",
    }));

  } catch (error) {
    console.error("Lỗi lấy danh sách managers ở FE:", error);
    return [];
  }
}

export async function getProvinces(): Promise<LocationItem[]> {
  try {
    const response = await axios.get("https://provinces.open-api.vn/api/p/");
    return response.data.map((item: any) => ({ label: item.name, value: item.code }));
  } catch {
    return [];
  }
}

export async function getWards(provinceCode: string | number): Promise<LocationItem[]> {
  try {
    if (!provinceCode) return [];
    const response = await axios.get(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
    const data = response.data;
    
    if (data && Array.isArray(data.districts)) {
      return data.districts.map((item: any) => ({ 
        label: item.name, 
        value: item.code 
      }));
    }
    return [];
  } catch (error) {
    console.error("Lỗi lấy danh sách Quận/Huyện:", error);
    return [];
  }
}