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
  // Các trường mới cho Manager Account
  managerFullName: string;
  managerEmail: string;
  managerPhone: string;
  managerPassword?: string;
  roleId: number; // Thường là ID của role MANAGER
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

// Interfaces phụ trợ để fix lỗi "any" chuẩn TypeScript
interface AccountRaw {
  accountId?: number;
  account_id?: number;
  id?: number;
  fullName?: string;
  name?: string;
  email?: string;
}

interface ProvinceRaw {
  name: string;
  code: number;
}

interface DistrictRaw {
  name: string;
  code: number;
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
// 3. API CALLS & SERVICES
// ============================================================================

export async function getAllBranches(code?: string, name?: string): Promise<Branch[]> {
  try {
    const { data } = await branchClient.get<BranchListResponse>("/branches", {
      params: { code, name },
    });
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

    // Xử lý bóc tách data từ nhiều cấu trúc response khác nhau
    const data = responseData?.data || responseData?.result || responseData;
    return data as BranchViewResponse;
  } catch (error) {
    console.error("Lỗi lấy chi tiết chi nhánh:", error);
    return null;
  }
}
export async function updateBranch(
  id: number | string,
  request: AddBranchRequest,
): Promise<AddBranchResponse> {
  const response = await branchClient.put<AddBranchResponse>(`/branches/${id}`, request);
  return response.data;
}

export async function getBranchManagers(): Promise<BranchManagerAccount[]> {
  try {
    const response = await branchClient.get("/accounts/managers");
    const responseData = response.data;

    let accountList: AccountRaw[] = [];
    if (Array.isArray(responseData)) {
      accountList = responseData;
    } else if (responseData && Array.isArray(responseData.data)) {
      accountList = responseData.data;
    } else if (responseData && Array.isArray(responseData.result)) {
      accountList = responseData.result;
    } else if (responseData && Array.isArray(responseData.content)) {
      accountList = responseData.content;
    }

    return accountList.map((acc: AccountRaw) => ({
      id: Number(acc.accountId || acc.account_id || acc.id),
      fullName: acc.fullName || acc.name || acc.email || `Tài khoản ${acc.id}`,
      email: acc.email || "",
    }));
  } catch (error) {
    console.error("Lỗi lấy danh sách managers ở FE:", error);
    return [];
  }
}

export async function getProvinces(): Promise<LocationItem[]> {
  try {
    const response = await axios.get<ProvinceRaw[]>("https://provinces.open-api.vn/api/p/");
    return response.data.map((item: ProvinceRaw) => ({
      label: item.name,
      value: item.code,
    }));
  } catch {
    return [];
  }
}

export async function getWards(provinceCode: string | number): Promise<LocationItem[]> {
  try {
    if (!provinceCode) return [];
    const response = await axios.get<{ districts: DistrictRaw[] }>(
      `https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`,
    );
    const data = response.data;

    if (data && Array.isArray(data.districts)) {
      return data.districts.map((item: DistrictRaw) => ({
        label: item.name,
        value: item.code,
      }));
    }
    return [];
  } catch (error) {
    console.error("Lỗi lấy danh sách Quận/Huyện:", error);
    return [];
  }
}
