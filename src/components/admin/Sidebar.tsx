"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { message } from "antd";
import {
  ApartmentOutlined,
  BarChartOutlined,
  CalendarOutlined,
  CarOutlined,
  DollarCircleOutlined,
  FlagOutlined,
  ReadFilled,
} from "@ant-design/icons";
import { getRole } from "@/lib/auth/auth.service";

const normalizeRole = (role?: string | null): string => {
  return role?.replace("ROLE_", "").toLowerCase() || "";
};

const NavItem = ({
  icon,
  label,
  href,
  active,
  adminOnly = false,
  currentRole,
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
  adminOnly?: boolean;
  currentRole: string;
}) => {
  const isBlocked = adminOnly && currentRole !== "admin";

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isBlocked) {
      return;
    }

    event.preventDefault();
    message.warning("Chỉ admin mới được truy cập");
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-colors ${
        active
          ? "bg-blue-50 font-bold text-blue-600"
          : "font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      <span className="flex h-6 w-6 items-center justify-center text-[20px]">{icon}</span>
      <span>{label}</span>
    </Link>
  );
};

export default function Sidebar() {
  const pathname = usePathname();
  const currentRole = normalizeRole(getRole());

  return (
    <aside className="fixed left-0 top-0 z-20 flex h-screen w-64 flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center gap-3 p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
          <CarOutlined className="text-[26px]" />
        </div>

        <div>
          <h1 className="text-sm font-bold leading-tight text-slate-800">Xe Limou Việt Trung</h1>
          <p className="text-[10px] uppercase tracking-wider text-slate-500">Management System</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2 px-4 py-4">
        <NavItem
          icon={<Image src="/icons/nhanvien.svg" alt="Nhanvien" width={20} height={20} />}
          label="Nhân viên"
          href="/admin/employees"
          active={pathname?.startsWith("/admin/employees")}
          currentRole={currentRole}
        />

        <NavItem
          icon={<Image src="/icons/location.svg" alt="Chinhanh" width={20} height={20} />}
          label="Chi nhánh"
          href="/admin/branch"
          active={pathname?.startsWith("/admin/branch")}
          currentRole={currentRole}
        />

        <NavItem
          icon={<CarOutlined />}
          label="Xe"
          href="/admin/car"
          active={pathname?.startsWith("/admin/car")}
          currentRole={currentRole}
        />

        <NavItem
          icon={<FlagOutlined />}
          label="Điểm dừng"
          href="/admin/station"
          active={pathname?.startsWith("/admin/station")}
          currentRole={currentRole}
        />

        <NavItem
          icon={<ApartmentOutlined />}
          label="Tuyến đường"
          href="/admin/manageRoute"
          active={pathname?.startsWith("/admin/manageRoute")}
          currentRole={currentRole}
        />

        <NavItem
          icon={<CalendarOutlined />}
          label="Quản lý lịch trình"
          href="/admin/managePlan"
          active={pathname?.startsWith("/admin/managePlan")}
          currentRole={currentRole}
        />

        <NavItem
          icon={<BarChartOutlined />}
          label="Thống kê"
          href="/admin/dashboard"
          active={pathname?.startsWith("/admin/dashboard")}
          adminOnly
          currentRole={currentRole}
        />

        <NavItem
          icon={<DollarCircleOutlined />}
          label="Giá tiền"
          href="/admin/rules"
          active={pathname?.startsWith("/admin/rules")}
          adminOnly
          currentRole={currentRole}
        />

        <NavItem
          icon={<ReadFilled />}
          label="Tin tức"
          href="/admin/news"
          active={pathname?.startsWith("/admin/news")}
          adminOnly
          currentRole={currentRole}
        />
      </nav>
    </aside>
  );
}
