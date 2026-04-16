"use client";

import Footer from "@/components/footer";
import Header from "@/components/header";
import RoleGuard from "@/components/auth/RoleGuard";
import { ConfigProvider } from "antd";

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider
      theme={{
        token: {
          fontFamily: "var(--font-geist-sans), Arial, Helvetica, sans-serif",
        },
      }}
    >
      <Header />

      <RoleGuard allowedRoles={["customer", "admin"]}>
        <div
          className="subpixel-antialiased"
          style={{ fontFamily: "var(--font-geist-sans), Arial, Helvetica, sans-serif" }}
        >
          {children}
        </div>
      </RoleGuard>

      <Footer />
    </ConfigProvider>
  );
}
