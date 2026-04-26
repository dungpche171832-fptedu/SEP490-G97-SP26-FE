"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { getRole, getToken } from "@/lib/auth/auth.service";

type RoleGuardProps = {
  children: ReactNode;
  allowedRoles: string[];
  allowGuest?: boolean;
};

export default function RoleGuard({ children, allowedRoles, allowGuest = false }: RoleGuardProps) {
  const router = useRouter();

  const token = getToken();
  const role = getRole()?.replace("ROLE_", "").toLowerCase() || "";
  const normalizedAllowedRoles = allowedRoles.map((item) => item.toLowerCase());

  const isGuest = !token || !role;

  const isAuthorized =
    (allowGuest && isGuest) || (!!token && !!role && normalizedAllowedRoles.includes(role));

  useEffect(() => {
    if (isAuthorized) return;

    // if (isGuest) {
    //   router.replace("/login");
    //   return;
    // }

    if (role === "customer" || isGuest) {
      router.replace("/home");
      return;
    }

    if (role === "staff") {
      router.replace("/staff");
      return;
    }

    if (role === "manager") {
      router.replace("/manager");
      return;
    }

    if (role === "admin") {
      router.replace("/admin");
      return;
    }

    router.replace("/login");
  }, [isAuthorized, isGuest, role, router]);

  if (!isAuthorized) return null;

  return <>{children}</>;
}
