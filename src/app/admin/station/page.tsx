"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  EyeOutlined,
  SearchOutlined,
  DownOutlined,
  EnvironmentOutlined,
  AimOutlined,
} from "@ant-design/icons";

import Sidebar from "@/components/admin/Sidebar";
import Header from "@/components/admin/Header";
import { getStations, Station } from "@/services/station.service";

export interface City {
  id: number;
  name: string;
}

export default function StationManagementPage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination & Filter States
  const [searchText, setSearchText] = useState("");
  const [selectedCityId, setSelectedCityId] = useState<number | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const fetchStationsData = async () => {
    try {
      setLoading(true);
      const response = await getStations();
      setStations(response.stations || []);

      setCities([
        { id: 1, name: "Hà Nội (Việt Nam)" },
        { id: 2, name: "Lạng Sơn (Việt Nam)" },
        { id: 3, name: "Nanning (China)" },
      ]);
    } catch (err) {
      console.error(err);
      setError("Không thể tải dữ liệu điểm dừng từ Server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStationsData();
  }, []);

  // Lọc dữ liệu không cần check Role nữa
  const filteredStations = stations.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(searchText.toLowerCase()) ||
      s.code.toLowerCase().includes(searchText.toLowerCase());

    const matchCity =
      selectedCityId === "all" || s.cityName === cities.find((c) => c.id === selectedCityId)?.name;

    return matchSearch && matchCity;
  });

  const totalPages = Math.ceil(filteredStations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentStations = filteredStations.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, selectedCityId]);

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900">
      <Sidebar />

      <main className="flex-1 flex flex-col ml-64 overflow-hidden pt-16">
        <Header />

        <div className="p-8 h-full overflow-y-auto">
          {/* HEADER SECTION */}
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-3xl font-black text-[#1E293B] uppercase tracking-tight">
                DANH SÁCH ĐIỂM DỪNG
              </h2>
              <p className="text-slate-500 mt-1 text-[14px]">
                Quản lý danh mục các trạm dừng, bến đỗ toàn hệ thống.
              </p>
            </div>

            {/* Đã bỏ check isAdmin, ai vào cũng thấy nút Thêm */}
            <Link href="/admin/station/add">
              <button className="bg-[#1677FF] hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all shadow-sm shadow-blue-200 text-sm">
                <PlusOutlined /> Thêm điểm dừng
              </button>
            </Link>
          </div>

          {/* FILTER BAR */}
          <div className="flex items-center gap-4 mb-8">
            <div className="relative w-[400px]">
              <SearchOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 z-10" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên hoặc mã trạm..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm placeholder:text-slate-400 placeholder:font-medium"
              />
            </div>

            <div className="relative min-w-[220px]">
              <select
                value={selectedCityId}
                onChange={(e) =>
                  setSelectedCityId(e.target.value === "all" ? "all" : Number(e.target.value))
                }
                className="w-full appearance-none px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm cursor-pointer pr-10"
              >
                <option value="all">Tất cả tỉnh/thành</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
              <DownOutlined className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 text-[10px] pointer-events-none" />
            </div>
          </div>

          {/* MAIN CONTENT */}
          {loading && (
            <div className="p-20 text-center flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-600 font-bold">Đang tải dữ liệu điểm dừng từ hệ thống...</p>
            </div>
          )}

          {!loading && error && (
            <div className="bg-red-50 text-red-500 border border-red-200 p-10 text-center font-bold rounded-xl">
              {error}
            </div>
          )}

          {!loading && !error && (
            <>
              {filteredStations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                  {currentStations.map((station) => (
                    // Đã bỏ truyền userRole vào Card
                    <StationCard key={station.id} station={station} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 p-20 text-center text-slate-600 font-bold shadow-sm">
                  Không tìm thấy điểm dừng nào phù hợp với yêu cầu.
                </div>
              )}

              {/* PAGINATION */}
              {filteredStations.length > 0 && (
                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <p className="text-xs text-slate-600 font-bold">
                    Hiển thị {startIndex + 1}-
                    {Math.min(startIndex + itemsPerPage, filteredStations.length)} trong tổng số{" "}
                    {filteredStations.length} điểm dừng
                  </p>

                  <div className="flex items-center gap-1.5">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((prev) => prev - 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-300 text-slate-600 font-bold hover:bg-slate-50 disabled:opacity-50 transition-all"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M15 18l-6-6 6-6" />
                      </svg>
                    </button>
                    {[...Array(totalPages)].map((_, index) => {
                      const page = index + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg font-black text-xs transition-all ${
                            currentPage === page
                              ? "bg-[#1677FF] text-white shadow-md shadow-blue-200"
                              : "bg-white border border-slate-300 text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    <button
                      disabled={currentPage === totalPages || totalPages === 0}
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-300 text-slate-600 font-bold hover:bg-slate-50 disabled:opacity-50 transition-all"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

// === COMPONENT THẺ ĐIỂM DỪNG (STATION CARD) ===
// Đã bỏ prop userRole
function StationCard({ station }: { station: Station }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 flex flex-col group h-full">
      {/* Card Header */}
      <div className="p-6 pb-2 flex justify-between items-center">
        <span className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-[6px] text-[10px] font-black tracking-widest uppercase">
          {station.cityName || "N/A"}
        </span>
        <span className="text-[12px] font-bold text-slate-500 font-mono tracking-wider">
          {station.code}
        </span>
      </div>

      {/* Card Body */}
      <div className="px-6 flex-1 flex flex-col">
        <h3 className="text-xl font-black text-slate-800 tracking-tight mb-4 mt-2 leading-snug">
          {station.name}
        </h3>

        <div className="space-y-4 mb-4">
          <div className="flex items-start gap-3">
            <EnvironmentOutlined className="text-[15px] text-slate-400 mt-[2px] shrink-0" />
            <span className="text-[13px] font-semibold text-slate-600 line-clamp-2 leading-relaxed">
              {station.address || "Chưa cập nhật địa chỉ"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <AimOutlined className="text-[15px] text-slate-400 shrink-0" />
            <span className="text-[12px] font-mono font-bold text-slate-500 bg-slate-50 border border-slate-100 px-2.5 py-1.5 rounded-lg tracking-wide">
              {station.latitude}° N, {station.longitude}° E
            </span>
          </div>
        </div>
      </div>

      {/* Card Footer (Actions) */}
      <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between px-5 pb-5">
        <Link
          href={`/admin/station/view?id=${station.id}`}
          className="flex items-center gap-2 p-2 text-xs font-black text-slate-400 hover:text-[#1677FF] hover:bg-blue-50 transition-colors rounded-full"
        >
          <EyeOutlined className="text-[16px]" /> CHI TIẾT
        </Link>

        <Link
          href={`/admin/station/edit?id=${station.id}`}
          className="flex items-center gap-2 p-2 text-xs font-black text-slate-400 hover:text-[#1677FF] hover:bg-blue-50 transition-colors rounded-full"
        >
          <EditOutlined className="text-[16px]" /> SỬA
        </Link>

        {/* Đã bỏ check isAdmin, luôn hiện nút XÓA */}
        <button className="flex items-center gap-2 p-2 text-xs font-black text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors rounded-full">
          <DeleteOutlined className="text-[16px]" /> XÓA
        </button>
      </div>
    </div>
  );
}
