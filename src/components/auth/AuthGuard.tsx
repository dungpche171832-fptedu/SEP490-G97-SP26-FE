"use client";

import { Spin } from "antd";
import type { ReactNode } from "react";
import { useAuthGuard } from "@/hooks/useAuthGuard";

type AuthGuardProps = {
  children: ReactNode;
};

export default function AuthGuard({ children }: AuthGuardProps) {
  const state = useAuthGuard();

  if (state !== "authorized") {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8fafc",
        }}
      >
        <Spin size="large" tip="Checking session...">
          <div style={{ minHeight: "100vh" }} />
        </Spin>
      </div>
    );
  }

  return <>{children}</>;
}
