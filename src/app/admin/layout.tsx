"use client";

import Header from "@/components/admin/Header";
import Sidebar from "@/components/admin/Sidebar";
import RoleGuard from "@/components/auth/RoleGuard";
import { ConfigProvider } from "antd";

const appFontFamily = "var(--font-app), Arial, Helvetica, sans-serif";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider
      theme={{
        token: {
          fontFamily: appFontFamily,
        },
      }}
    >
      <RoleGuard allowedRoles={["admin", "staff", "manager"]}>
        <div className="min-h-screen bg-slate-50">
          <Sidebar />
          <Header />

          <main className="admin-content ml-64 min-h-screen p-6 pt-16 subpixel-antialiased">
            {children}
          </main>
        </div>
      </RoleGuard>
    </ConfigProvider>
  );
}
