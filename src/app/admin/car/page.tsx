"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { EditOutlined, DeleteOutlined, PlusOutlined, EyeOutlined } from "@ant-design/icons";

// Layout Components
import Sidebar from "@/components/admin/Sidebar";
import Header from "@/components/admin/Header";

// Services
import { getCars, Car } from "@/services/car.service";

export default function CarManagementPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination FE - Đã cập nhật lên 8 dòng
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const totalPages = Math.ceil(cars.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentCars = cars.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true);
        const data = await getCars();
        setCars(data.cars || []);
      } catch (err) {
        console.error(err);
        setError("Không thể tải dữ liệu xe");
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, []);

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans">
      <main className="flex-1 flex flex-col ml-64 overflow-hidden pt-16">
        {/* Content */}
        <div className="p-8 h-full overflow-y-auto">
          {/* Header Section */}
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-black text-[#1E293B] uppercase tracking-tight">
                DANH SÁCH XE
              </h2>
              <p className="text-slate-500 mt-1 text-sm">
                Quản lý đội xe và trạng thái vận hành hiện tại.
              </p>
            </div>

            {/* Nút Thêm Xe */}
            <Link href="/admin/car/add">
              <button className="bg-[#1677FF] hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-all shadow-sm text-sm">
                <PlusOutlined /> Thêm xe
              </button>
            </Link>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {loading && (
              <div className="p-10 text-center text-slate-500 bg-white">Đang tải dữ liệu...</div>
            )}

            {error && (
              <div className="p-10 text-center text-red-500 font-medium bg-white">{error}</div>
            )}

            {!loading && !error && (
              <>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[11px] text-[#64748B] font-bold uppercase tracking-widest border-b border-slate-200 bg-[#FBFDFF]">
                      <th className="px-6 py-5">BIỂN SỐ XE</th>
                      <th className="px-6 py-5">CHI NHÁNH</th>
                      <th className="px-6 py-5">LOẠI XE</th>
                      <th className="px-6 py-5">SỐ GHẾ</th>
                      <th className="px-6 py-5">TRẠNG THÁI XE</th>
                      <th className="px-6 py-5">NĂM SX</th>
                      <th className="px-6 py-5">TRẠNG THÁI SD</th>
                      <th className="px-6 py-5 text-right">HÀNH ĐỘNG</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentCars.map((car) => (
                      <TableRow
                        key={car.id}
                        id={car.id}
                        plate={car.licensePlate}
                        branch={car.branch?.name}
                        type={car.carType}
                        seats={car.totalSeat}
                        status={car.status}
                        usage={car.isActive ? "Hoạt động" : "Bảo trì"}
                        year={car.manufactureYear}
                      />
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                <div className="px-6 py-4 bg-[#FBFDFF] flex items-center justify-between border-t border-slate-200">
                  <p className="text-xs text-slate-500 font-medium italic">
                    Hiển thị {cars.length === 0 ? 0 : startIndex + 1}-
                    {Math.min(startIndex + itemsPerPage, cars.length)} trong số {cars.length} xe
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((prev) => prev - 1)}
                      className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 bg-white text-slate-400 hover:bg-slate-50 disabled:opacity-30 transition-all"
                    >
                      <svg
                        width="12"
                        height="12"
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
                          className={`w-7 h-7 flex items-center justify-center rounded font-bold text-xs transition-all ${
                            currentPage === page
                              ? "bg-[#1677FF] text-white shadow-sm border border-[#1677FF]"
                              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}

                    <button
                      disabled={currentPage === totalPages || totalPages === 0}
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                      className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 bg-white text-slate-400 hover:bg-slate-50 disabled:opacity-30 transition-all"
                    >
                      <svg
                        width="12"
                        height="12"
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
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
/* ================= INTERNAL COMPONENTS ================= */

// ✅ 1. Thêm Interface định nghĩa kiểu dữ liệu cho props của TableRow
interface TableRowProps {
  id: number;
  plate: string;
  branch?: string;
  type: string;
  seats: number;
  status: string;
  usage: string;
  year?: number;
}

// ✅ 2. Thay thế `any` bằng `TableRowProps`
function TableRow({ id, plate, branch, type, seats, status, usage, year }: TableRowProps) {
  const formatPlate = (p: string) => {
    if (!p) return "—";
    const parts = p.split("-");
    if (parts.length === 2) {
      return (
        <>
          {parts[0]}-<br />
          {parts[1]}
        </>
      );
    }
    return p;
  };

  return (
    <tr className="hover:bg-slate-50/50 transition-colors group">
      <td className="px-6 py-5">
        <span className="font-extrabold text-[#1E293B] text-[14px] leading-tight block w-20 break-words">
          {formatPlate(plate)}
        </span>
      </td>
      <td className="px-6 py-5 text-sm text-[#64748B] font-medium">{branch || "—"}</td>
      <td className="px-6 py-5">
        <span className="bg-[#EFF6FF] text-[#3B82F6] text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wide border border-[#DBEAFE]">
          {type}
        </span>
      </td>
      <td className="px-6 py-5 text-sm font-semibold text-[#1E293B]">{seats}</td>
      <td className="px-6 py-5">
        <div className="flex items-center gap-2">
          <span
            className={`w-1.5 h-1.5 rounded-full ${status === "RUNNING" ? "bg-[#10B981]" : "bg-[#94A3B8]"}`}
          ></span>
          <span
            className={`text-[13px] font-bold ${status === "RUNNING" ? "text-[#10B981]" : "text-[#64748B]"}`}
          >
            {status === "RUNNING" ? "Running" : "Stop"}
          </span>
        </div>
      </td>
      <td className="px-6 py-5 text-sm text-[#64748B] font-medium">{year || "—"}</td>
      <td className="px-6 py-5">
        <span
          className={`text-[10px] font-bold px-3 py-1.5 rounded uppercase tracking-wider ${
            usage === "Hoạt động" ? "bg-[#D1FAE5] text-[#059669]" : "bg-[#FEF3C7] text-[#D97706]"
          }`}
        >
          {usage}
        </span>
      </td>
      <td className="px-6 py-5 text-right">
        <div className="flex items-center justify-end gap-4 text-[#94A3B8]">
          <Link href={`/admin/car/view/${id}`} className="hover:text-blue-600 transition-colors">
            <EyeOutlined className="text-[17px]" />
          </Link>
          <Link href={`/admin/car/edit/${id}`} className="hover:text-blue-600 transition-colors">
            <EditOutlined className="text-[17px]" />
          </Link>
          <button className="hover:text-red-500 transition-colors" title="Xóa">
            <DeleteOutlined className="text-[17px]" />
          </button>
        </div>
      </td>
    </tr>
  );
}
