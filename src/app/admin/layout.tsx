"use client";

import Header from "@/components/admin/Header";
import Sidebar from "@/components/admin/Sidebar";
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
      {/* 1. Phải có một thẻ bọc ngoài (ví dụ div) để chứa cả Sidebar, Header và Content */}
      <div className="flex min-h-screen">
        {/* Sidebar nằm bên trái */}
        <Sidebar />

        {/* Khối bên phải chứa Header và Nội dung chính */}
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
    </ConfigProvider>
  );
}
