"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Dropdown } from "antd";
import type { MenuProps } from "antd";
import { getToken, clearToken } from "src/lib/auth/auth.service";

type HeaderUserData = {
  fullName: string;
  role: string;
  roleId: string | null;
};

const ROLE_NAME_BY_ID: Record<string, string> = {
  "1": "ADMIN",
  "2": "MANAGER",
  "3": "STAFF",
};

function isBackOfficeRole(role: string | null, roleId: string | null): boolean {
  const normalizedRole = role?.toLowerCase() ?? "";

  return (
    normalizedRole.includes("admin") ||
    normalizedRole.includes("manager") ||
    normalizedRole.includes("staff") ||
    roleId === "1" ||
    roleId === "2" ||
    roleId === "3"
  );
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const [userData, setUserData] = useState<HeaderUserData | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    const initAuth = () => {
      const token = getToken();
      const fullName = localStorage.getItem("fullName");
      const role = localStorage.getItem("role");
      const roleId = localStorage.getItem("roleId");

      let currentUser: HeaderUserData | null = null;

      if (token && fullName) {
        currentUser = {
          fullName,
          role: role || ROLE_NAME_BY_ID[roleId ?? ""] || "Khách hàng",
          roleId,
        };
      }

      setTimeout(() => {
        setUserData(currentUser);
        setIsClient(true);
      }, 0);
    };

    initAuth();
  }, []);

  const isBackOfficeUser = userData ? isBackOfficeRole(userData.role, userData.roleId) : false;

  const shouldShowCustomerNav = isClient && !isBackOfficeUser;

  const handleLogout = () => {
    clearToken();

    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    localStorage.removeItem("roleId");
    localStorage.removeItem("fullName");

    setUserData(null);
    router.push("/login");
  };

  const handleBackToAdmin = () => {
    const roleId = localStorage.getItem("roleId");
    const role = localStorage.getItem("role")?.toLowerCase();

    if (roleId === "1" || role === "admin") {
      router.push("/admin/branch");
      return;
    }

    if (roleId === "2" || roleId === "3" || role === "manager" || role === "staff") {
      router.push("/admin/managePlan");
      return;
    }

    router.push("/login");
  };

  const ticketHistoryMenuItems: MenuProps["items"] = isBackOfficeUser
    ? []
    : [
        {
          key: "2",
          label: <Link href="/home/ticket/historyTicket">Lịch sử đặt vé</Link>,
        },
      ];

  const userMenuItems: MenuProps["items"] = [
    {
      key: "1",
      label: <Link href="/home/profile">Thông tin cá nhân</Link>,
    },
    ...ticketHistoryMenuItems,
    {
      type: "divider",
    },
    {
      key: "3",
      danger: true,
      label: (
        <button type="button" onClick={handleLogout} className="w-full text-left">
          Đăng xuất
        </button>
      ),
    },
  ];

  const navLinks = [
    { name: "Trang Chủ", href: "/home" },
    { name: "Lịch Trình", href: "/home/plan" },
    // { name: "Liên hệ", href: "/lien-he" },
    { name: "Tin tức", href: "/tin-tuc" },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <header className="w-full bg-gradient-to-r from-[#1e3a8a] via-[#1d4ed8] to-[#1e40af] text-white shadow-lg">
      <div className="relative w-full mx-auto h-20 px-10 flex items-center justify-between">
        {/* Logo Section */}
        <Link
          href={isBackOfficeUser ? "/home/profile" : "/home"}
          className="flex items-center gap-3 cursor-pointer"
        >
          <div className="p-2 bg-white/10 rounded-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-8 h-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.125-1.125V11.25a9 9 0 0 0-9-9h-2.25"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-white">Xe Limou Việt Trung</h1>
        </Link>

        {/* Navigation Links - chỉ hiện với Guest và Customer */}
        {shouldShowCustomerNav && (
          <nav className="hidden md:block">
            <ul className="flex items-center gap-12 text-lg font-medium">
              {navLinks.map((link) => (
                <li key={link.href} className="relative group cursor-pointer">
                  <Link
                    href={link.href}
                    className={`transition-colors duration-300 ${
                      isActive(link.href) ? "text-white" : "text-blue-200 hover:text-white"
                    }`}
                  >
                    {link.name}
                  </Link>

                  <div
                    className={`absolute -bottom-2 left-1/2 -translate-x-1/2 h-1 bg-white rounded-full transition-all duration-300 ${
                      isActive(link.href)
                        ? "w-6 opacity-100"
                        : "w-0 opacity-0 group-hover:w-4 group-hover:opacity-50"
                    }`}
                  />
                </li>
              ))}
            </ul>
          </nav>
        )}

        {/* Nút trở về quản trị - chỉ hiện với Admin / Manager / Staff */}
        {isClient && isBackOfficeUser && (
          <button
            type="button"
            onClick={handleBackToAdmin}
            className="absolute left-1/2 -translate-x-1/2 text-white text-base font-semibold hover:text-blue-100 transition-colors"
          >
            Trở về
          </button>
        )}

        {/* Right Section */}
        <div className="flex items-center gap-6">
          {isClient && userData ? (
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
              <div className="flex items-center gap-3 bg-white/10 border border-white/20 backdrop-blur-sm pl-2 pr-4 py-1.5 rounded-full cursor-pointer hover:bg-white/20 transition group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                    userData.fullName,
                  )}`}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full border-2 border-yellow-400 bg-slate-200"
                />

                <div className="flex flex-col text-white">
                  <span className="text-sm font-bold leading-none uppercase">
                    {userData.fullName}
                  </span>

                  <span className="text-[11px] text-yellow-400 flex items-center gap-1">
                    ★ <span className="text-white/80 text-[10px]">{userData.role}</span>
                  </span>
                </div>

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className="w-4 h-4 ml-1 text-white group-hover:translate-y-0.5 transition-transform"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m19.5 8.25-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </div>
            </Dropdown>
          ) : (
            <Link
              href="/login"
              className="px-6 py-2 bg-yellow-400 text-blue-900 font-bold rounded-full hover:bg-white transition duration-300"
            >
              ĐĂNG NHẬP
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
