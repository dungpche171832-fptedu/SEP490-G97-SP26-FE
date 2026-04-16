"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FlagOutlined } from "@ant-design/icons";

const NavItem = ({
  icon,
  label,
  href,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
}) => {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
        active
          ? "bg-blue-50 text-blue-600 font-bold"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
};

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen fixed top-0 left-0 z-20">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-blue-600 p-2 rounded-lg">
          <Image src="/icons/xeicon.svg" alt="Bus Icon" width={24} height={24} />
        </div>
        <div>
          <h1 className="font-bold text-slate-800 text-sm leading-tight">Xe Limou Việt Trung</h1>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Management System</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        <NavItem
          icon={<Image src="/icons/nhanvien.svg" alt="Nhanvien" width={20} height={20} />}
          label="Nhân viên"
          href="/admin/employees"
          active={pathname?.startsWith("/admin/employees")}
        />
        <NavItem
          icon={<Image src="/icons/location.svg" alt="Chinhanh" width={20} height={20} />}
          label="Chi nhánh"
          href="/admin/branch"
          active={pathname?.startsWith("/admin/branch")}
        />
        <NavItem
          icon={<Image src="/icons/xeicon.svg" alt="Xe" width={20} height={20} />}
          label="Xe"
          href="/admin/car"
          active={pathname?.startsWith("/admin/car")}
        />

        <NavItem
          icon={<FlagOutlined style={{ fontSize: "20px" }} />}
          label="Điểm dừng"
          href="/admin/station"
          active={pathname?.startsWith("/admin/station")}
        />
      </nav>
    </aside>
  );
}
