import type {
  LoginPayload,
  RegisterPayload,
  LoginResponse,
  MessageResponse,
  ForgotPasswordPayload,
  ResetPasswordPayload,
} from "./auth.types";
import {
  login as loginRequest,
  register as registerRequest,
  forgotPassword as forgotPasswordRequest,
  resetPassword as resetPasswordRequest,
} from "./auth.api";

const TOKEN_KEY = "token";
const REFRESH_TOKEN_KEY = "refreshToken";
const EMAIL_KEY = "email";
const FULLNAME_KEY = "fullName";
const ROLE_KEY = "role";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function getRole(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ROLE_KEY);
}

export function setAuthData(response: LoginResponse, email: string): void {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(TOKEN_KEY, response.accessToken);
  window.localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
  window.localStorage.setItem(EMAIL_KEY, email);
  window.localStorage.setItem(FULLNAME_KEY, response.user.fullName);
  window.localStorage.setItem(ROLE_KEY, response.user.role);
}

export function clearToken(): void {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  window.localStorage.removeItem(EMAIL_KEY);
  window.localStorage.removeItem(FULLNAME_KEY);
  window.localStorage.removeItem(ROLE_KEY);
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const response = await loginRequest(payload);
  setAuthData(response, payload.email);
  return response;
}

export async function register(payload: RegisterPayload): Promise<MessageResponse> {
  return await registerRequest(payload);
}

export async function forgotPassword(payload: ForgotPasswordPayload): Promise<MessageResponse> {
  return await forgotPasswordRequest(payload);
}

export async function resetPassword(payload: ResetPasswordPayload): Promise<MessageResponse> {
  return await resetPasswordRequest(payload);
}

export const loginAndStore = login;
export const registerAndStore = register;
