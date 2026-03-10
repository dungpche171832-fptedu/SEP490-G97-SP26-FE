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
