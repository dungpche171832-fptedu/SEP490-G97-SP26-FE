"use client";

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
      <div className="subpixel-antialiased" style={{ fontFamily: "var(--font-geist-sans), Arial, Helvetica, sans-serif" }}>
        {children}
      </div>
    </ConfigProvider>
  );
}
