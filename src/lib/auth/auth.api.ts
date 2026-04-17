import axios from "axios";
import type {
  LoginPayload,
  RegisterPayload,
  LoginResponse,
  MessageResponse,
  ForgotPasswordPayload,
  ResetPasswordPayload,
} from "./auth.types";

const authClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

authClient.interceptors.response.use(
  (res) => res,
  (error) => {
    const message = error.response?.data?.message || "Có lỗi xảy ra";
    return Promise.reject(new Error(message));
  },
);

function handleBusinessError(data: unknown, defaultMsg: string): ApiResponse {
  const message = typeof data === "string" ? data : (data as ApiResponse)?.message;

  const msgLower = message?.toLowerCase?.() || "";

  if (
    !data ||
    msgLower.includes("không") ||
    msgLower.includes("sai") ||
    msgLower.includes("fail") ||
    msgLower.includes("invalid") ||
    msgLower.includes("error")
  ) {
    throw new Error(message || defaultMsg);
  }

  return typeof data === "string" ? { message } : (data as ApiResponse);
}

// ================= API =================

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await authClient.post<LoginResponse>("/api/auth/login", payload);
  return data;
}

export async function register(payload: RegisterPayload): Promise<MessageResponse> {
  const { data } = await authClient.post("/api/auth/register", payload);
  return handleBusinessError(data, "Đăng ký thất bại");
}

export async function forgotPassword(payload: ForgotPasswordPayload): Promise<MessageResponse> {
  const { data } = await authClient.post("/api/auth/forgot-password", payload);
  return handleBusinessError(data, "Email không tồn tại");
}

export async function resetPassword(payload: ResetPasswordPayload): Promise<MessageResponse> {
  const { data } = await authClient.post("/api/auth/reset-password", payload);
  return handleBusinessError(data, "Đổi mật khẩu thất bại");
}
