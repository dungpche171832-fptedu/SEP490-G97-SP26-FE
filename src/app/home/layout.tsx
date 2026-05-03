"use client";

import Footer from "@/components/footer";
import Header from "@/components/header";
import RoleGuard from "@/components/auth/RoleGuard";
import { ConfigProvider } from "antd";
import { usePathname } from "next/navigation";

const appFontFamily = "var(--font-app), Arial, Helvetica, sans-serif";

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isProfilePage = pathname === "/home/profile" || pathname.startsWith("/home/profile/");

  const allowedRoles = isProfilePage ? ["customer", "admin", "manager", "staff"] : ["customer"];

  return (
    <ConfigProvider
      theme={{
        token: {
          fontFamily: appFontFamily,
        },
      }}
    >
      <RoleGuard allowedRoles={allowedRoles} allowGuest={!isProfilePage}>
        <Header />

        <div className="subpixel-antialiased">{children}</div>

        <Footer />
      </RoleGuard>
    </ConfigProvider>
  );
}
