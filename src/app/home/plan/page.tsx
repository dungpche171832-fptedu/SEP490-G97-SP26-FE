"use client";
import React, { useEffect, useState } from "react";
import { Plan } from "src/model/plan";
import { planService } from "src/services/planService";
import PlanCard from "src/components/plan/plan_card";

export default function ListPlanPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    planService
      .getListPlans()
      .then((data) => {
        setPlans(data.plans || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* 1. Header Tiêu đề */}
      <div className="bg-white border-b border-slate-100 px-6 py-8 md:px-20">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-slate-800">Lịch Trình Xe</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 md:px-20">
        {/* 2. Thanh tìm kiếm & Lọc (White Box) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-50 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-7">
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-wider">
                Tìm kiếm lịch trình
              </label>
              <div className="relative">
                <svg
                  className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tuyến đường, mã lịch trình..."
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-none rounded-lg text-sm outline-none ring-1 ring-slate-100 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>
            <div className="md:col-span-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-wider">
                Ngày đi
              </label>
              <div className="relative">
                <svg
                  className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <input
                  type="text"
                  value="15/05/2024"
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-none rounded-lg text-sm font-bold text-slate-600 outline-none ring-1 ring-slate-100"
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <button className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-2 hover:bg-blue-700 transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 4.5h14.5M3 9.5h14.5M3 14.5h14.5"
                  />
                </svg>
                Lọc kết quả
              </button>
            </div>
          </div>
        </div>

        {/* 3. Toolbar (Số lượng & Chế độ xem) */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-[12px] text-slate-500">
            Tìm thấy <span className="font-bold text-blue-600">{plans.length}</span> lịch trình
          </p>
          <div className="flex gap-2">
            <button className="p-1.5 bg-blue-600 text-white rounded">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button className="p-1.5 text-slate-400 hover:bg-white rounded border border-slate-200">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* 4. Grid Danh sách Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((p) => (
            <PlanCard key={p.id} plan={p} />
          ))}
        </div>

        {/* 5. Phân trang (Pagination) */}
        <div className="flex flex-col md:flex-row justify-between items-center mt-12 gap-4">
          <p className="text-[11px] text-slate-400 font-medium font-inter">
            Hiển thị <span className="text-slate-700 font-bold font-inter">1-6</span> trên{" "}
            <span className="text-slate-700 font-bold font-inter">24</span> lịch trình
          </p>
          <div className="flex gap-1">
            <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 text-slate-400 hover:bg-white">
              ‹
            </button>
            {[1, 2, 3, "...", 6].map((n, i) => (
              <button
                key={i}
                className={`w-8 h-8 flex items-center justify-center rounded font-bold text-[11px] transition-all ${n === 1 ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-white border border-slate-200"}`}
              >
                {n}
              </button>
            ))}
            <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 text-slate-400 hover:bg-white">
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
