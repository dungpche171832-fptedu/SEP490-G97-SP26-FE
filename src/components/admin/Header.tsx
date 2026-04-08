"use client";

import React from "react";
import Image from "next/image";

export default function Header() {
  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 fixed top-0 left-64 right-0 z-10">
      {/* Search Bar */}
      <div className="relative w-96">
        <input
          type="text"
          placeholder="Tìm kiếm..."
          className="w-full bg-slate-100 rounded-full py-2 pl-4 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
        />
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-6">
        {/* Notification Icon */}
        <button className="relative text-slate-400 hover:text-slate-600 transition-colors">
          <Image src="/icons/notifi.svg" alt="Notification" width={20} height={20} />
          <span className="absolute -top-1 -right-1 bg-red-500 w-2 h-2 rounded-full border-2 border-white"></span>
        </button>

        {/* User Info Container */}
        <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
          <div className="text-right">
            <p className="text-sm font-bold text-slate-800">Admin Việt Trung</p>
            <p className="text-[11px] text-slate-500 font-medium tracking-wider">QUẢN TRỊ VIÊN</p>
          </div>

          {/* Avatar - Dùng Image chuẩn Next.js để fix cảnh báo ESLint */}
          <div className="relative w-9 h-9">
            <Image
              src="https://ui-avatars.com/api/?name=Admin+Viet+Trung&background=random"
              alt="Avatar"
              fill
              className="rounded-full object-cover shadow-sm border border-slate-100"
              unoptimized // Cần thiết khi dùng link URL bên ngoài mà không cấu hình domain trong next.config.js
            />
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="text-slate-400 hover:text-red-500 transition-colors ml-2 flex items-center"
            title="Đăng xuất"
          >
            <Image src="/icons/muitenCheckout.svg" alt="Logout" width={20} height={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
