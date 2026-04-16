"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
    setError("");
    setSuccess("");

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

      setSuccess(res.message || "Đổi mật khẩu thành công");

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
    <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center p-4">
      <div className="w-full max-w-[420px] bg-white rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-gray-100 p-8">
        <h1 className="text-[24px] font-bold text-center text-[#0F172A] mb-2">Quên mật khẩu</h1>

        <p className="text-center text-[14px] text-[#64748B] mb-6">
          {step === 1 ? "Nhập email để nhận mã OTP" : "Nhập OTP và mật khẩu mới"}
        </p>

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
          <div className="mb-4 bg-red-50 text-red-600 text-sm px-3 py-2 rounded-md border border-red-200">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-50 text-green-600 text-sm px-3 py-2 rounded-md border border-green-200">
            {success}
          </div>
        )}

        {step === 1 ? (
          <button
            onClick={handleSendOtp}
            disabled={loading}
            className="w-full mt-2 bg-[#0F172A] hover:bg-[#1E293B] !text-white font-bold text-[14px] py-3 rounded-lg transition-all duration-200 active:scale-[0.98] disabled:opacity-60 shadow-sm"
          >
            {loading ? "Đang gửi OTP..." : "Gửi OTP"}
          </button>
        ) : (
          <button
            onClick={handleResetPassword}
            disabled={loading}
            className="w-full mt-2 bg-[#0F172A] hover:bg-[#1E293B] !text-white font-bold text-[14px] py-3 rounded-lg transition-all duration-200 active:scale-[0.98] disabled:opacity-60 shadow-sm"
          >
            {loading ? "Đang đổi mật khẩu..." : "Đổi mật khẩu"}
          </button>
        )}

        <button
          onClick={() => router.push("/login")}
          className="w-full mt-6 text-[14px] text-[#64748B] hover:text-[#0F172A] font-medium transition-colors"
        >
          Quay lại đăng nhập
        </button>
      </div>
    </div>
  );
}
