"use client";

import Header from "@/components/admin/Header";
import Sidebar from "@/components/admin/Sidebar";
import RoleGuard from "@/components/auth/RoleGuard";
import { ConfigProvider } from "antd";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider
      theme={{
        token: {
          fontFamily: "var(--font-geist-sans), Arial, Helvetica, sans-serif",
        },
      }}
    >
      <RoleGuard allowedRoles={["admin", "staff", "manager"]}>
        <div className="min-h-screen bg-slate-50">
          <Sidebar />
          <Header />

          <main
            className="ml-64 min-h-screen pt-16 p-6 subpixel-antialiased"
            style={{ fontFamily: "var(--font-geist-sans), Arial, Helvetica, sans-serif" }}
          >
            {children}
          </main>
        </div>
      </RoleGuard>
    </ConfigProvider>
  );
}
