import type { Branch } from "./branch.types";
import { fetchAllBranches } from "./branch.api";

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
