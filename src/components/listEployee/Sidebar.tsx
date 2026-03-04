"use client";

import Image from "next/image";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">

      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="bg-blue-600 p-2 rounded-lg">
          <Image src="/icons/xeicon.svg" alt="Logo" width={24} height={24} />
        </div>
        <div>
          <h1 className="font-bold text-slate-800 text-sm leading-tight">
            Xe Limou Việt Trung
          </h1>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">
            Management System
          </p>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-4 py-4 space-y-2">
        <NavItem icon="/icons/nhanvien.svg" label="Nhân viên" />
        <NavItem icon="/icons/location.svg" label="Chi nhánh" />
        <NavItem icon="/icons/xeicon.svg" label="Xe" active />
      </nav>
    </aside>
  );
}

function NavItem({
  icon,
  label,
  active = false,
}: {
  icon: string;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active
          ? "bg-blue-50 text-blue-600 font-bold"
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
        }`}
    >
      <Image src={icon} alt={label} width={20} height={20} />
      <span className="text-sm">{label}</span>
    </button>
  );
}