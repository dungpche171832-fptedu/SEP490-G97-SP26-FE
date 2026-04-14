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
  UserOutlined,
} from "@ant-design/icons";

import Sidebar from "@/components/admin/Sidebar";
import Header from "@/components/admin/Header";
import { getCars, getBranchesForSelect, Car, Branch } from "@/services/car.service";

export default function CarManagementPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]); // Lưu danh sách chi nhánh
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination & Filter States
  const [searchText, setSearchText] = useState("");
  const [selectedBranchId, setSelectedBranchId] = useState<number | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [carsData, branchesData] = await Promise.all([getCars(), getBranchesForSelect()]);
        setCars(carsData.cars || []);
        setBranches(branchesData || []);
      } catch (err) {
        console.error(err);
        setError("Không thể tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ✅ LOGIC LỌC KẾT HỢP: Biển số xe + Chi nhánh
  const filteredCars = cars.filter((c) => {
    const matchSearch = c.licensePlate.toLowerCase().includes(searchText.toLowerCase());
    const matchBranch = selectedBranchId === "all" || c.branch?.id === selectedBranchId;
    return matchSearch && matchBranch;
  });

  // Phân trang
  const totalPages = Math.ceil(filteredCars.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentCars = filteredCars.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1); // Reset về trang 1 khi search hoặc đổi chi nhánh
  }, [searchText, selectedBranchId]);

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
                DANH SÁCH XE
              </h2>
              <p className="text-slate-500 mt-1 text-[14px]">
                Quản lý đội xe và trạng thái vận hành hiện tại.
              </p>
            </div>

            <Link href="/admin/car/add">
              <button className="bg-[#1677FF] hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all shadow-sm shadow-blue-200 text-sm">
                <PlusOutlined /> Thêm xe
              </button>
            </Link>
          </div>

          {/* ✅ FILTER BAR: Cải thiện độ tương phản màu chữ */}
          <div className="flex items-center gap-4 mb-8">
            {/* Search Input */}
            <div className="relative w-[400px]">
              <SearchOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 z-10" />
              <input
                type="text"
                placeholder="Tìm kiếm theo biển số xe..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                // text-slate-900 và font-bold giúp chữ nổi bật trên screen
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm placeholder:text-slate-400 placeholder:font-medium"
              />
            </div>

            {/* Branch Selector */}
            <div className="relative min-w-[220px]">
              <select
                value={selectedBranchId}
                onChange={(e) =>
                  setSelectedBranchId(e.target.value === "all" ? "all" : Number(e.target.value))
                }
                className="w-full appearance-none px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm cursor-pointer pr-10"
              >
                <option value="all">Tất cả chi nhánh</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
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
              <p className="text-slate-600 font-bold">Đang tải dữ liệu xe...</p>
            </div>
          )}

          {!loading && !error && (
            <>
              {filteredCars.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                  {currentCars.map((car) => (
                    <CarCard key={car.id} car={car} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 p-20 text-center text-slate-600 font-bold shadow-sm">
                  Không tìm thấy xe nào phù hợp với yêu cầu.
                </div>
              )}

              {/* PAGINATION */}
              {filteredCars.length > 0 && (
                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <p className="text-xs text-slate-600 font-bold">
                    Hiển thị {startIndex + 1}-
                    {Math.min(startIndex + itemsPerPage, filteredCars.length)} trong tổng số{" "}
                    {filteredCars.length} xe
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
                    {/* ... (Các nút số trang giữ nguyên) */}
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
                      disabled={currentPage === totalPages}
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

// Giữ nguyên component CarCard bên dưới...
function CarCard({ car }: { car: Car }) {
  const formatPlate = (plate: string) => {
    if (!plate) return "—";
    if (plate.includes("-")) {
      const parts = plate.split("-");
      return `${parts[0]} - ${parts[1]}`;
    }
    return plate;
  };

  const getCoverImage = (type: string) => {
    const carType = type.toUpperCase();
    if (carType.includes("LIMO")) return "/images/bus3.png";
    if (carType.includes("SLEEPER")) return "/images/bus3.png"; // Có thể đổi sau
    if (carType.includes("SEAT")) return "/images/bus3.png"; // Có thể đổi sau
    return "/images/bus3.png";
  };

  const coverImage = getCoverImage(car.carType);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col group">
      <div className="relative h-[220px] w-full bg-slate-100 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={coverImage}
          alt={car.licensePlate}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute top-4 left-4 bg-[#1677FF] text-white px-2.5 py-1 rounded-[6px] text-[10px] font-black tracking-widest uppercase shadow-sm">
          {car.carType}
        </div>
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1.5">
          <span
            className={`w-1.5 h-1.5 rounded-full ${car.status === "RUNNING" ? "bg-[#059669]" : "bg-[#DC2626]"}`}
          ></span>
          <span className={car.status === "RUNNING" ? "text-[#059669]" : "text-[#DC2626]"}>
            {car.status === "RUNNING" ? "RUNNING" : "STOP"}
          </span>
        </div>
      </div>
      <div className="p-6 flex flex-col flex-1">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black text-slate-800 tracking-tight">
            {formatPlate(car.licensePlate)}
          </h3>
          <span className="text-[12px] font-bold text-slate-500 uppercase tracking-widest">
            SX: {car.manufactureYear || "N/A"}
          </span>
        </div>
        <div className="space-y-3.5 mb-6">
          <div className="flex justify-between items-center text-[13px]">
            <div className="flex items-center gap-2 text-slate-500 font-bold">
              <UserOutlined className="text-[14px]" />
              Số ghế:
            </div>
            <span className="font-black text-slate-800">{car.totalSeat} Chỗ</span>
          </div>
          <div className="flex justify-between items-center text-[13px]">
            <div className="flex items-center gap-2 text-slate-500 font-bold">
              <EnvironmentOutlined className="text-[14px]" />
              Chi nhánh:
            </div>
            <span className="font-black text-slate-800 truncate max-w-[150px] text-right">
              {car.branch?.name?.replace("Chi nhánh ", "") || "Chưa cập nhật"}
            </span>
          </div>
        </div>
        <div className="mt-auto pt-5 border-t border-slate-100 flex items-center justify-between px-4">
          <Link
            href={`/admin/car/view?id=${car.id}`}
            className="text-slate-400 hover:text-[#1677FF] transition-colors p-2 rounded-full hover:bg-blue-50"
          >
            <EyeOutlined className="text-[18px]" />
          </Link>
          <Link
            href={`/admin/car/edit?id=${car.id}`}
            className="text-slate-400 hover:text-[#1677FF] transition-colors p-2 rounded-full hover:bg-blue-50"
          >
            <EditOutlined className="text-[18px]" />
          </Link>
          <button className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50">
            <DeleteOutlined className="text-[18px]" />
          </button>
        </div>
      </div>
    </div>
  );
}
