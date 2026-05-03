"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return "U";
  }

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
    localStorage.removeItem("role");
    localStorage.removeItem("fullName");

    window.location.href = "/login";
  };

  const dropdownItemClass =
    "flex h-12 w-full items-center px-5 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100";

  return (
    <header className="fixed left-64 right-0 top-0 z-10 flex h-16 items-center justify-end border-b border-slate-200 bg-white px-8">
      <div className="flex h-10 items-center gap-3">
        <p className="m-0 flex h-10 items-center text-sm font-bold leading-none text-slate-900">
          {fullName}
        </p>

        <div ref={dropdownRef} className="relative flex h-10 items-center">
          <button
            type="button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold leading-none !text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            {initials}
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 top-12 z-50 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white py-2 shadow-lg">
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
