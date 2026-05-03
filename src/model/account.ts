export interface AccountRole {
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  roleId: number;
  name: string;
}

export type AccountStatus = "ACTIVE" | "INACTIVE";

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
  status: AccountStatus;
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

export interface UpdateAccountStatusPayload {
  status: AccountStatus;
}

export interface UpdateAccountStatusResponse {
  accountId: number;
  fullName: string;
  email: string;
  oldStatus: AccountStatus;
  newStatus: AccountStatus;
}

export type CreateEmployeeRoleName = "admin" | "manager" | "staff";

export interface CreateEmployeePayload {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  roleName: CreateEmployeeRoleName;
  branchId: number;
}

export interface CreateEmployeeResponse {
  accountId: number;
  fullName: string;
  email: string;
  phone: string;
  roleName: string;
  branchId: number;
  status: AccountStatus;
}
