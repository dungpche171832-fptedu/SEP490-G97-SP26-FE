"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  EditOutlined,
  InfoCircleOutlined,
  EnvironmentOutlined,
  SettingOutlined,
  CheckCircleFilled,
  RightOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  UserOutlined,
} from "@ant-design/icons";

import Header from "@/components/admin/Header";
import Sidebar from "@/components/admin/Sidebar";
import { getBranchDetail, type BranchViewResponse } from "@/services/branch.service";

// ============================================================================
// 1. INFO FIELD COMPONENT
// ============================================================================
interface InfoFieldProps {
  label: string;
  value?: string | number | null;
  icon: React.ReactNode;
  isBold?: boolean;
}

const InfoField = ({ label, value, icon, isBold = false }: InfoFieldProps) => (
  <div className="flex flex-col gap-2">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] leading-none">
      {label}
    </label>
    <div className="flex items-center gap-2.5">
      {}
      <div className="text-[#1677FF] text-[16px] flex items-center justify-center leading-none">
        {icon}
      </div>
      {}
      <div
        className={`${isBold ? "font-black text-slate-800 text-[15px]" : "font-bold text-slate-700 text-[14px]"} leading-none mt-[2px] truncate`}
      >
        {value || "—"}
      </div>
    </div>
  </div>
);

