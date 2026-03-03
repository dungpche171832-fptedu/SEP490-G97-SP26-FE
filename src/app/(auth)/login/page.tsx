"use client";

import { useState } from "react";
import Image from "next/image";
import { loginApi } from "@/lib/apiLogin";
import { registerApi } from "@/lib/apiLogin";
import { useRouter } from "next/navigation";
export default function AuthPage() {
  const [tab, setTab] = useState<"login" | "register">("login");
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 text-black">
      <div className="w-[600px] bg-white rounded-xl shadow-md overflow-hidden">
        {/* Banner */}
        <div className="relative h-64 w-full">
          <Image src="/images/bus.png" alt="Bus" fill className="object-cover" />
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
    <div className="mb-5">
      <label className="block text-sm font-medium mb-2 text-gray-700">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm 
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
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
        className="w-full mt-2 bg-blue-600 hover:bg-blue-700 
        text-white font-semibold py-2.5 rounded-lg
        transition-all duration-200 active:scale-[0.98]
        disabled:opacity-60"
      >
        {loading ? "Đang đăng nhập..." : "Đăng nhập"}
      </button>

      <div className="text-center text-sm text-gray-500 mt-3 hover:text-blue-600 cursor-pointer">
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
        className="w-full mt-2 bg-blue-600 hover:bg-blue-700 
        text-white font-semibold py-2.5 rounded-lg
        transition-all duration-200 active:scale-[0.98]"
      >
        Đăng ký
      </button>
    </div>
  );
}
