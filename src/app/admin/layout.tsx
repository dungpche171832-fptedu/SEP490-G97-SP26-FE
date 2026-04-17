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
        <div className="flex min-h-screen">
          <Sidebar />

          <div className="flex-1 flex flex-col">
            <Header />

            <main
              className="subpixel-antialiased p-6"
              style={{ fontFamily: "var(--font-geist-sans), Arial, Helvetica, sans-serif" }}
            >
              {children}
            </main>
          </div>
        </div>
      </RoleGuard>
    </ConfigProvider>
  );
}
