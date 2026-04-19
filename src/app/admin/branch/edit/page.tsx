"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  InfoCircleOutlined,
  EnvironmentOutlined,
  UserOutlined,
  RightOutlined,
  SaveOutlined,
  SettingOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { Switch, message, Spin } from "antd";

import Header from "@/components/admin/Header";
import Sidebar from "@/components/admin/Sidebar";
import { getBranchDetail, updateBranch, type AddBranchRequest } from "@/services/branch.service";

interface ApiErrorResponse {
  code?: string;
  message?: string;
  error?: string;
}

export default function EditBranchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const branchId = searchParams.get("id");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [qrPreviewError, setQrPreviewError] = useState(false);

  const [formData, setFormData] = useState<AddBranchRequest>({
    code: "",
    name: "",
    address: "",
    phone: "",
    email: "",
    imageUrl: "",
    isActive: true,
    managerFullName: "",
    managerEmail: "",
    managerPhone: "",
    managerPassword: "",
    roleId: 2,
  });

  const [systemInfo, setSystemInfo] = useState({
    id: "",
    createdAt: "15/05/2024 09:30",
    updatedAt: "20/05/2024 14:20",
    createdBy: "Admin Việt Trung",
    updatedBy: "Admin Việt Trung",
  });

  useEffect(() => {
    const fetchDetail = async () => {
      if (branchId) {
        try {
          const data = await getBranchDetail(branchId);
          if (data) {
            setFormData({
              code: data.code || "",
              name: data.name || "",
              address: data.address || "",
              phone: data.phone || "",
              email: data.email || "",
              imageUrl: data.imageUrl || "",
              isActive: data.isActive ?? true,
              managerFullName: data.managerName || "",
              managerEmail: "",
              managerPhone: "",
              managerPassword: "",
              roleId: 2,
            });

            setQrPreviewError(false);

            setSystemInfo((prev) => ({
              ...prev,
              id: data?.id
                ? String(data.id).padStart(8, "0") + "-e29b-41d4-a716-446655440000"
                : "N/A",
            }));
          }
        } catch (error) {
          console.error(error);
          message.error("Không thể tải thông tin chi nhánh");
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [branchId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleQrUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setQrPreviewError(false);
    setFormData((prev) => ({
      ...prev,
      imageUrl: value,
    }));
  };

  const handleQrFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      message.error("Vui lòng chọn file ảnh hợp lệ");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setQrPreviewError(false);
      setFormData((prev) => ({
        ...prev,
        imageUrl: typeof reader.result === "string" ? reader.result : "",
      }));
    };
    reader.readAsDataURL(file);
  };

  const removeQrImage = () => {
    setQrPreviewError(false);
    setFormData((prev) => ({
      ...prev,
      imageUrl: "",
    }));
  };

  const handleSubmit = async () => {
    if (!branchId) return;

    if (
      !formData.code?.trim() ||
      !formData.name?.trim() ||
      !formData.phone?.trim() ||
      !formData.email?.trim() ||
      !formData.address?.trim()
    ) {
      message.error("Vui lòng điền đầy đủ các thông tin bắt buộc (*)");
      return;
    }

    try {
      setSubmitting(true);
      await updateBranch(branchId, formData);

      message.success("Cập nhật chi nhánh thành công!");
      router.push("/admin/branch");
    } catch (error: unknown) {
      console.error(error);

      const err = error as { response?: { data?: ApiErrorResponse } };
      const errorData = err.response?.data;
      const errorMsg = errorData?.message || errorData?.error || "";

      message.error(errorMsg || "Lỗi khi cập nhật chi nhánh.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    );

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900">
      <Sidebar />
      <main className="flex-1 flex flex-col ml-64 overflow-hidden pt-16">
        <Header />
        <div className="p-8 h-full overflow-y-auto">
          <div className="flex items-center gap-3 mb-4 text-sm font-medium">
            <Link
              href="/admin/branch"
              className="text-slate-400 hover:text-blue-600 transition-colors text-[15px]"
            >
              Chi nhánh
            </Link>
            <RightOutlined className="text-slate-300 text-[10px]" />
            <span className="text-slate-800 font-bold text-[15px]">Chỉnh sửa chi nhánh</span>
          </div>

          <h2 className="text-2xl font-black text-slate-800 mb-8">Chỉnh sửa chi nhánh</h2>

          <div className="grid grid-cols-12 gap-8 max-w-7xl">
            <div className="col-span-12 lg:col-span-8 space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-2 bg-slate-50/50">
                  <InfoCircleOutlined className="text-blue-500" />
                  <h3 className="font-bold text-slate-700 uppercase tracking-wider text-xs text-[13px]">
                    Thông tin chi nhánh
                  </h3>
                </div>

                <div className="p-8 grid grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Mã chi nhánh <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="code"
                      value={formData.code}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 outline-none transition-all font-semibold text-[14px]"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Tên chi nhánh <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 outline-none transition-all font-semibold text-[14px]"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 outline-none transition-all font-semibold text-[14px]"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Email chi nhánh <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 outline-none transition-all font-semibold text-[14px]"
                    />
                  </div>

                  <div className="col-span-2 flex flex-col gap-3">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Mã QR
                    </label>

                    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5">
                      <div className="flex flex-col md:flex-row gap-6 items-start">
                        <div className="w-44 h-44 rounded-xl border border-slate-200 bg-white flex items-center justify-center overflow-hidden">
                          {formData.imageUrl && !qrPreviewError ? (
                            <img
                              src={formData.imageUrl}
                              alt="QR Preview"
                              className="w-full h-full object-contain p-2"
                              onError={() => setQrPreviewError(true)}
                            />
                          ) : (
                            <span className="text-sm text-slate-400 text-center px-3">
                              {formData.imageUrl && qrPreviewError
                                ? "Không thể tải ảnh QR"
                                : "Chưa có ảnh QR"}
                            </span>
                          )}
                        </div>

                        <div className="flex-1 space-y-4">
                          <input
                            id="qr-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleQrFileChange}
                            className="hidden"
                          />

                          <div className="flex flex-wrap gap-3">
                            <label
                              htmlFor="qr-upload"
                              className="cursor-pointer px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all"
                            >
                              Chọn ảnh QR
                            </label>

                            {formData.imageUrl ? (
                              <button
                                type="button"
                                onClick={removeQrImage}
                                className="px-4 py-2.5 rounded-lg border border-slate-300 text-slate-600 font-semibold text-sm hover:bg-slate-100 transition-all"
                              >
                                Xóa ảnh
                              </button>
                            ) : null}
                          </div>

                          <div className="space-y-3">
                            <input
                              type="text"
                              value={formData.imageUrl || ""}
                              onChange={handleQrUrlChange}
                              placeholder="Hoặc nhập đường dẫn ảnh QR, ví dụ: https://domain.com/qr.png"
                              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all font-semibold"
                            />

                            {formData.imageUrl ? (
                              <div className="flex flex-wrap gap-3">
                                <button
                                  type="button"
                                  onClick={removeQrImage}
                                  className="px-4 py-2.5 rounded-lg border border-slate-300 text-slate-600 font-semibold text-sm hover:bg-slate-100 transition-all"
                                >
                                  Xóa đường dẫn
                                </button>
                              </div>
                            ) : null}

                            <p className="text-xs text-slate-400 leading-relaxed">
                              Bạn có thể chọn ảnh từ máy hoặc nhập URL ảnh QR.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-2 bg-slate-50/50">
                  <EnvironmentOutlined className="text-blue-500" />
                  <h3 className="font-bold text-slate-700 uppercase tracking-wider text-xs text-[13px]">
                    Địa chỉ
                  </h3>
                </div>
                <div className="p-8">
                  <label className="text-[11px] font-bold text-slate-500 uppercase block mb-2 tracking-wider">
                    Địa chỉ cụ thể <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-blue-500 outline-none transition-all resize-none font-semibold text-[14px]"
                  />
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-2 bg-slate-50/50">
                  <CheckCircleOutlined className="text-blue-500" />
                  <h3 className="font-bold text-slate-700 uppercase tracking-wider text-xs text-[13px]">
                    Trạng thái chi nhánh
                  </h3>
                </div>
                <div className="p-8 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-700">Trạng thái hoạt động</p>
                    <p className="text-xs text-slate-400">Chi nhánh đang vận hành bình thường</p>
                  </div>
                  <Switch
                    checked={formData.isActive}
                    onChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pb-12">
                <button
                  onClick={() => router.back()}
                  className="px-8 py-2.5 rounded-lg font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all text-sm"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-10 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-2 shadow-lg shadow-blue-100 disabled:opacity-50 text-sm"
                >
                  {submitting ? (
                    "Đang lưu..."
                  ) : (
                    <>
                      <SaveOutlined /> Lưu thay đổi
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-4">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sticky top-24">
                <div className="flex items-center gap-2 mb-6">
                  <SettingOutlined className="text-blue-500" />
                  <h3 className="font-bold text-slate-700 uppercase tracking-wider text-xs">
                    Thông-tin hệ thống
                  </h3>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                      ID CHI NHÁNH (UUID)
                    </label>
                    <div className="bg-slate-50 p-3 rounded text-[12px] font-mono text-slate-500 border border-slate-100 break-all leading-relaxed">
                      {systemInfo.id}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                        Ngày tạo
                      </label>
                      <p className="text-sm font-bold text-slate-700">{systemInfo.createdAt}</p>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                        Ngày cập nhật
                      </label>
                      <p className="text-sm font-bold text-slate-700">{systemInfo.updatedAt}</p>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center text-[10px] font-bold">
                        <UserOutlined />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
                          Người tạo
                        </p>
                        <p className="text-sm font-bold text-slate-700">{systemInfo.createdBy}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center text-[10px] font-bold">
                        <UserOutlined />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
                          Người cập nhật
                        </p>
                        <p className="text-sm font-bold text-slate-700">{systemInfo.updatedBy}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
