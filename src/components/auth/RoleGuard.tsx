"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { getRole, getToken } from "@/lib/auth/auth.service";

type RoleGuardProps = {
  children: ReactNode;
  allowedRoles: string[];
};

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const router = useRouter();

  const token = getToken();
  const role = getRole()?.replace("ROLE_", "").toLowerCase() || "";

  const normalizedAllowedRoles = allowedRoles.map((item) => item.toLowerCase());

  const isAuthorized = !!token && !!role && normalizedAllowedRoles.includes(role);

  useEffect(() => {
    if (isAuthorized) return;

    if (!token || !role) {
      router.replace("/login");
      return;
    }

    if (role === "customer") {
      router.replace("/home");
      return;
    }

    if (role === "staff") {
      router.replace("/admin/staff");
      return;
    }

    if (role === "manager") {
      router.replace("/admin/manager");
      return;
    }

    if (role === "admin") {
      router.replace("/admin/car");
      return;
    }

    router.replace("/login");
  }, [isAuthorized, token, role, router]);

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
