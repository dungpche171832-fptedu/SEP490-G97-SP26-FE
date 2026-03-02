import type { AuthResponse, LoginPayload, RegisterPayload } from "./auth.types";
import { login as loginRequest, register as registerRequest } from "./auth.api";

const TOKEN_KEY = "auth_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const response = await loginRequest(payload);
  if (response?.token) setToken(response.token);
  return response;
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const response = await registerRequest(payload);
  if (response?.token) setToken(response.token);
  return response;
}

// Backwards-compatible exports
export const loginAndStore = login;
export const registerAndStore = register;
