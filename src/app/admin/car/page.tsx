"use client";

import React, { useEffect, useState } from "react";
import { getCars, Car } from "@/services/car.service";

export default function CarManagementPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination FE
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const totalPages = Math.ceil(cars.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentCars = cars.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true);
        const data = await getCars();
        setCars(data.cars);
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
    <div className="p-8">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-800 uppercase">Danh sách xe</h2>
          <p className="text-slate-500 mt-1">Quản lý đội xe và trạng thái vận hành hiện tại.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {loading && <div className="p-6 text-center text-slate-500">Đang tải dữ liệu...</div>}

        {error && <div className="p-6 text-center text-red-500">{error}</div>}

        {!loading && !error && (
          <>
            <table className="w-full text-left border-collapse">
              <thead>...</thead>
              <tbody className="divide-y divide-slate-100">
                {currentCars.map((car) => (
                  <TableRow
                    key={car.id}
                    plate={car.licensePlate}
                    branch={car.branch?.name}
                    type={car.carType}
                    seats={car.totalSeat}
                    status={car.status}
                    usage={car.isActive ? "Hoạt động" : "Ngừng"}
                    year={car.manufactureYear}
                  />
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="px-6 py-4 bg-slate-50/30 flex items-center justify-between border-t border-slate-200">
              <p className="text-sm text-slate-500 font-medium">
                Hiển thị {cars.length === 0 ? 0 : startIndex + 1}-
                {Math.min(startIndex + itemsPerPage, cars.length)} trên tổng số {cars.length} xe
              </p>

              <div className="flex items-center gap-2">
                {/* Prev */}
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                  className="disabled:opacity-30"
                >
                  ‹
                </button>

                {/* Page numbers */}
                {[...Array(totalPages)].map((_, index) => {
                  const page = index + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm transition-all ${
                        currentPage === page
                          ? "bg-blue-600 text-white"
                          : "hover:bg-slate-200 text-slate-600"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                {/* Next */}
                <button
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  className="disabled:opacity-30"
                >
                  ›
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

interface TableRowProps {
  plate: string;
  branch?: string;
  type: string;
  seats: number;
  status: string;
  usage: string;
  year: number;
}

function TableRow({ plate, branch, type, seats, status, usage, year }: TableRowProps) {
  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-6 py-4 font-bold text-slate-700">{plate}</td>

      <td className="px-6 py-4 text-sm text-slate-500 font-medium">{branch}</td>

      <td className="px-6 py-4">
        <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-1 rounded uppercase border border-blue-100">
          {type}
        </span>
      </td>

      <td className="px-6 py-4 text-sm text-center">{seats}</td>

      <td className="px-6 py-4">
        <span
          className={`text-sm font-medium ${
            status === "RUNNING" ? "text-emerald-600" : "text-red-500"
          }`}
        >
          {status}
        </span>
      </td>

      <td className="px-6 py-4 text-center">{year}</td>

      <td className="px-6 py-4">
        <span
          className={`text-[11px] font-bold px-3 py-1 rounded-full ${
            usage === "Hoạt động"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-orange-100 text-orange-700"
          }`}
        >
          {usage}
        </span>
      </td>
    </tr>
  );
}
