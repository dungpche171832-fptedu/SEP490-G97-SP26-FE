import type { AuthResponse, LoginPayload, RegisterPayload } from "./auth.types";
import { login as loginRequest, register as registerRequest } from "./auth.api";

const TOKEN_KEY = "token";
const ROLE_KEY = "userRole";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setAuthData(data: AuthResponse): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, data.accessToken);
  window.localStorage.setItem(ROLE_KEY, data.user.role);
}

export function clearAuth(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(ROLE_KEY);
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const response = await loginRequest(payload);
  if (response?.accessToken) setAuthData(response);
  return response;
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const response = await registerRequest(payload);
  // Thường register xong sẽ login luôn nếu Backend trả về token
  if (response?.accessToken) setAuthData(response);
  return response;
}
