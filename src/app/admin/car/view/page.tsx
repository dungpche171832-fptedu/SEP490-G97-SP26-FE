"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation"; // ✅ Đổi sang useSearchParams
import Link from "next/link";
import {
  ArrowLeftOutlined,
  EditOutlined,
  CopyOutlined,
  CarOutlined,
  FileTextOutlined,
  HistoryOutlined,
  RightOutlined,
} from "@ant-design/icons";

import Header from "@/components/admin/Header";
import Sidebar from "@/components/admin/Sidebar";
import { getCarDetail, type CarViewResponse } from "@/services/car.service";

// ============================================================================
// 1. INFO FIELD HELPER COMPONENT (Tránh lỗi render lồng nhau)
// ============================================================================
interface InfoBlockProps {
  label: string;
  value: React.ReactNode;
  isLarge?: boolean;
}

const InfoBlock = ({ label, value, isLarge = false }: InfoBlockProps) => (
  <div className="flex flex-col gap-2">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.05em] leading-none">
      {label}
    </label>
    <div
      className={`${isLarge ? "text-[16px] font-black text-slate-800" : "text-[14px] font-bold text-slate-700"} leading-none mt-1`}
    >
      {value}
    </div>
  </div>
);

// ============================================================================
// 2. MAIN COMPONENT
// ============================================================================
export default function CarViewPage() {
  // ✅ Sử dụng searchParams để lấy ?id=
  const searchParams = useSearchParams();
  const router = useRouter();
  const carId = searchParams.get("id");

  const [car, setCar] = useState<CarViewResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      if (carId) {
        setLoading(true);
        const data = await getCarDetail(carId);
        setCar(data);
        setLoading(false);
      }
    };
    fetchDetail();
  }, [carId]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1677FF]"></div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="text-center">
          <p className="text-slate-500 mb-4">Không tìm thấy dữ liệu xe.</p>
          <button
            onClick={() => router.back()}
            className="text-[#1677FF] font-bold flex items-center gap-2 mx-auto"
          >
            <ArrowLeftOutlined /> Quay lại
          </button>
        </div>
      </div>
    );
  }

  // Format Car Type
  const formatCarType = (type: string) => {
    if (type.includes("LIMO")) return `${type} (Hạng Thương Gia)`;
    if (type.includes("SLEEPER")) return `${type} (Xe Giường Nằm)`;
    return `${type} (Ghế Ngồi)`;
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans">
      <Sidebar />

      <main className="flex-1 flex flex-col ml-64 overflow-hidden pt-16">
        <Header />

        <div className="p-10 h-full overflow-y-auto">
          {/* 1. BREADCRUMB */}
          <div className="flex items-center gap-2 mb-6">
            <Link
              href="/admin/car"
              className="text-slate-400 hover:text-[#1677FF] transition-colors text-[11px] font-black uppercase tracking-widest"
            >
              DANH SÁCH XE
            </Link>
            <RightOutlined className="text-slate-300 text-[10px]" />
            <span className="font-black text-[#1677FF] text-[11px] uppercase tracking-widest">
              CHI TIẾT XE
            </span>
          </div>

          {/* 2. HEADER ACTIONS */}
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">
              Chi tiết xe: {car.licensePlate}
            </h2>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="px-5 py-2.5 rounded-xl border border-slate-200 bg-slate-100/50 text-slate-600 font-bold hover:bg-slate-100 transition-all text-sm flex items-center gap-2"
              >
                <ArrowLeftOutlined /> Quay lại danh sách xe
              </button>
              {/* ✅ Update link Edit để xài query param (nếu edit cũng đổi đường dẫn) */}
              <Link href={`/admin/car/edit?id=${car.id}`}>
                <button className="px-6 py-2.5 rounded-xl bg-[#1677FF] text-white font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-100 flex items-center gap-2 text-sm">
                  <EditOutlined /> Chỉnh sửa thông tin xe
                </button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-8 max-w-[1400px]">
            {/* ================= LEFT COLUMN (8 Cols) ================= */}
            <div className="col-span-12 lg:col-span-8 space-y-6">
              {/* CARD 1: GENERAL INFO */}
              <div className="bg-white rounded-[24px] border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden relative">
                {/* Background Watermark Icon */}
                <div className="absolute top-8 right-10 text-slate-50 opacity-50 text-[100px] pointer-events-none">
                  <CarOutlined />
                </div>

                <div className="p-10 grid grid-cols-2 gap-y-12 relative z-10">
                  <InfoBlock label="BIỂN SỐ XE" value={car.licensePlate} isLarge />
                  <InfoBlock
                    label="TRẠNG THÁI"
                    value={
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FEF3C7] text-[#D97706] text-[11px] font-black uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]"></span>
                        {car.status}
                      </span>
                    }
                  />
                  <InfoBlock
                    label="CHI NHÁNH"
                    value={`${car.branchName} (${car.branchCode})`}
                    isLarge
                  />
                  <InfoBlock label="LOẠI XE" value={formatCarType(car.carType)} isLarge />
                  <InfoBlock
                    label="TỔNG SỐ GHẾ"
                    value={`${car.totalSeat} Seats + 1 Driver`}
                    isLarge
                  />
                  <InfoBlock label="NĂM SẢN XUẤT" value={car.manufactureYear || "N/A"} isLarge />
                </div>
              </div>

              {/* CARD 2: DESCRIPTION */}
              <div className="bg-white rounded-[24px] border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-10">
                <div className="flex items-center gap-3 mb-6">
                  <FileTextOutlined className="text-[#1677FF] text-xl leading-none" />
                  <h3 className="font-black text-[15px] text-slate-800 uppercase tracking-widest mt-1">
                    Mô tả xe
                  </h3>
                </div>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <p className="text-slate-600 font-medium leading-relaxed text-[14px]">
                    {car.description ||
                      "Xe Limousine thế hệ mới. Nội thất bọc da cao cấp, hệ thống ghế massage toàn thân tích hợp trên các ghế thương gia. Trang bị hệ thống giải trí màn hình Android, âm thanh Hi-End, cổng sạc USB tại mỗi vị trí ghế ngồi. Hệ thống giảm xóc hơi êm ái phù hợp cho các hành trình dài liên tỉnh."}
                  </p>
                </div>
              </div>

              {/* CARD 3: IMAGES */}
              <div className="grid grid-cols-2 gap-6">
                <div className="h-64 rounded-[24px] bg-slate-200 overflow-hidden relative shadow-sm">
                  {}
                  <img
                    src="/images/bus3.png"
                    alt="Interior"
                    className="object-cover w-full h-full hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="h-64 rounded-[24px] bg-slate-200 overflow-hidden relative shadow-sm">
                  {}
                  <img
                    src="/images/bus3.png"
                    alt="Exterior"
                    className="object-cover w-full h-full hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>

            {/* ================= RIGHT COLUMN (4 Cols) ================= */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              {/* TIMELINE CARD */}
              <div className="bg-white rounded-[24px] border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-8">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-2">
                    <HistoryOutlined className="text-[#1677FF] text-lg leading-none" />
                    <h3 className="font-black text-[15px] text-slate-800 mt-1">Nhật Ký Hệ Thống</h3>
                  </div>
                  <RightOutlined className="text-slate-400 text-xs" />
                </div>

                <div className="mb-8">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 leading-none">
                    UUID
                  </label>
                  <div className="flex justify-between items-center bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
                    <code className="text-xs font-mono text-slate-500 truncate mr-2">
                      8f3a2b11-9c1d-4e5a-8b9f-02d...
                    </code>
                    <CopyOutlined className="text-slate-400 hover:text-[#1677FF] cursor-pointer transition-colors" />
                  </div>
                </div>

                {/* Timeline UI */}
                <div className="relative pl-3 border-l-2 border-slate-100 space-y-8 ml-2">
                  <div className="relative">
                    <div className="absolute -left-[18px] top-1 w-3 h-3 rounded-full bg-[#1677FF] ring-4 ring-white"></div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">
                      Được tạo vào lúc
                    </p>
                    <p className="font-bold text-slate-800 text-[14px]">
                      Ngày 12 tháng 10 năm 2023 • 9:45
                    </p>
                    <p className="text-[12px] text-slate-500 font-medium mt-1">
                      bởi <span className="font-bold text-[#1677FF]">Admin Việt Trung</span>
                    </p>
                  </div>

                  <div className="relative">
                    <div className="absolute -left-[18px] top-1 w-3 h-3 rounded-full bg-[#D97706] ring-4 ring-white"></div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">
                      Cập nhật lần cuối
                    </p>
                    <p className="font-bold text-slate-800 text-[14px]">
                      Ngày 24 tháng 1 năm 2024 • 15:22
                    </p>
                    <p className="text-[12px] text-slate-500 font-medium mt-1">
                      bởi <span className="font-bold text-[#1677FF]">Admin Việt Trung</span>
                    </p>
                  </div>
                </div>

                <button className="w-full mt-10 py-3 text-center text-[11px] font-black text-[#1677FF] uppercase tracking-widest hover:bg-blue-50 rounded-xl transition-colors">
                  XEM NHẬT KÝ ĐẦY ĐỦ
                </button>
              </div>

              {/* DARK STATS CARD */}
              <div className="bg-[#0F172A] rounded-[24px] shadow-lg p-8 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500 rounded-full blur-3xl opacity-20 pointer-events-none"></div>

                <h3 className="font-black text-[12px] text-slate-400 uppercase tracking-widest mb-6">
                  Phân tích trực tiếp
                </h3>
                <div className="flex items-end gap-3 mb-2">
                  <span className="text-4xl font-black text-white leading-none">842</span>
                </div>
                <div className="flex justify-between items-center mb-6">
                  <p className="text-slate-400 text-xs font-medium">
                    Tổng số chuyến đi đã hoàn thành
                  </p>
                  <span className="text-emerald-400 text-xs font-bold bg-emerald-400/10 px-2 py-0.5 rounded">
                    +12%
                  </span>
                </div>

                <div className="w-full h-1.5 bg-slate-700/50 rounded-full mb-3 overflow-hidden">
                  <div className="h-full bg-[#1677FF] w-[85%] rounded-full relative">
                    <div className="absolute right-0 top-0 bottom-0 w-4 bg-white/30 blur-[2px]"></div>
                  </div>
                </div>
                <p className="text-slate-400 text-[11px] font-medium">
                  Duy trì sức khỏe: <span className="text-white font-bold">Tối ưu</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
