"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  EnvironmentOutlined,
  SettingOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CompassOutlined,
  PlusOutlined,
} from "@ant-design/icons";

import Sidebar from "@/components/admin/Sidebar";
import Header from "@/components/admin/Header";

// ✅ Import service gọi API thật
import { getStationDetail, StationDetail } from "@/services/station.service";

export default function ViewStationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stationId = searchParams?.get("id");

  const [station, setStation] = useState<StationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!stationId) {
      setError("Không tìm thấy mã điểm dừng!");
      setLoading(false);
      return;
    }

    const fetchDetail = async () => {
      try {
        setLoading(true);
        const data = await getStationDetail(Number(stationId));
        setStation(data);
      } catch (err) {
        console.error(err);
        setError("Không thể tải dữ liệu chi tiết từ hệ thống.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [stationId]);

  if (loading) {
    return (
      <div className="flex h-screen bg-[#F8FAFC]">
        <Sidebar />
        <main className="flex-1 flex flex-col ml-64 overflow-hidden pt-16">
          <Header />
          <div className="flex items-center justify-center h-full">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !station) {
    return (
      <div className="flex h-screen bg-[#F8FAFC]">
        <Sidebar />
        <main className="flex-1 flex flex-col ml-64 overflow-hidden pt-16">
          <Header />
          <div className="p-8">
            <div className="bg-red-50 text-red-500 border border-red-200 p-10 text-center font-bold rounded-xl">
              {error || "Điểm dừng không tồn tại."}
              <br />
              <button
                onClick={() => router.push("/admin/station")}
                className="mt-4 text-blue-600 underline"
              >
                Quay lại danh sách
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900">
      <Sidebar />

      <main className="flex-1 flex flex-col ml-64 overflow-hidden pt-16">
        <Header />

        <div className="p-8 h-full overflow-y-auto">
          {/* HEADER SECTION */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <button
                onClick={() => router.push("/admin/station")}
                className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-semibold mb-2 transition-colors text-sm"
              >
                <ArrowLeftOutlined /> QUAY LẠI DANH SÁCH
              </button>
              <h2 className="text-2xl font-black text-[#1E293B] tracking-tight">
                Chi tiết Điểm dừng: {station.name}
              </h2>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex items-center gap-3">
              <Link href={`/admin/station/edit?id=${station.id}`}>
                <button className="bg-[#1677FF] hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all shadow-sm text-sm">
                  <EditOutlined /> Chỉnh sửa
                </button>
              </Link>
              <button className="bg-white border border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all shadow-sm text-sm">
                <DeleteOutlined /> Xóa
              </button>
            </div>
          </div>

          {/* MAIN GRID 8:4 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* LEFT COLUMN (8 cols) - Operation Details */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              {/* Card 1: Thông tin cơ bản */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <EnvironmentOutlined className="text-blue-500 text-xl" />
                  <h3 className="text-lg font-bold text-slate-800">Thông tin chung</h3>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                      Mã trạm
                    </p>
                    <p className="font-mono text-lg font-bold text-slate-800">{station.code}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                      Tỉnh / Thành phố
                    </p>
                    <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider inline-block mt-1">
                      {station.cityName || "N/A"}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                    Địa chỉ chi tiết
                  </p>
                  <p className="text-slate-800 font-medium bg-slate-50 p-3 rounded-lg border border-slate-100">
                    {station.address || "Chưa cập nhật địa chỉ chi tiết"}
                  </p>
                </div>
              </div>

              {/* Card 2: Bản đồ */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <CompassOutlined className="text-blue-500" /> Vị trí trên bản đồ
                </h3>

                <div className="relative w-full h-[400px] rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                  {/* Sử dụng iframe Google Maps nhúng trực tiếp tọa độ không cần API Key */}
                  <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    style={{ border: 0 }}
                    src={`https://maps.google.com/maps?q=${station.latitude},${station.longitude}&hl=vi&z=15&output=embed`}
                    allowFullScreen
                  ></iframe>

                  {/* Tọa độ nổi Overlay */}
                  <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur shadow-lg border border-slate-200 p-3 rounded-lg flex gap-6">
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                        Vĩ độ (Lat)
                      </p>
                      <p className="font-mono font-bold text-slate-800">{station.latitude}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                        Kinh độ (Lng)
                      </p>
                      <p className="font-mono font-bold text-slate-800">{station.longitude}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN (4 cols) - System Info */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm sticky top-24">
                <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                  <SettingOutlined className="text-slate-400 text-lg" />
                  <h3 className="text-base font-bold text-slate-800">Thông tin hệ thống</h3>
                </div>

                <div className="space-y-5">
                  <div>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                      ID Định danh (Database)
                    </p>
                    <div className="bg-slate-50 border border-slate-200 rounded p-2 text-xs font-mono text-slate-600 break-all">
                      {station.id}
                    </div>
                  </div>

                  {/* Lịch sử bản ghi (Giao diện mẫu vì DTO hiện tại chưa trả về ngày tháng) */}
                  <div className="pt-4 border-t border-slate-100">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4">
                      Lịch sử bản ghi
                    </p>

                    <div className="relative pl-6 border-l-2 border-slate-100 space-y-6">
                      <div className="relative">
                        <div className="absolute -left-[31px] bg-blue-50 text-blue-500 p-1 rounded-full border-4 border-white">
                          <PlusOutlined className="text-[10px]" />
                        </div>
                        <p className="text-sm font-bold text-slate-800">Khởi tạo</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                          <UserOutlined /> Quản trị viên
                        </p>
                      </div>

                      <div className="relative">
                        <div className="absolute -left-[31px] bg-slate-50 text-slate-400 p-1 rounded-full border-4 border-white">
                          <ClockCircleOutlined className="text-[10px]" />
                        </div>
                        <p className="text-sm font-bold text-slate-800">Cập nhật cuối</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                          Hệ thống lưu trữ
                        </p>
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
