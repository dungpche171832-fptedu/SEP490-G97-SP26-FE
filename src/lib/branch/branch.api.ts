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

export async function fetchAllBranches(): Promise<BranchListResponse> {
  const { data } = await branchClient.get<BranchListResponse>("/branches");
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
    const searchParam = searchTerm
      ? `?role=manager&search=${encodeURIComponent(searchTerm)}`
      : "?role=manager";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await branchClient.get<any>(`/users${searchParam}`);
    return data.users || data.data || data || [];
  } catch (error) {
    console.error("Failed to fetch managers", error);
    return [];
  }
}
