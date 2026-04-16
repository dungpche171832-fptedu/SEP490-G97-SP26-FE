import axios from "axios";
import type { LoginPayload, RegisterPayload, LoginResponse, MessageResponse } from "./auth.types";

const authClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await authClient.post("/api/auth/login", payload);

  if (!data?.accessToken || !data?.user) {
    throw new Error(data?.message || "Đăng nhập thất bại");
  }

  return data as LoginResponse;
}

export async function register(payload: RegisterPayload): Promise<MessageResponse> {
  const { data } = await authClient.post("/api/auth/register", payload);

  if (data?.code && !data?.message) {
    throw new Error("Đăng ký thất bại");
  }

  return data as MessageResponse;
}
