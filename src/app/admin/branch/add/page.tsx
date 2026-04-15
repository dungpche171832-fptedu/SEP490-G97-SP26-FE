"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  InfoCircleOutlined,
  EnvironmentOutlined,
  UserAddOutlined,
  RightOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { Switch, message } from "antd";

import Header from "@/components/admin/Header";
import Sidebar from "@/components/admin/Sidebar";
import { addBranch, type AddBranchRequest } from "@/services/branch.service";

// ✅ Định nghĩa kiểu dữ liệu cho Response lỗi từ Backend để tránh dùng 'any'
interface ApiErrorResponse {
  code?: string;
  message?: string;
  error?: string;
}

export default function AddBranchPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState<AddBranchRequest>({
    code: "",
    name: "",
    address: "",
    phone: "",
    email: "",
    isActive: true,
    managerFullName: "",
    managerEmail: "",
    managerPhone: "",
    managerPassword: "",
    roleId: 2,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    // 1. Validate FE cơ bản
    if (
      !formData.code ||
      !formData.name ||
      !formData.phone ||
      !formData.email ||
      !formData.address
    ) {
      message.error("Vui lòng điền đầy đủ thông tin chi nhánh (*)");
      return;
    }

    if (
      !formData.managerFullName ||
      !formData.managerPhone ||
      !formData.managerEmail ||
      !formData.managerPassword
    ) {
      message.error("Vui lòng điền đầy đủ thông tin tài khoản quản lý (*)");
      return;
    }

    try {
      setLoading(true);
      // ✅ Sửa 'any' thành 'unknown' kết hợp ép kiểu để pass ESLint
      const res = (await addBranch(formData)) as unknown as ApiErrorResponse;

      if (res && res.code && typeof res.code === "string" && res.code.startsWith("BR-")) {
        if (res.code === "BR-001") {
          message.error(res.message || "Mã chi nhánh hoặc Email đã tồn tại!");
        } else if (res.code === "BR-006") {
          message.error(res.message || "Số điện thoại chi nhánh đã tồn tại!");
        } else {
          message.error(res.message || "Có lỗi xảy ra từ hệ thống!");
        }
        return;
      }

      message.success("Thêm chi nhánh và tài khoản quản lý thành công!");
      router.push("/admin/branch");
    } catch (error: unknown) {
      // ✅ Sửa 'any' thành 'unknown'
      console.error("Lỗi API Add Branch:", error);

      // Ép kiểu error an toàn để lấy data
      const err = error as { response?: { data?: ApiErrorResponse } };
      const errorData = err.response?.data;
      const errorMsg = errorData?.message || errorData?.error || "";

      if (errorData?.code === "BR-001" || errorMsg.includes("tồn tại")) {
        message.error("Dữ liệu này đã tồn tại trong hệ thống!");
      } else {
        message.error("Có lỗi xảy ra khi tạo chi nhánh. Vui lòng thử lại sau!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900">
      <Sidebar />

      <main className="flex-1 flex flex-col ml-64 overflow-hidden pt-16">
        <Header />

        <div className="p-8 h-full overflow-y-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-3 mb-4 text-sm font-medium">
            <Link
              href="/admin/branch"
              className="text-slate-400 hover:text-blue-600 transition-colors"
            >
              Chi nhánh
            </Link>
            <RightOutlined className="text-slate-300 text-[10px]" />
            <span className="text-slate-800 font-bold">Thêm mới chi nhánh</span>
          </div>

          <div className="max-w-4xl">
            <h2 className="text-2xl font-black text-slate-800 mb-1">Thêm mới chi nhánh</h2>
            <p className="text-slate-500 text-sm mb-8">
              Vui lòng điền đầy đủ thông tin để tạo chi nhánh mới trong hệ thống.
            </p>

            <div className="space-y-6">
              {/* KHỐI 1: THÔNG TIN CHI NHÁNH */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-2 bg-slate-50/50">
                  <InfoCircleOutlined className="text-blue-500" />
                  <h3 className="font-bold text-slate-700 uppercase tracking-wider text-xs">
                    Thông tin chi nhánh
                  </h3>
                </div>
                <div className="p-8 grid grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-600 uppercase">
                      Mã chi nhánh <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="code"
                      value={formData.code}
                      onChange={handleChange}
                      placeholder="VD: CN-HN-01"
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all font-semibold"
                    />
                    <span className="text-[10px] text-slate-400 italic">
                      Mã chi nhánh là duy nhất trong hệ thống
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-600 uppercase">
                      Tên chi nhánh <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="VD: Chi nhánh Hà Nội 1"
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all font-semibold"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-600 uppercase">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="024 xxxx xxxx"
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all font-semibold"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-600 uppercase">
                      Email chi nhánh <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="chinhanh@velimou.vn"
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* KHỐI 2: ĐỊA CHỈ */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-2 bg-slate-50/50">
                  <EnvironmentOutlined className="text-blue-500" />
                  <h3 className="font-bold text-slate-700 uppercase tracking-wider text-xs">
                    Địa chỉ
                  </h3>
                </div>
                <div className="p-8">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-600 uppercase">
                      Địa chỉ cụ thể <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Số nhà, tên đường, phường/xã, tỉnh/thành phố"
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all resize-none font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* KHỐI 3: TÀI KHOẢN QUẢN LÝ */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-2 bg-slate-50/50">
                  <UserAddOutlined className="text-blue-500" />
                  <h3 className="font-bold text-slate-700 uppercase tracking-wider text-xs">
                    Cấp phát tài khoản quản lý
                  </h3>
                </div>
                <div className="p-8 space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-slate-600 uppercase">
                        Họ và tên <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="managerFullName"
                        value={formData.managerFullName}
                        onChange={handleChange}
                        placeholder="VD: Nguyễn Văn A"
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all font-semibold"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-slate-600 uppercase">
                        Số điện thoại <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="managerPhone"
                        value={formData.managerPhone}
                        onChange={handleChange}
                        placeholder="09xx xxx xxx"
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all font-semibold"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-slate-600 uppercase">
                        Email đăng nhập <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="managerEmail"
                        value={formData.managerEmail}
                        onChange={handleChange}
                        placeholder="manager@velimou.vn"
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all font-semibold"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-slate-600 uppercase">
                        Mật khẩu khởi tạo <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="managerPassword"
                          value={formData.managerPassword}
                          onChange={handleChange}
                          placeholder="VD: 123456aA@"
                          className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all font-semibold"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Switch trạng thái */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-700">Trạng thái hoạt động</p>
                      <p className="text-xs text-slate-400">
                        Cho phép chi nhánh vận hành ngay sau khi tạo
                      </p>
                    </div>
                    <Switch
                      checked={formData.isActive}
                      onChange={(checked) =>
                        setFormData((prev) => ({ ...prev, isActive: checked }))
                      }
                    />
                  </div>
                </div>
              </div>

              {/* NÚT HÀNH ĐỘNG */}
              <div className="flex justify-end items-center gap-4 pt-4 pb-12">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-8 py-2.5 rounded-lg font-bold text-slate-500 hover:bg-slate-100 transition-all text-sm"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-10 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 text-sm"
                >
                  {loading ? (
                    "Đang xử lý..."
                  ) : (
                    <>
                      <SaveOutlined /> Lưu chi nhánh
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
