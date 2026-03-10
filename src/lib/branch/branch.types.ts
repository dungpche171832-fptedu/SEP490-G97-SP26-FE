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
