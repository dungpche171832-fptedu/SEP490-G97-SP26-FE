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
  // Detail fields (optional as they might only be returned in detail API)
  province?: string;
  ward?: string;
  detailedAddress?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: BranchManagerAccount | null;
  updatedBy?: BranchManagerAccount | null;
};

export type BranchListResponse = {
  branches: Branch[];
  message: string;
  totalCount: number;
};
