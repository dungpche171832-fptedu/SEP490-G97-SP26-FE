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

  const handleSendOtp = async () => {
    setError("");
    setSuccess("");
    if (!email.trim()) {
      setError("Vui lòng nhập email");
      return;
    }
    setLoading(true);
    try {
      const res = await forgotPassword({ email });
      setSuccess(res.message || "Đã gửi OTP tới email");
      setStep(2);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gửi OTP thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setError("");
    setSuccess("");

    if (!email.trim() || !otp.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Xác nhận mật khẩu không khớp");
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword({ email, otp, newPassword, confirmPassword });
      setSuccess(res.message || "Đổi mật khẩu thành công");
      setTimeout(() => router.push("/auth"), 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Đổi mật khẩu thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100vh] bg-[#F1F5F9] flex flex-col items-center justify-center p-4 text-black">
      <div className="w-[420px] bg-white rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] overflow-hidden border border-gray-100">
        {/* Banner Image - Giống Login */}
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

        {/* Header - Giống Login */}
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
              {step === 1 ? "Quên mật khẩu" : "Đặt lại mật khẩu"}
            </h1>
          </div>
          <p className="mt-1.5 text-center text-[13px] font-medium text-[#64748B]">
            {step === 1
              ? "Hệ thống sẽ gửi mã xác thực đến email của bạn"
              : "Vui lòng nhập mã OTP và thiết lập mật khẩu mới"}
          </p>
        </div>

        <div className="h-[1px] bg-gray-100 mx-8 mb-6" />

        {/* Form Content */}
        <div className="p-8 pt-0 pb-10">
          <div className="space-y-2">
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
                  label="Xác nhận mật khẩu"
                  placeholder="Nhập lại mật khẩu mới"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </>
            )}

            {/* Thông báo lỗi/thành công style chuẩn */}
            {error && (
              <div className="bg-red-50 text-red-600 text-[13px] px-3 py-2.5 rounded-lg border border-red-100 mt-2">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 text-green-600 text-[13px] px-3 py-2.5 rounded-lg border border-green-100 mt-2">
                {success}
              </div>
            )}

            <button
              onClick={step === 1 ? handleSendOtp : handleResetPassword}
              disabled={loading}
              className="w-full mt-4 bg-[#0F172A] hover:bg-[#1E293B] !text-white font-bold text-[14px] py-3 rounded-lg transition-all duration-200 active:scale-[0.98] disabled:opacity-60 shadow-sm"
            >
              {loading
                ? step === 1
                  ? "Đang gửi..."
                  : "Đang xử lý..."
                : step === 1
                  ? "Gửi mã OTP"
                  : "Xác nhận đổi mật khẩu"}
            </button>

            <Link
              href="/login"
              className="block w-full text-center text-[12.5px] font-medium text-[#94A3B8] mt-5 hover:text-[#0F172A] cursor-pointer transition-colors"
            >
              Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
