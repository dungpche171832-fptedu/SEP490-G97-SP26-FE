"use client";

import AuthPage from "./login/page";
import { ConfigProvider } from "antd";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider
      theme={{
        token: {
          fontFamily: "var(--font-geist-sans), Arial, Helvetica, sans-serif",
        },
      }}
    >
      <div
        className="subpixel-antialiased"
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(180deg, #f5f8ff 0%, #eef2f9 100%)",
          padding: "24px 16px",
          fontFamily: "var(--font-geist-sans), Arial, Helvetica, sans-serif",
        }}
      >
        <AuthPage></AuthPage>
        <div style={{ display: "none" }}>{children}</div>
      </div>
    </ConfigProvider>
  );
}

