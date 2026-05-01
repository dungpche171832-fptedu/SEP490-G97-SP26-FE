"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);

  if (words.length === 0) return "U";

  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }

  const firstLetter = words[0].charAt(0);
  const lastLetter = words[words.length - 1].charAt(0);

  return `${firstLetter}${lastLetter}`.toUpperCase();
}

export default function Header() {
  const [fullName, setFullName] = useState("Tài khoản");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const initials = useMemo(() => getInitials(fullName), [fullName]);

  useEffect(() => {
    const storedFullName = localStorage.getItem("fullName");
    const storedEmail = localStorage.getItem("email");
    const displayName = storedFullName || storedEmail || "Tài khoản";

    const timer = window.setTimeout(() => {
      setFullName(displayName);
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("roleId");
    localStorage.removeItem("fullName");

    window.location.href = "/login";
  };

  const dropdownItemClass =
    "flex h-12 w-full items-center px-5 text-left text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors";

  return (
    <header className="fixed top-0 left-64 right-0 z-10 h-16 bg-white border-b border-slate-200 flex items-center justify-end px-8">
      <div className="flex h-8 items-center gap-3">
        <div className="h-8 flex items-center">
          <p className="text-sm font-bold leading-none text-slate-900">{fullName}</p>
        </div>

        <div ref={dropdownRef} className="relative h-8 flex items-center">
          <button
            type="button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-semibold leading-none flex items-center justify-center shadow-sm hover:bg-blue-700 transition-colors"
          >
            {initials}
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 top-11 w-52 overflow-hidden bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-50">
              <Link
                href="/home/profile"
                onClick={() => setIsDropdownOpen(false)}
                className={dropdownItemClass}
              >
                Thông tin cá nhân
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className={`${dropdownItemClass} !text-slate-700`}
              >
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
