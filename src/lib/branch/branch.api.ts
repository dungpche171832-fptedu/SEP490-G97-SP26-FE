import axios from "axios";
import type {
  BranchListResponse,
  Branch,
  CreateBranchPayload,
  UpdateBranchPayload,
  BranchManagerAccount,
} from "./branch.types";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

const branchClient = axios.create({
  baseURL: apiBaseUrl ?? "",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token from localStorage to every request
branchClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export async function fetchAllBranches(code?: string, name?: string): Promise<BranchListResponse> {
  const params = new URLSearchParams();
  if (code) params.append("code", code);
  if (name) params.append("name", name);
  const query = params.toString() ? `?${params.toString()}` : "";
  const { data } = await branchClient.get<BranchListResponse>(`/branches${query}`);
  return data;
}

export async function createBranch(payload: CreateBranchPayload): Promise<Branch> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await branchClient.post<any>("/branches", payload);
  return data;
}

export async function updateBranch(
  id: number | string,
  payload: UpdateBranchPayload,
): Promise<Branch> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await branchClient.put<any>(`/branches/${id}`, payload);
  return data;
}

export async function fetchManagers(searchTerm?: string): Promise<BranchManagerAccount[]> {
  try {
    const searchParam = searchTerm ? `?email=${encodeURIComponent(searchTerm)}` : "";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await branchClient.get<any>(`/account${searchParam}`);
    const accounts = data.accounts || data.data || data || [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return accounts.map((acc: any) => ({
      ...acc,
      id: acc.id || acc.accountId,
    }));
  } catch (error) {
    console.error("Failed to fetch managers", error);
    return [];
  }
}
