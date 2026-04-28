"use client";
import React, { useEffect, useState, useCallback } from "react"; // Thêm useCallback
import { useRouter, useSearchParams } from "next/navigation";
import { Plan } from "src/model/plan";
import { planService } from "src/services/planService";
import { getStations, Station } from "src/services/station.service";
import PlanCard from "src/components/plan/plan_card";
import { DatePicker, Select, message } from "antd";
import { SearchOutlined } from "@ant-design/icons"; // Xóa CaretDownOutlined
import dayjs from "dayjs";

interface PlanExtended extends Plan {
  startStationName?: string;
  endStationName?: string;
}

export default function ListPlanPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [plans, setPlans] = useState<PlanExtended[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);

  const [depId, setDepId] = useState<number | undefined>(
    searchParams.get("dep") ? Number(searchParams.get("dep")) : undefined,
  );
  const [desId, setDesId] = useState<number | undefined>(
    searchParams.get("des") ? Number(searchParams.get("des")) : undefined,
  );
  const [dateStr, setDateStr] = useState<string | null>(searchParams.get("date"));

  useEffect(() => {
    getStations()
      .then((data) => setStations(data.stations || []))
      .catch(() => message.error("Không thể tải danh sách điểm dừng"));
  }, []);

  // Sử dụng useCallback để đóng gói hàm fetch, tránh re-render vô tận
  const fetchFilteredPlans = useCallback(async () => {
    setLoading(true);
    try {
      const data = await planService.searchPlans({
        departureStationId: depId,
        destinationStationId: desId,
        startTime: dateStr || undefined,
        status: "ACTIVE",
      });
      setPlans(data.plans || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [depId, desId, dateStr]); // Dependency của hàm fetch

  useEffect(() => {
    fetchFilteredPlans();
  }, [fetchFilteredPlans]); // Thêm fetchFilteredPlans vào đây

  const handleSearchClick = () => {
    const params = new URLSearchParams();
    if (depId) params.append("dep", depId.toString());
    if (desId) params.append("des", desId.toString());
    if (dateStr) params.append("date", dateStr);
    router.push(`/home/plan?${params.toString()}`);
  };

  const stationOptions = stations.map((s) => ({ value: s.id, label: s.name }));

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
            <div className="md:col-span-4">
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-wider">
                Điểm đi
              </label>
              <Select
                showSearch
                allowClear
                placeholder="Tất cả điểm đi"
                className="w-full font-bold"
                size="large"
                options={stationOptions}
                value={depId}
                onChange={(val) => setDepId(val)}
              />
            </div>

            <div className="md:col-span-4">
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-wider">
                Điểm đến
              </label>
              <Select
                showSearch
                allowClear
                placeholder="Tất cả điểm đến"
                className="w-full font-bold"
                size="large"
                options={stationOptions}
                value={desId}
                onChange={(val) => setDesId(val)}
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-wider">
                Ngày đi
              </label>
              <DatePicker
                format="DD/MM/YYYY"
                placeholder="Chọn ngày"
                className="w-full py-2 font-bold"
                value={dateStr ? dayjs(dateStr) : null}
                onChange={(date) => setDateStr(date ? date.format("YYYY-MM-DD") : null)}
              />
            </div>

            <div className="md:col-span-2">
              <button
                onClick={handleSearchClick}
                className="w-full h-[40px] bg-blue-600 text-white rounded-lg font-bold text-xs hover:bg-blue-700 transition-all uppercase shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
              >
                <SearchOutlined /> Tìm kiếm
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="mb-6 flex justify-between items-center">
              <p className="text-slate-500 text-sm">
                Hiển thị <b>{plans.length}</b> lịch trình hoạt động
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((p) => (
                <PlanCard
                  key={p.id}
                  plan={p}
                  onBook={(id) => router.push(`/home/ticket?planId=${id}`)}
                />
              ))}
            </div>
          </>
        )}

        {!loading && plans.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
            <p className="text-slate-400 font-medium">
              Không tìm thấy lịch trình ACTIVE nào phù hợp.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
