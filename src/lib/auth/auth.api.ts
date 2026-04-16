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

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await authClient.post("/api/auth/login", payload);

  if (!data?.accessToken || !data?.user) {
    throw new Error(data?.message || "Sai tài khoản hoặc mật khẩu");
  }

  return data as LoginResponse;
}

export async function register(payload: RegisterPayload): Promise<MessageResponse> {
  const { data } = await authClient.post<MessageResponse>("/api/auth/register", payload);
  return data;
}

export async function forgotPassword(payload: ForgotPasswordPayload): Promise<MessageResponse> {
  const { data } = await authClient.post("/api/auth/forgot-password", payload);

  if (typeof data === "string") {
    return { message: data };
  }

  return data as MessageResponse;
}

export async function resetPassword(payload: ResetPasswordPayload): Promise<MessageResponse> {
  const { data } = await authClient.post("/api/auth/reset-password", payload);

  if (typeof data === "string") {
    return { message: data };
  }

  return data as MessageResponse;
}
