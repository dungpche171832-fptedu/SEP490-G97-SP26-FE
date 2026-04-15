"use client";

import { useState } from "react";
import Image from "next/image";
import { useAuthSubmit, AuthFormValues } from "@/hooks/useAuthSubmit";

// Định nghĩa Interface cho Hook State để tránh dùng 'any'
interface AuthHookState {
  loading: boolean;
  error: string | null;
  handleSubmit: (values: AuthFormValues) => Promise<void>;
}

export default function AuthPage() {
  const [tab, setTab] = useState<"login" | "register">("login");

  const loginAuth = useAuthSubmit("login");
  const registerAuth = useAuthSubmit("register");

  return (
    <div className="min-h-[100vh] bg-[#F1F5F9] flex flex-col items-center justify-center p-4 text-black">
      <div className="w-[420px] bg-white rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] overflow-hidden border border-gray-100">
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

        <div className="p-8 pb-10">
          {tab === "login" ? (
            <LoginForm auth={loginAuth} />
          ) : (
            <RegisterForm auth={registerAuth} onRegisterSuccess={() => setTab("login")} />
          )}
        </div>
      </div>
    </div>
  );
}

// --- Định nghĩa props cho Input ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

function Input({ label, ...props }: InputProps) {
  return (
    <div className="mb-4">
      <label className="block text-[13px] font-bold mb-1.5 text-[#334155]">{label}</label>
      <input
        {...props}
        className="w-full rounded-lg border border-[#CBD5E1] px-3 py-2.5 text-[14px] placeholder:text-[#94A3B8] text-[#0F172A]
        focus:outline-none focus:ring-1 focus:ring-[#0F172A] focus:border-[#0F172A]
        transition-all duration-200"
      />
    </div>
  );
}

function LoginForm({ auth }: { auth: AuthHookState }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onLogin = () => {
    auth.handleSubmit({ email, password });
  };

  return (
    <div className="space-y-2">
      <Input
        label="Email"
        placeholder="Nhập email của bạn"
        type="email"
        value={email}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
      />

      <Input
        label="Mật khẩu"
        placeholder="Nhập mật khẩu"
        type="password"
        value={password}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
      />

      {auth.error && (
        <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-md border border-red-200">
          {auth.error}
        </div>
      )}

      <button
        onClick={onLogin}
        disabled={auth.loading}
        className="w-full mt-4 bg-[#0F172A] hover:bg-[#1E293B] 
        !text-white font-bold text-[14px] py-3 rounded-lg
        transition-all duration-200 active:scale-[0.98]
        disabled:opacity-60 shadow-sm"
      >
        {auth.loading ? "Đang đăng nhập..." : "Đăng nhập"}
      </button>

      <div className="text-center text-[12.5px] font-medium text-[#94A3B8] mt-5 hover:text-[#0F172A] cursor-pointer transition-colors">
        Quên mật khẩu?
      </div>
    </div>
  );
}

function RegisterForm({
  auth,
  onRegisterSuccess,
}: {
  auth: AuthHookState;
  onRegisterSuccess: () => void;
}) {
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "" });

  const onRegister = async () => {
    await auth.handleSubmit(form);
    if (!auth.error) {
      alert("Đăng ký thành công!");
      onRegisterSuccess();
    }
  };

  return (
    <div className="space-y-2">
      <Input
        label="Họ và tên"
        placeholder="Nhập họ và tên"
        value={form.fullName}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setForm({ ...form, fullName: e.target.value })
        }
      />
      <Input
        label="Email"
        placeholder="Nhập email"
        type="email"
        value={form.email}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setForm({ ...form, email: e.target.value })
        }
      />
      <Input
        label="Số điện thoại"
        placeholder="Nhập số điện thoại"
        value={form.phone}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setForm({ ...form, phone: e.target.value })
        }
      />
      <Input
        label="Mật khẩu"
        placeholder="Nhập mật khẩu"
        type="password"
        value={form.password}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setForm({ ...form, password: e.target.value })
        }
      />

      {auth.error && (
        <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-md border border-red-200">
          {auth.error}
        </div>
      )}

      <button
        onClick={onRegister}
        disabled={auth.loading}
        className="w-full mt-4 bg-[#0F172A] hover:bg-[#1E293B] 
        !text-white font-bold text-[14px] py-3 rounded-lg
        transition-all duration-200 active:scale-[0.98] shadow-sm
        disabled:opacity-60"
      >
        {auth.loading ? "Đang xử lý..." : "Đăng ký"}
      </button>
    </div>
  );
}
