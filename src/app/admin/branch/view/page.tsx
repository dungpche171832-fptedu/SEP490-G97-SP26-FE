"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  EditOutlined,
  InfoCircleOutlined,
  EnvironmentOutlined,
  SettingOutlined,
  RightOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";

import Header from "@/components/admin/Header";
import Sidebar from "@/components/admin/Sidebar";
import { getBranchDetail, type BranchViewResponse } from "@/services/branch.service";

// ============================================================================
// 1. INFO BLOCK COMPONENT (Chuẩn tối giản Figma mới)
// ============================================================================
interface InfoBlockProps {
  label: string;
  value?: string | number | null;
}

const InfoBlock = ({ label, value }: InfoBlockProps) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{label}</label>
    <div className="font-semibold text-slate-800 text-[14px]">{value || "—"}</div>
  </div>
);

// ============================================================================
// 2. COMPONENT CHÍNH
// ============================================================================
export default function BranchViewPage() {
  const searchParams = useSearchParams();
  const branchId = searchParams.get("id");

  const [branch, setBranch] = useState<BranchViewResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      if (branchId) {
        setLoading(true);
        try {
          const data = await getBranchDetail(branchId as string);
          setBranch(data);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      } else {
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

  // ✅ Sửa lỗi màn hình đen: Hiển thị giao diện báo lỗi thay vì return null
  if (!branch) {
    return (
      <div className="flex h-screen bg-[#F8FAFC] font-sans">
        <Sidebar />
        <main className="flex-1 flex flex-col ml-64 overflow-hidden pt-16">
          <Header />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center bg-white p-10 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-xl font-bold text-slate-800 mb-2">Không tìm thấy dữ liệu</h2>
              <p className="text-slate-500 mb-6">
                Chi nhánh này không tồn tại hoặc ID không hợp lệ.
              </p>
              <Link href="/admin/branch">
                <button className="px-6 py-2.5 bg-[#1677FF] text-white rounded-lg font-medium">
                  Quay lại danh sách
                </button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans">
      <Sidebar />

      <main className="flex-1 flex flex-col ml-64 overflow-hidden pt-16">
        <Header />

        <div className="p-8 h-full overflow-y-auto">
          {/* BREADCRUMB */}
          <div className="flex items-center gap-3 mb-6">
            <Link
              href="/admin/branch"
              className="text-slate-500 hover:text-[#1677FF] transition-colors text-[15px]"
            >
              Chi nhánh
            </Link>
            <RightOutlined className="text-slate-400 text-[12px]" />
            <span className="font-bold text-slate-800 text-[15px]">Chi tiết chi nhánh</span>
          </div>

          <div className="max-w-[1300px] mx-auto space-y-6">
            {/* CARD 1: THÔNG TIN CƠ BẢN */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <InfoCircleOutlined className="text-[#1677FF] text-[18px]" />
                  <h3 className="font-bold text-[16px] text-slate-800">Thông tin cơ bản</h3>
                </div>
                <span
                  className={`flex items-center gap-1.5 text-[12px] font-medium px-3 py-1 rounded-full ${branch.isActive ? "bg-[#Edfaf1] text-[#0ea254]" : "bg-red-50 text-red-600"}`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${branch.isActive ? "bg-[#0ea254]" : "bg-red-600"}`}
                  ></span>
                  {branch.isActive ? "Đang hoạt động" : "Tạm nghỉ"}
                </span>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-3 gap-y-8 gap-x-12">
                  <InfoBlock label="MÃ CHI NHÁNH" value={branch.code} />
                  <InfoBlock label="TÊN CHI NHÁNH" value={branch.name} />
                  <InfoBlock
                    label="QUẢN LÝ CHI NHÁNH"
                    value={branch.managerName || "Chưa phân công"}
                  />
                  <InfoBlock label="SỐ ĐIỆN THOẠI" value={branch.phone} />
                  <InfoBlock label="EMAIL CHI NHÁNH" value={branch.email} />
                </div>
              </div>
            </div>

            {/* 2 COLUMNS: ĐỊA CHỈ & HỆ THỐNG */}
            <div className="grid grid-cols-12 gap-6 items-stretch">
              {/* CARD ĐỊA CHỈ */}
              <div className="col-span-12 lg:col-span-6 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                  <EnvironmentOutlined className="text-[#1677FF] text-[18px]" />
                  <h3 className="font-bold text-[16px] text-slate-800 uppercase tracking-wide">
                    ĐỊA CHỈ CHI TIẾT
                  </h3>
                </div>
                <div className="p-6">
                  <p className="text-slate-800 font-medium text-[14px] leading-relaxed">
                    {branch.address || "Chưa cập nhật địa chỉ"}
                  </p>
                </div>
              </div>

              {/* CARD THÔNG TIN HỆ THỐNG */}
              <div className="col-span-12 lg:col-span-6 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                  <SettingOutlined className="text-[#1677FF] text-[18px]" />
                  <h3 className="font-bold text-[16px] text-slate-800">Thông tin hệ thống</h3>
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                      ID CHI NHÁNH (UUID)
                    </label>
                    <div className="bg-slate-50 px-3 py-2 rounded border border-slate-100">
                      <code className="text-[13px] text-slate-600 font-mono">{mockUUID}</code>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <InfoBlock label="NGÀY TẠO" value="15/05/2024 09:30" />
                    <InfoBlock label="NGÀY CẬP NHẬT" value="20/05/2024 14:20" />

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        NGƯỜI TẠO
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[9px] font-bold">
                          A
                        </div>
                        <span className="font-semibold text-slate-800 text-[14px]">
                          Admin Việt Trung
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        NGƯỜI CẬP NHẬT
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[9px] font-bold">
                          A
                        </div>
                        <span className="font-semibold text-slate-800 text-[14px]">
                          Admin Việt Trung
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-[#f0f7ff] rounded-lg border border-[#e1effe] flex gap-3 items-start">
                    <QuestionCircleOutlined className="text-[#1677FF] mt-0.5" />
                    <p className="text-[12px] text-slate-600 leading-relaxed">
                      Dữ liệu này được ghi lại tự động bởi hệ thống cho mục đích đối soát và lịch sử
                      thay đổi. Không thể sửa đổi trực tiếp các thông tin này.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex justify-end pt-2 pb-10">
              <Link href={`/admin/branch/edit?id=${branch.id}`}>
                <button className="px-6 py-2.5 rounded-lg bg-[#1677FF] text-white font-medium hover:bg-blue-700 transition-all flex items-center gap-2 text-[14px]">
                  Chỉnh sửa <EditOutlined className="text-[13px]" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
