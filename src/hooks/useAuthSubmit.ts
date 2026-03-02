"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import type { AuthMode } from "@/lib/auth/auth.types";
import type { AuthFormValues } from "@/components/auth/AuthForm";
import * as authService from "@/lib/auth/auth.service";

type AuthSubmitState = {
  loading: boolean;
  error: string | null;
  handleSubmit: (values: AuthFormValues) => Promise<void>;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const message =
      (error.response?.data as { message?: string } | undefined)?.message ?? error.message;
    return message || "Request failed";
  }
  if (error instanceof Error) return error.message;
  return "Request failed";
}

export function useAuthSubmit(mode: AuthMode): AuthSubmitState {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (values: AuthFormValues) => {
      setLoading(true);
      setError(null);
      try {
        if (mode === "login") {
          await authService.login({
            email: values.email,
            password: values.password,
          });
        } else {
          await authService.register({
            fullName: values.fullName ?? "",
            email: values.email,
            phone: values.phone ?? "",
            password: values.password,
          });
        }
        // Redirect to home after successful auth.
        router.push("/");
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    },
    [mode, router],
  );

  return { loading, error, handleSubmit };
}
