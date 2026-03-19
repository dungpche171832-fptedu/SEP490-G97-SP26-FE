import type { Branch } from "./branch.types";
import {
  fetchAllBranches,
  createBranch as apiCreateBranch,
  updateBranch as apiUpdateBranch,
  fetchManagers as apiFetchManagers,
} from "./branch.api";
import type {
  CreateBranchPayload,
  UpdateBranchPayload,
  BranchManagerAccount,
} from "./branch.types";

export async function getAllBranches(): Promise<Branch[]> {
  const response = await fetchAllBranches();
  return response.branches ?? [];
}

export async function getBranchCount(): Promise<number> {
  const response = await fetchAllBranches();
  return response.totalCount ?? 0;
}

export async function getBranchById(id: number | string): Promise<Branch> {
  const branches = await getAllBranches();
  const branch = branches.find((b) => String(b.id) === String(id));
  if (!branch) {
    throw new Error("Không tìm thấy chi nhánh");
  }
  return branch;
}

export async function createBranch(payload: CreateBranchPayload): Promise<Branch> {
  return await apiCreateBranch(payload);
}

export async function updateBranch(
  id: number | string,
  payload: UpdateBranchPayload,
): Promise<Branch> {
  return await apiUpdateBranch(id, payload);
}

export async function getManagers(searchTerm?: string): Promise<BranchManagerAccount[]> {
  return await apiFetchManagers(searchTerm);
}
