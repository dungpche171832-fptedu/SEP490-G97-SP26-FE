"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plan } from "src/model/plan";
import { planService } from "src/services/planService";
import PlanCard from "src/components/plan/plan_card";
import { DatePicker } from "antd";
import dayjs from "dayjs";

export default function ListPlanPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    planService
      .getListPlans()
      .then((data) => {
        // Giả sử data trả về có field plans hoặc là một array
        setPlans(Array.isArray(data) ? data : data.plans || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleBooking = (id: number) => {
    // Điều hướng sang màn hình ticket kèm query param planId
    router.push(`/home/ticket?planId=${id}`);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-6 py-8 md:px-20">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
              Lịch Trình Xe
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 md:px-20">
        {/* Bộ lọc tìm kiếm */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-50 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-7">
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-wider">
                Tìm kiếm lịch trình
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tuyến đường, mã lịch trình..."
                  className="w-full pl-4 pr-4 py-2.5 bg-slate-50 border-none rounded-lg text-sm font-bold text-black placeholder:text-slate-400 outline-none ring-1 ring-slate-100 focus:ring-blue-500/20 transition-all"
                  style={{ color: "black" }}
                />
              </div>
            </div>
            <div className="md:col-span-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-wider">
                Ngày đi
              </label>
              <div className="w-full bg-slate-50 rounded-lg ring-1 ring-slate-100 focus-within:ring-blue-500/20 transition-all">
                <DatePicker
                  defaultValue={dayjs("15/05/2024", "DD/MM/YYYY")}
                  format="DD/MM/YYYY"
                  variant="borderless"
                  className="w-full px-4 py-2.5 text-sm font-black ant-datepicker-input-black"
                  style={{ width: "100%" }}
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <button className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-bold text-xs hover:bg-blue-700 transition-all uppercase">
                Lọc kết quả
              </button>
            </div>
          </div>
        </div>

        {/* Danh sách hiển thị */}
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((p) => (
              <PlanCard
                key={p.id}
                plan={p}
                onBook={handleBooking} // Truyền function vào đây, không render nút bấm ở ngoài nữa
              />
            ))}
          </div>
        )}

        {!loading && plans.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
            <p className="text-slate-400 font-medium">Không tìm thấy lịch trình nào phù hợp.</p>
          </div>
        )}
      </div>
    </div>
  );
}
