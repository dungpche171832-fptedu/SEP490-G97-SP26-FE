export interface AccountRole {
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  roleId: number;
  name: string;
}

export interface Account {
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  accountId: number;
  password: string;
  fullName: string;
  email: string;
  phone: string;
  role: AccountRole;
  branchId: number;
  status: string;
}

export interface AccountResponse {
  accounts: Account[];
  message: string;
  totalCount: number;
}

/**
 * Response của API:
 * GET /api/account/info
 */
export interface AccountInfo {
  fullName: string;
  email: string;
  phone: string;
  roleId: number;
  branchId: number;
}

export interface UpdateProfilePayload {
  fullName: string;
  phone: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
