"use client";
import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plan } from "src/model/plan";
import { planService } from "src/services/planService";
import PlanCard from "src/components/plan/plan_card";
import { DatePicker } from "antd";
import dayjs from "dayjs";

interface PlanExtended extends Plan {
  startStationName?: string;
  endStationName?: string;
}

export default function ListPlanPage() {
  // Thay thế any bằng PlanExtended
  const [plans, setPlans] = useState<PlanExtended[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchInput, setSearchInput] = useState("");
  const [dateInput, setDateInput] = useState<string | null>(null);

  const [filterQuery, setFilterQuery] = useState({ text: "", date: null as string | null });

  const router = useRouter();

  useEffect(() => {
    planService
      .getListPlans()
      .then((data) => {
        // Xử lý dữ liệu trả về và ép kiểu an toàn
        let plansData: PlanExtended[] = [];
        if (Array.isArray(data)) {
          plansData = data;
        } else if (data && typeof data === "object" && "plans" in data) {
          plansData = data.plans as PlanExtended[];
        }

        setPlans(plansData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredPlans = useMemo(() => {
    return plans.filter((p) => {
      // Loại bỏ hoàn toàn 'as any' bằng cách sử dụng Optional Chaining và Default Value
      const startStation = p.startStationName ?? "";
      const endStation = p.endStationName ?? "";

      const searchContent = `${startStation} ${endStation}`.toLowerCase();
      const matchesSearch = searchContent.includes(filterQuery.text.toLowerCase());

      const matchesDate = filterQuery.date
        ? dayjs(p.startTime).format("YYYY-MM-DD") === filterQuery.date
        : true;

      return matchesSearch && matchesDate;
    });
  }, [filterQuery, plans]);

  const handleSearch = () => {
    setFilterQuery({
      text: searchInput,
      date: dateInput,
    });
  };

  const handleBooking = (id: number) => {
    router.push(`/home/ticket?planId=${id}`);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="bg-white border-b border-slate-100 px-6 py-8 md:px-20">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
            Lịch Trình Xe
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 md:px-20">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-50 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-7">
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-wider">
                Điểm đi / Điểm đến
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Nhập địa điểm bạn muốn đến..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-4 pr-4 py-2.5 bg-slate-50 border-none rounded-lg text-sm font-bold text-slate-900 placeholder:text-slate-400 outline-none ring-1 ring-slate-200 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>

            <div className="md:col-span-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-wider">
                Ngày đi
              </label>
              <div className="w-full bg-slate-50 rounded-lg ring-1 ring-slate-200 focus-within:ring-blue-500/20 transition-all">
                <DatePicker
                  format="DD/MM/YYYY"
                  variant="borderless"
                  placeholder="Chọn ngày"
                  className="w-full px-4 py-2.5 text-sm font-black"
                  style={{ width: "100%" }}
                  // Fix lỗi value của DatePicker nếu cần thiết
                  value={dateInput ? dayjs(dateInput) : null}
                  onChange={(date) => {
                    setDateInput(date ? date.format("YYYY-MM-DD") : null);
                  }}
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <button
                onClick={handleSearch}
                className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-bold text-xs hover:bg-blue-700 transition-all uppercase shadow-lg shadow-blue-200"
              >
                Tìm kiếm
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="mb-6 flex justify-between items-center">
              <p className="text-slate-500 text-sm">
                Hiển thị <b>{filteredPlans.length}</b> lịch trình
              </p>
              {(filterQuery.text || filterQuery.date) && (
                <button
                  onClick={() => {
                    setSearchInput("");
                    setDateInput(null);
                    setFilterQuery({ text: "", date: null });
                  }}
                  className="text-blue-600 text-xs font-bold uppercase hover:underline"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlans.map((p) => (
                <PlanCard key={p.id} plan={p} onBook={handleBooking} />
              ))}
            </div>
          </>
        )}

        {!loading && filteredPlans.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
            <p className="text-slate-400 font-medium">Không tìm thấy lịch trình phù hợp.</p>
          </div>
        )}
      </div>
    </div>
  );
}
