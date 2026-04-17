"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { forgotPassword, resetPassword } from "@/lib/auth/auth.service";

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
        className="w-full rounded-lg border border-[#CBD5E1] px-3 py-2.5 text-[14px] placeholder:text-[#94A3B8] text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#0F172A] focus:border-[#0F172A] transition-all duration-200"
      />
    </div>
  );
}

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const resetMessage = () => {
    setError("");
    setSuccess("");
  };

  const handleSendOtp = async () => {
    resetMessage();

    if (!email.trim()) {
      setError("Vui lòng nhập email");
      return;
    }

    setLoading(true);

    try {
      const res = await forgotPassword({ email });

      setSuccess(res?.message || "Đã gửi OTP tới email");
      setStep(2);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Gửi OTP thất bại");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    resetMessage();

    if (!email.trim()) {
      setError("Vui lòng nhập email");
      return;
    }
    if (!otp.trim()) {
      setError("Vui lòng nhập OTP");
      return;
    }
    if (!newPassword.trim()) {
      setError("Vui lòng nhập mật khẩu mới");
      return;
    }
    if (!confirmPassword.trim()) {
      setError("Vui lòng xác nhận mật khẩu mới");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Xác nhận mật khẩu không khớp");
      return;
    }

    setLoading(true);

    try {
      const res = await resetPassword({
        email,
        otp,
        newPassword,
        confirmPassword,
      });

      setSuccess(res?.message || "Đổi mật khẩu thành công");

      setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Đổi mật khẩu thất bại");
      }
    } finally {
      setLoading(false);
    }
  };

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
            <Image src="/icons/busicon1.svg" alt="Bus Icon" width={22} height={22} />
            <h1 className="text-[20px] font-bold text-[#0F172A]">
              {step === 1 ? "Quên mật khẩu" : "Đặt lại mật khẩu"}
            </h1>
          </div>

          <p className="mt-1.5 text-center text-[13px] text-[#64748B]">
            {step === 1 ? "Nhập email để nhận mã OTP" : "Nhập OTP và mật khẩu mới"}
          </p>
        </div>

        <div className="border-b border-gray-200 mx-6 mb-6" />

        <div className="px-8 pb-10">
          <Input
            label="Email"
            placeholder="Nhập email của bạn"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {step === 2 && (
            <>
              <Input
                label="Mã OTP"
                placeholder="Nhập mã OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <Input
                label="Mật khẩu mới"
                placeholder="Nhập mật khẩu mới"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <Input
                label="Xác nhận mật khẩu mới"
                placeholder="Nhập lại mật khẩu mới"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-3 py-2.5 rounded-md border border-red-200 mt-2">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 text-green-600 text-sm px-3 py-2.5 rounded-md border border-green-200 mt-2">
              {success}
            </div>
          )}

          <button
            onClick={step === 1 ? handleSendOtp : handleResetPassword}
            disabled={loading}
            className="w-full mt-4 bg-[#0F172A] !text-white font-bold text-[14px] py-3 rounded-lg disabled:opacity-60"
          >
            {loading
              ? step === 1
                ? "Đang gửi OTP..."
                : "Đang đổi mật khẩu..."
              : step === 1
                ? "Gửi OTP"
                : "Đổi mật khẩu"}
          </button>

          <Link
            href="/login"
            className="block text-center text-[12.5px] text-[#94A3B8] mt-5 hover:text-[#0F172A]"
          >
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