// ============================================================================
// 2. COMPONENT CHÍNH
// ============================================================================
export default function BranchViewPage() {
  const params = useParams();
  const router = useRouter();
  const branchId = params?.id;

  const [branch, setBranch] = useState<BranchViewResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      if (branchId) {
        setLoading(true);
        const data = await getBranchDetail(branchId as string);
        setBranch(data);
        setLoading(false);
      }
    };
    fetchDetail();
  }, [branchId]);

  const mockUUID = useMemo(() => {
    if (!branch?.id) return "N/A";
    return `${branch.id.toString().padStart(8, "0")}-e29b-41d4-a716-446655440000`;
  }, [branch]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1677FF]"></div>
      </div>
    );
  }

  if (!branch) return null;

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans">
      <Sidebar />

      <main className="flex-1 flex flex-col ml-64 overflow-hidden pt-16">
        <Header />

        <div className="p-10 h-full overflow-y-auto">
          {}
          <div className="flex items-center gap-2 mb-8">
            <Link
              href="/admin/branch"
              className="text-slate-400 hover:text-[#1677FF] transition-colors text-sm font-bold"
            >
              Chi nhánh
            </Link>
            <RightOutlined className="text-slate-300 text-[10px]" />
            <span className="font-bold text-slate-800 text-sm">Chi tiết chi nhánh</span>
          </div>

          <div className="max-w-[1300px] mx-auto space-y-6">
            {/* CARD 1: THÔNG TIN CƠ BẢN */}
            <div className="bg-white rounded-[24px] border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
              <div className="px-8 py-5 border-b border-slate-50 flex justify-between items-center bg-white">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-50 p-2 rounded-xl border border-blue-100 flex items-center justify-center">
                    <InfoCircleOutlined className="text-[#1677FF] text-lg leading-none" />
                  </div>
                  <h3 className="font-black text-lg text-slate-800 tracking-tight mt-1">
                    Thông tin cơ bản
                  </h3>
                </div>
                <span className="flex items-center gap-1.5 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider bg-[#D1FAE5] text-[#059669]">
                  <CheckCircleFilled className="text-[10px] leading-none" />
                  Đang hoạt động
                </span>
              </div>

              <div className="p-10">
                <div className="grid grid-cols-3 gap-x-12 gap-y-10 items-start">
                  <InfoField
                    label="Mã chi nhánh"
                    value={branch.code}
                    isBold
                    icon={<SettingOutlined />}
                  />
                  <InfoField
                    label="Tên chi nhánh"
                    value={branch.name}
                    isBold
                    icon={<InfoCircleOutlined />}
                  />

                  {/* Khối quản lý căn chỉnh lại label cho bằng với các label khác */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] leading-none">
                      Quản lý chi nhánh
                    </label>
                    <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100 w-full max-w-[240px]">
                      <div className="w-10 h-10 rounded-full bg-[#1677FF] flex items-center justify-center text-white text-base font-black shadow-lg shadow-blue-100 shrink-0">
                        {branch.managerName?.charAt(0)}
                      </div>
                      <div className="truncate flex flex-col justify-center gap-1">
                        <p className="font-black text-slate-800 text-[14px] leading-none truncate">
                          {branch.managerName}
                        </p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase leading-none">
                          Quản lý cấp cao
                        </p>
                      </div>
                    </div>
                  </div>

                  <InfoField label="Số điện thoại" value={branch.phone} icon={<PhoneOutlined />} />
                  <InfoField label="Email chi nhánh" value={branch.email} icon={<MailOutlined />} />
                </div>
              </div>
            </div>

            {/* 2 COLUMNS: ĐỊA CHỈ & HỆ THỐNG */}
            <div className="grid grid-cols-12 gap-6 items-stretch">
              <div className="col-span-12 lg:col-span-7 bg-white rounded-[24px] border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
                <div className="px-8 py-5 border-b border-slate-50 flex items-center gap-3">
                  <div className="bg-blue-50 p-2 rounded-xl border border-blue-100 flex items-center justify-center">
                    <EnvironmentOutlined className="text-[#1677FF] text-lg leading-none" />
                  </div>
                  <h3 className="font-black text-lg text-slate-800 tracking-tight mt-1">Địa chỉ</h3>
                </div>
                <div className="p-10 grid grid-cols-2 gap-10">
                  <InfoField label="Tỉnh/Thành phố" value="Hà Nội" icon={<EnvironmentOutlined />} />
                  <InfoField label="Phường/Xã" value="Hoàng Mai" icon={<EnvironmentOutlined />} />
                  <div className="col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] block mb-3 leading-none">
                      Địa chỉ chi tiết
                    </label>
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                      <p className="text-slate-800 font-bold text-[15px] leading-relaxed">
                        {branch.address}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-span-12 lg:col-span-5 bg-white rounded-[24px] border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
                <div className="px-8 py-5 border-b border-slate-50 flex items-center gap-3">
                  <div className="bg-blue-50 p-2 rounded-xl border border-blue-100 flex items-center justify-center">
                    <SettingOutlined className="text-[#1677FF] text-lg leading-none" />
                  </div>
                  <h3 className="font-black text-lg text-slate-800 tracking-tight mt-1">
                    Hệ thống
                  </h3>
                </div>
                <div className="p-10 space-y-8">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] block mb-3 leading-none">
                      ID Chi nhánh (UUID)
                    </label>
                    <code className="text-[11px] font-mono font-bold text-slate-500 bg-slate-50 p-3.5 rounded-xl border border-slate-100 block break-all leading-none">
                      {mockUUID}
                    </code>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <InfoField label="Ngày tạo" value="15/05/2024" icon={<CalendarOutlined />} />
                    <InfoField
                      label="Cập nhật lúc"
                      value="20/05/2024"
                      icon={<CalendarOutlined />}
                    />
                    <InfoField label="Người tạo" value="Admin" icon={<UserOutlined />} />
                    <InfoField label="Người cập nhật" value="Admin" icon={<UserOutlined />} />
                  </div>
                  <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex gap-3 items-start">
                    <InfoCircleOutlined className="text-[#1677FF] text-sm mt-0.5 leading-none" />
                    <p className="text-[11px] text-blue-700 font-medium leading-relaxed">
                      Thông tin này được ghi lại tự động và không thể chỉnh sửa thủ công.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex justify-end gap-3 pt-4 pb-10">
              <button
                onClick={() => router.back()}
                className="px-8 py-3 rounded-xl border border-slate-200 text-slate-600 font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
              >
                Quay lại
              </button>
              <Link href={`/admin/branch/edit/${branch.id}`}>
                <button className="px-10 py-3 rounded-xl bg-[#1677FF] text-white font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center gap-2">
                  <EditOutlined className="text-sm leading-none" /> Chỉnh sửa
                </button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
