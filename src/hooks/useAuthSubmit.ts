"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import type { AuthMode } from "@/lib/auth/auth.types";
import * as authService from "@/lib/auth/auth.service";

// Interface này khớp với các field trong Form của bạn
export interface AuthFormValues {
  email: string;
  password: string;
  fullName?: string;
  phone?: string;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    return error.response?.data?.message || "Thông tin đăng nhập không chính xác";
  }
  return "Đã có lỗi xảy ra, vui lòng thử lại";
}

export function useAuthSubmit(mode: AuthMode) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (values: AuthFormValues) => {
      setLoading(true);
      setError(null);
      try {
        let response;
        if (mode === "login") {
          response = await authService.login({
            email: values.email,
            password: values.password,
          });
        } else {
          response = await authService.register({
            fullName: values.fullName || "",
            email: values.email,
            phone: values.phone || "",
            password: values.password,
          });
        }

        // ĐIỀU HƯỚNG DỰA TRÊN ROLE
        if (response.user.role === "Admin") {
          router.push("/admin/car");
        } else {
          router.push("/home");
        }
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
