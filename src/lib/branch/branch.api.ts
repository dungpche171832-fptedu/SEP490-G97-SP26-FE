import axios from "axios";
import type { BranchListResponse } from "./branch.types";

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
