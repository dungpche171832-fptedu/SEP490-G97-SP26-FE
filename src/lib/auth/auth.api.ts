import axios from "axios";
import type {
  LoginPayload,
  RegisterPayload,
  LoginResponse,
  MessageResponse,
  ForgotPasswordPayload,
  ResetPasswordPayload,
} from "./auth.types";

// Thay thế any bằng unknown để tuân thủ quy tắc ESLint strict
export interface ApiResponse {
  message?: string;
  [key: string]: unknown;
}

const authClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

authClient.interceptors.response.use(
  (res) => res,
  (error) => {
    // Ép kiểu error về đúng định dạng của Axios để truy cập data mà không dùng any
    const serverMessage = error.response?.data?.message;
    const message = typeof serverMessage === "string" ? serverMessage : "Có lỗi xảy ra";
    return Promise.reject(new Error(message));
  },
);

function handleBusinessError(data: unknown, defaultMsg: string): ApiResponse {
  // Kiểm tra an toàn trước khi truy cập property
  const responseData = data as ApiResponse | null;
  const message = typeof data === "string" ? data : responseData?.message;

  const msgLower = (message || "").toLowerCase();

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

  // Đảm bảo kết quả trả về luôn khớp với kiểu ApiResponse
  if (typeof data === "string") {
    return { message: data };
  }

  return (data as ApiResponse) || { message: defaultMsg };
}

// ================= API CALLS =================

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await authClient.post<LoginResponse>("/api/auth/login", payload);

  if (!data?.accessToken || !data?.user) {
    // Xử lý lỗi từ data nếu có
    const errorMessage = (data as unknown as ApiResponse)?.message;
    throw new Error(
      typeof errorMessage === "string" ? errorMessage : "Sai tài khoản hoặc mật khẩu",
    );
  }

  return data;
}

export async function register(payload: RegisterPayload): Promise<MessageResponse> {
  const { data } = await authClient.post("/api/auth/register", payload);
  return handleBusinessError(data, "Đăng ký thất bại") as MessageResponse;
}

export async function forgotPassword(payload: ForgotPasswordPayload): Promise<MessageResponse> {
  const { data } = await authClient.post("/api/auth/forgot-password", payload);
  return handleBusinessError(data, "Email không tồn tại") as MessageResponse;
}

export async function resetPassword(payload: ResetPasswordPayload): Promise<MessageResponse> {
  const { data } = await authClient.post("/api/auth/reset-password", payload);
  return handleBusinessError(data, "Đổi mật khẩu thất bại") as MessageResponse;
}
