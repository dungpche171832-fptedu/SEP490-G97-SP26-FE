"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth/auth.service";

type AuthGuardState = "checking" | "authorized" | "unauthorized";

export function useAuthGuard(): AuthGuardState {
  const router = useRouter();
  const [state, setState] = useState<AuthGuardState>("checking");

  useEffect(() => {
    const token = getToken();

    if (!token) {
      setTimeout(() => setState("unauthorized"), 0);
      router.replace("/login");
      return;
    }
    setTimeout(() => setState("authorized"), 0);
  }, [router]);
  return state;
}
