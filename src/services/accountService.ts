import axios from "axios";
import type {
  Account,
  AccountResponse,
  AccountInfo,
  UpdateProfilePayload,
  ChangePasswordPayload,
} from "@/model/account";

const API_BASE = "http://localhost:8080";

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;

    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");

    const json = atob(padded);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

function getEmail(): string | null {
  if (typeof window === "undefined") return null;

  const email = localStorage.getItem("email");
  if (email && email.includes("@")) return email;

  const token = localStorage.getItem("token");
  if (!token) return null;

  const payload = decodeJwtPayload(token);
  const fromJwt = payload?.email || payload?.sub || payload?.username;

  if (typeof fromJwt === "string" && fromJwt.includes("@")) {
    return fromJwt;
  }

  return null;
}

const axiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

export async function getAccountInfo(): Promise<AccountInfo> {
  const token = getToken();

  if (!token) {
    throw new Error("Missing token in localStorage (key: token)");
  }

  const email = getEmail();

  if (!email) {
    throw new Error(
      "Không tìm thấy email. Hãy lưu email khi login hoặc đảm bảo JWT có claim email/sub.",
    );
  }

  const res = await fetch(`${API_BASE}/api/account/info?email=${encodeURIComponent(email)}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Get account info failed: ${res.status}`);
  }

  return res.json() as Promise<AccountInfo>;
}

export async function updateProfile(data: UpdateProfilePayload) {
  const token = getToken();

  if (!token) {
    throw new Error("Missing token");
  }

  const res = await fetch(`${API_BASE}/api/account/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Update profile failed");
  }

  return res.json();
}

export async function changePassword(data: ChangePasswordPayload) {
  const token = getToken();

  if (!token) {
    throw new Error("Missing token");
  }

  const res = await fetch(`${API_BASE}/api/account/change-password`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const responseText = await res.text();

  let parsed: { code?: string; message?: string; result?: unknown } | null = null;

  try {
    parsed = responseText
      ? (JSON.parse(responseText) as {
          code?: string;
          message?: string;
          result?: unknown;
        })
      : null;
  } catch {
    parsed = null;
  }

  if (!res.ok) {
    throw new Error(parsed?.message || responseText || "Đổi mật khẩu thất bại");
  }

  if (parsed?.code && parsed?.message) {
    const successCode = String(parsed.code).startsWith("SUCCESS");
    const successMessage =
      typeof parsed.message === "string" && parsed.message.toLowerCase().includes("thành công");

    if (!successCode && !successMessage) {
      throw new Error(parsed.message);
    }
  }

  if (typeof responseText === "string" && responseText.toLowerCase().includes("thành công")) {
    return responseText;
  }

  if (parsed) {
    return parsed;
  }

  throw new Error("Đổi mật khẩu thất bại");
}

export const getAccounts = async (): Promise<AccountResponse> => {
  const response = await axiosInstance.get<AccountResponse>("/api/account");
  return response.data;
};

export const getDriversByCurrentManagerBranch = async (): Promise<Account[]> => {
  const currentAccount = await getAccountInfo();
  const managerBranchId = Number(currentAccount.branchId);

  if (Number.isNaN(managerBranchId)) {
    throw new Error("Tài khoản đang đăng nhập chưa có branchId hợp lệ");
  }

  const data = await getAccounts();
  const accounts = data.accounts || [];

  return accounts.filter((account) => {
    const roleName = account.role?.name?.toUpperCase() || "";
    const accountBranchId = Number(account.branchId);

    const sameBranch = accountBranchId === managerBranchId;

    const isDriver =
      roleName === "DRIVER" ||
      roleName === "ROLE_DRIVER" ||
      roleName === "TÀI XẾ" ||
      roleName === "TAI_XE" ||
      roleName === "STAFF" ||
      roleName === "ROLE_STAFF";

    const isActive = account.isActive === true && String(account.status).toUpperCase() === "ACTIVE";

    return sameBranch && isDriver && isActive;
  });
};
