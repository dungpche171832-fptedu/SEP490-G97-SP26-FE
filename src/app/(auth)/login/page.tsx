"use client";

import { useState } from "react";
import Image from "next/image";

export default function AuthPage() {
  const [tab, setTab] = useState<"login" | "register">("login");

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 text-black">
      <div className="w-[600px] bg-white rounded-xl shadow-md overflow-hidden">
        {/* Banner */}
        <div className="relative h-48 w-full">
          <Image src="/images/bus.jpg" alt="Bus" fill className="object-cover" />
        </div>

        {/* Title */}
        <div className="text-center py-4 px-6">
          <div className="flex items-center justify-center gap-2">
            <Image src="/icons/busicon.svg" alt="Bus Icon" width={24} height={24} />
            <h1 className="font-semibold text-lg ">Xe Limou Việt Trung</h1>
          </div>
          <p className="text-sm text-gray-500">Hệ thống quản lý dịch vụ vận chuyển</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b text-sm font-medium">
          <button
            onClick={() => setTab("login")}
            className={`flex-1 py-2 ${
              tab === "login" ? "border-b-2 border-black text-black" : "text-gray-400"
            }`}
          >
            Đăng nhập
          </button>
          <button
            onClick={() => setTab("register")}
            className={`flex-1 py-2 ${
              tab === "register" ? "border-b-2 border-black text-black" : "text-gray-400"
            }`}
          >
            Đăng ký
          </button>
        </div>

        {/* Form */}
        <div className="p-6">{tab === "login" ? <LoginForm /> : <RegisterForm />}</div>
      </div>
    </div>
  );
}

function Input({
  label,
  placeholder,
  type = "text",
}: {
  label: string;
  placeholder: string;
  type?: string;
}) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

function LoginForm() {
  return (
    <>
      <Input label="Email" placeholder="Nhập email của bạn" type="email" />
      <Input label="Mật khẩu" placeholder="Nhập mật khẩu" type="password" />

      <button className="w-full bg-slate-900 text-white py-2 rounded-md mt-2 hover:bg-slate-800 transition">
        Đăng nhập
      </button>

      <div className="text-center mt-3 text-xs text-gray-400">Quên mật khẩu?</div>
    </>
  );
}

function RegisterForm() {
  return (
    <>
      <Input label="Họ và tên" placeholder="Nhập họ và tên" />
      <Input label="Tên đăng nhập" placeholder="Nhập tên đăng nhập" />
      <Input label="Email" placeholder="Nhập email của bạn" type="email" />
      <Input label="Số điện thoại" placeholder="Nhập số điện thoại" />
      <Input label="Mật khẩu" placeholder="Nhập mật khẩu" type="password" />

      <button className="w-full bg-slate-900 text-white py-2 rounded-md mt-2 hover:bg-slate-800 transition">
        Đăng ký
      </button>
    </>
  );
}
