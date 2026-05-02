"use client";
import React, { useState, useEffect } from "react";
import { Ticket, MapPin, DollarSign, Calendar } from "lucide-react";
import { getDashboardData } from "@/services/dashboardService";
import { DashboardData } from "@/model/dashboard";

export default function DashboardPerformance() {
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const [startDate, setStartDate] = useState(getTodayDate());
  const [endDate, setEndDate] = useState(getTodayDate());

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await getDashboardData(startDate, endDate);
      setData(result);
    } catch (error) {
      console.error("Lỗi lấy dữ liệu:", error);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFilter = () => {
    if (!startDate || !endDate) {
      alert("Vui lòng chọn đầy đủ Từ ngày và Đến ngày!");
      return;
    }
    fetchData();
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-slate-50 min-h-screen font-sans">
      {/* Vùng chọn ngày */}
      <div className="flex flex-wrap items-center justify-between bg-white px-6 py-4 rounded-xl shadow-sm border border-slate-100 gap-4 mb-8">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Từ ngày
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 bg-white !text-black border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Đến ngày
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 bg-white !text-black border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Nút Lọc */}
          <button
            onClick={handleFilter}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Lọc
          </button>
        </div>

        <div className="flex items-center gap-2 text-slate-500 bg-slate-50 px-3 py-2 rounded-lg border border-dashed border-slate-200">
          <Calendar className="w-4 h-4" />
          <span className="text-xs font-medium">Giờ mặc định: 00:00:00</span>
        </div>
      </div>

      {/* Hiển thị dữ liệu */}
      {loading ? (
        <div className="py-20 text-center text-slate-500">Đang tải dữ liệu...</div>
      ) : data ? (
        <>
          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-40">
              <div className="flex justify-between items-start">
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <Ticket className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-xs font-bold tracking-wider text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                  TICKETS
                </span>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-slate-900 mt-2">
                  {data.totalTickets ? data.totalTickets.toLocaleString() : 0}
                </h3>
                <p className="text-xs text-slate-500 mt-1">Tổng số vé đã bán</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-40">
              <div className="flex justify-between items-start">
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <MapPin className="w-5 h-5 text-indigo-600" />
                </div>
                <span className="text-xs font-bold tracking-wider text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                  PLANS
                </span>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-slate-900 mt-2">
                  {data.totalPlans ? data.totalPlans.toLocaleString() : 0}
                </h3>
                <p className="text-xs text-slate-500 mt-1">Chuyến đi đã lên lịch</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-40">
              <div className="flex justify-between items-start">
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                </div>
                <span className="text-xs font-bold tracking-wider text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                  REVENUE
                </span>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-slate-900 mt-2">
                  ₫{data.totalRevenue ? data.totalRevenue.toLocaleString() : 0}
                </h3>
                <p className="text-xs text-slate-500 mt-1">Doanh thu trong kỳ</p>
              </div>
            </div>
          </div>

          {/* Top Routes */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-slate-900 mb-8">Top Routes Performance</h2>

            <div className="space-y-8">
              {data.topRoutes &&
                data.topRoutes.map((route) => (
                  <div
                    key={route.routeId}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-50 pb-6 last:border-0 last:pb-0"
                  >
                    <div className="flex-1">
                      <span className="text-sm font-semibold text-slate-800">
                        {route.routeName}
                      </span>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full mt-3 overflow-hidden">
                        <div
                          className="h-2.5 rounded-full bg-blue-600"
                          style={{
                            width: `${Math.min(
                              100,
                              (route.totalTickets / (data.totalTickets || 1)) * 100,
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex md:flex-col items-end justify-between md:justify-center w-full md:w-36">
                      <span className="text-xs font-medium text-slate-400 md:hidden">Tickets</span>
                      <span className="text-sm font-bold text-slate-900">
                        {route.totalTickets.toLocaleString()} tickets
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </>
      ) : (
        <div className="py-20 text-center text-slate-500">
          Không tìm thấy dữ liệu cho khoảng thời gian đã chọn.
        </div>
      )}
    </div>
  );
}
