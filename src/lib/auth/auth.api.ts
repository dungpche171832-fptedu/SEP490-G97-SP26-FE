import axios from "axios";
import type { AuthResponse, LoginPayload, RegisterPayload } from "./auth.types";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

const authClient = axios.create({
  baseURL: apiBaseUrl ?? "",
  headers: {
    "Content-Type": "application/json",
  },
});

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await authClient.post<AuthResponse>("/auth/login", payload);
  return data;
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const { data } = await authClient.post<AuthResponse>("/auth/register", payload);
  return data;
}
