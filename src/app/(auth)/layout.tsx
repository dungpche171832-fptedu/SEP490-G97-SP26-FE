"use client";

import AuthPage from "./login/page";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(180deg, #f5f8ff 0%, #eef2f9 100%)",
        padding: "24px 16px",
      }}
    >
      {/* <AuthCard
        title="Du Lịch & Visa"
        subtitle="Hệ thống quản lý dịch vụ du lịch toàn diện"
        footerText={isLogin ? "New here?" : "Already have an account?"}
        footerHref={isLogin ? "/register" : "/login"}
        footerLinkText={isLogin ? "Create account" : "Sign in"}
      >
        <AuthTabs />
        {children}
      </AuthCard> */}
      <AuthPage></AuthPage>
      <div style={{ display: "none" }}>{children}</div>
    </div>
  );
}
