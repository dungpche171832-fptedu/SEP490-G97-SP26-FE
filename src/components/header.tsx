import React from "react";
import { BellIcon, ChevronDownIcon, UserCircleIcon } from "@heroicons/react/24/outline"; // Bạn có thể cài heroicons hoặc dùng SVG

export default function Header() {
  return (
    <header className="w-full bg-gradient-to-r from-[#1e3a8a] via-[#1d4ed8] to-[#1e40af] text-white shadow-lg">
      <div className="w-full mx-auto h-20 px-10 flex items-center justify-between">
        {/* Logo Section */}
        <div className="flex items-center gap-3 cursor-pointer">
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
          <h1 className="text-2xl font-bold tracking-tight">Xe Limou Việt Trung</h1>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:block">
          <ul className="flex items-center gap-12 text-lg font-medium">
            <li className="relative cursor-pointer hover:text-blue-200 transition">
              Trang Chủ
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-1 bg-white rounded-full"></div>
            </li>
            <li className="cursor-pointer hover:text-blue-200 transition">Lịch Trình</li>
            <li className="cursor-pointer hover:text-blue-200 transition">Liên hệ</li>
            <li className="cursor-pointer hover:text-blue-200 transition">Tin tức</li>
          </ul>
        </nav>

        {/* Right Section: Notification & User */}
        <div className="flex items-center gap-6">
          {/* Notification */}
          <div className="relative cursor-pointer p-2 hover:bg-white/10 rounded-full transition">
            <div className="absolute top-1 right-1 w-5 h-5 bg-red-500 border-2 border-blue-700 rounded-full flex items-center justify-center text-[10px] font-bold">
              3
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-7 h-7"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
              />
            </svg>
          </div>

          {/* User Profile Card */}
          <div className="flex items-center gap-3 bg-white/10 border border-white/20 backdrop-blur-sm pl-2 pr-4 py-1.5 rounded-full cursor-pointer hover:bg-white/20 transition">
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
              alt="Avatar"
              className="w-10 h-10 rounded-full border-2 border-yellow-400 bg-slate-200"
            />
            <div className="flex flex-col">
              <span className="text-sm font-bold leading-none">Nguyễn Văn A</span>
              <span className="text-[11px] text-yellow-400 flex items-center gap-1">
                ★ <span className="text-white/80">Khách hàng thân thiết</span>
              </span>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-4 h-4 ml-1"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
        </div>
      </div>
    </header>
  );
}
