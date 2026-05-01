"use client";

import Footer from "@/components/footer";
import Header from "@/components/header";
import RoleGuard from "@/components/auth/RoleGuard";
import { ConfigProvider } from "antd";
import { usePathname } from "next/navigation";

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isProfilePage = pathname === "/home/profile" || pathname.startsWith("/home/profile/");

  const allowedRoles = isProfilePage ? ["customer", "admin", "manager", "staff"] : ["customer"];

  return (
    <ConfigProvider
      theme={{
        token: {
          fontFamily: "var(--font-geist-sans), Arial, Helvetica, sans-serif",
        },
      }}
    >
      <RoleGuard allowedRoles={allowedRoles} allowGuest={!isProfilePage}>
        <Header />

        <div
          className="subpixel-antialiased"
          style={{
            fontFamily: "var(--font-geist-sans), Arial, Helvetica, sans-serif",
          }}
        >
          {children}
        </div>

        <Footer />
      </RoleGuard>
    </ConfigProvider>
  );
}
