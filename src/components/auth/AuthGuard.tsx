"use client";

import type { ReactNode } from "react";

type AuthGuardProps = {
  children: ReactNode;
};

export default function AuthGuard({ children }: AuthGuardProps) {
  return <>{children}</>;
}
