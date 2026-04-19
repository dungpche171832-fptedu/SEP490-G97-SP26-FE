const API_BASE = "http://localhost:8080";

// function decodeJwtPayload(token: string): any | null {
//     try {
//         const parts = token.split(".");
//         if (parts.length < 2) return null;
//         const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
//         const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, "=");
//         const json = atob(padded);
//         return JSON.parse(json);
//     } catch {
//         return null;
//     }
// }
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

function getEmail(): string | null {
  // 1) thử localStorage key "email"
  const email = localStorage.getItem("email");
  if (email && email.includes("@")) return email;

  // 2) decode từ JWT
  const token = localStorage.getItem("token");
  if (!token) return null;

  const payload = decodeJwtPayload(token);
  const fromJwt = payload?.email || payload?.sub || payload?.username;
  if (typeof fromJwt === "string" && fromJwt.includes("@")) return fromJwt;

  return null;
}

export async function getAccountInfo() {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Missing token in localStorage (key: token)");

  const email = getEmail();
  if (!email) {
    throw new Error(
      "Không tìm thấy email. Hãy lưu email khi login (localStorage.setItem('email', ...)) hoặc đảm bảo JWT có claim email/sub.",
    );
  }

  const res = await fetch(`${API_BASE}/api/account/info?email=${encodeURIComponent(email)}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`Get account info failed: ${res.status}`);
  return res.json();
}
export async function updateProfile(data: { fullName: string; phone: string }) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Missing token");

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
export async function changePassword(data: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Missing token");

  const res = await fetch(`${API_BASE}/api/account/change-password`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const responseText = await res.text();
  console.log("change-password status:", res.status);
  console.log("change-password responseText:", responseText);

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

  // 1) HTTP lỗi thật
  if (!res.ok) {
    throw new Error(parsed?.message || responseText || "Đổi mật khẩu thất bại");
  }

  // 2) HTTP 200 nhưng body thực ra là lỗi nghiệp vụ
  if (parsed?.code && parsed?.message) {
    const successCode = String(parsed.code).startsWith("SUCCESS");
    const successMessage =
      typeof parsed.message === "string" && parsed.message.toLowerCase().includes("thành công");

    if (!successCode && !successMessage) {
      throw new Error(parsed.message);
    }
  }

  // 3) Thành công thật
  if (typeof responseText === "string" && responseText.toLowerCase().includes("thành công")) {
    return responseText;
  }

  // 4) Có JSON nhưng không phải lỗi
  if (parsed) {
    return parsed;
  }

  throw new Error("Đổi mật khẩu thất bại");
}
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export const getAccounts = async () => {
  const response = await axiosInstance.get("/api/account");
  return response.data;
};
