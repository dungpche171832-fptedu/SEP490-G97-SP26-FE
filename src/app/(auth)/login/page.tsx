"use client";

import { useState } from "react";
import Image from "next/image";
import { loginApi } from "@/lib/apiLogin";
import { registerApi } from "@/lib/apiLogin";
import { useRouter } from "next/navigation";
export default function AuthPage() {
  const [tab, setTab] = useState<"login" | "register">("login");
  return (
    <div className="min-h-[100vh] bg-[#F1F5F9] flex flex-col items-center justify-center p-4 text-black">
      <div className="w-[420px] bg-white rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] overflow-hidden border border-gray-100">
        {/* Banner */}
        <div className="px-5 pt-5">
          <div className="relative w-full h-[180px] rounded-2xl overflow-hidden bg-[#EAF2F8]">
            <Image
              src="/images/bus3.png"
              alt="Bus"
              fill
              priority
              className="object-cover object-center"
            />
          </div>
        </div>

        {/* Title */}
        <div className="pt-6 pb-4 px-6 flex flex-col items-center">
          <div className="flex items-center justify-center gap-2 h-10">
            <Image
              src="/icons/busicon1.svg"
              alt="Bus Icon"
              width={22}
              height={22}
              className="shrink-0"
            />

            <h1 className="text-[20px] font-bold leading-none text-[#0F172A] tracking-[-0.02em]">
              Xe Limou Việt Trung
            </h1>
          </div>

          <p className="mt-1.5 text-center text-[13px] font-medium text-[#64748B]">
            Hệ thống quản lý dịch vụ vận chuyển
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 text-[14px] font-bold px-4 mx-2">
          <button
            onClick={() => setTab("login")}
            className={`flex-1 py-3 transition-colors ${
              tab === "login"
                ? "border-b-[2px] border-[#0F172A] text-[#0F172A]"
                : "text-[#64748B] hover:text-[#334155]"
            }`}
          >
            Đăng nhập
          </button>
          <button
            onClick={() => setTab("register")}
            className={`flex-1 py-3 transition-colors ${
              tab === "register"
                ? "border-b-[2px] border-[#0F172A] text-[#0F172A]"
                : "text-[#64748B] hover:text-[#334155]"
            }`}
          >
            Đăng ký
          </button>
        </div>

        {/* Form */}
        <div className="p-8 pb-10">{tab === "login" ? <LoginForm /> : <RegisterForm />}</div>
      </div>
    </div>
  );
}

function Input({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="mb-4">
      <label className="block text-[13px] font-bold mb-1.5 text-[#334155]">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full rounded-lg border border-[#CBD5E1] px-3 py-2.5 text-[14px] placeholder:text-[#94A3B8] text-[#0F172A]
        focus:outline-none focus:ring-1 focus:ring-[#0F172A] focus:border-[#0F172A]
        transition-all duration-200"
      />
    </div>
  );
}

function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const data = await loginApi({ email, password });

      localStorage.setItem("token", data.accessToken);

      router.push("/home");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Đăng nhập thất bại");
      }

      setPassword("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Input
        label="Email"
        placeholder="Nhập email của bạn"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <Input
        label="Mật khẩu"
        placeholder="Nhập mật khẩu"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-md border border-red-200">
          {error}
        </div>
      )}

      <button
        onClick={handleLogin}
        disabled={loading}
        className="w-full mt-4 bg-[#0F172A] hover:bg-[#1E293B] 
        !text-white font-bold text-[14px] py-3 rounded-lg
        transition-all duration-200 active:scale-[0.98]
        disabled:opacity-60 shadow-sm"
      >
        {loading ? "Đang đăng nhập..." : "Đăng nhập"}
      </button>

      <div className="text-center text-[12.5px] font-medium text-[#94A3B8] mt-5 hover:text-[#0F172A] cursor-pointer transition-colors">
        Quên mật khẩu?
      </div>
    </div>
  );
}

function RegisterForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      await registerApi({ fullName, email, phone, password });
      alert("Đăng ký thành công");
    } catch {
      alert("Đăng ký thất bại");
    }
  };

  return (
    <div className="space-y-2">
      <Input
        label="Họ và tên"
        placeholder="Nhập họ và tên"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
      />

      <Input
        label="Email"
        placeholder="Nhập email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <Input
        label="Số điện thoại"
        placeholder="Nhập số điện thoại"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <Input
        label="Mật khẩu"
        placeholder="Nhập mật khẩu"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={handleRegister}
        className="w-full mt-4 bg-[#0F172A] hover:bg-[#1E293B] 
        !text-white font-bold text-[14px] py-3 rounded-lg
        transition-all duration-200 active:scale-[0.98] shadow-sm"
      >
        Đăng ký
      </button>
    </div>
  );
}
