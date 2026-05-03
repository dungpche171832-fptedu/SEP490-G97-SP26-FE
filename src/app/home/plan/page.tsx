"use client";
import React, { useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PlanExtended } from "src/model/plan";
import { planService } from "src/services/planService";
import { getStations, Station } from "src/services/station.service";
import PlanCard from "src/components/plan/plan_card";
import { DatePicker, Select, message } from "antd";
import { CaretDownOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";

const removeAccents = (str: string): string => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
};

export default function ListPlanPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [plans, setPlans] = useState<PlanExtended[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [searchInput, setSearchInput] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 9;

  const departureId = useMemo((): number | undefined => {
    const dep = searchParams?.get("dep");
    return dep ? Number(dep) : undefined;
  }, [searchParams]);

  const destinationId = useMemo((): number | undefined => {
    const des = searchParams?.get("des");
    return des ? Number(des) : undefined;
  }, [searchParams]);

  const dateInput = useMemo((): string | null => {
    return searchParams?.get("date") || null;
  }, [searchParams]);

  useEffect((): void => {
    const loadData = async (): Promise<void> => {
      try {
        const data = await planService.getListPlans();
        let plansData: PlanExtended[] = [];
        if (Array.isArray(data)) {
          plansData = data;
        } else if (data && typeof data === "object" && "plans" in data) {
          plansData = data.plans as PlanExtended[];
        }
        setPlans(plansData);

        const stationRes = await getStations();
        setStations(stationRes.stations || []);

        setLoading(false);
      } catch {
        message.error("Không thể tải dữ liệu");
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const stationOptions = stations.map((s) => {
    const stationData = s as { cityName?: string };
    return {
      value: s.id,
      label: `${s.name}${stationData.cityName ? ` - ${stationData.cityName}` : ""}`,
    };
  });

  // Bộ lọc lịch trình
  const filteredPlans = useMemo((): PlanExtended[] => {
    const today = dayjs().startOf("day");

    return plans.filter((p: PlanExtended) => {
      const isActive = p.status === "ACTIVE";
      const planDate = dayjs(p.startTime);
      const isFromToday = planDate.isValid() && !planDate.isBefore(today, "day");

      const namePlan = (p.routeName || "").toLowerCase();
      const normalizedSearch = removeAccents(namePlan);
      const normalizedQuery = removeAccents(searchInput.toLowerCase());
      const matchesSearch = normalizedSearch.includes(normalizedQuery);

      const sortedStations = p.stations
        ? [...p.stations].sort(
            (a: { order?: number }, b: { order?: number }) => (a.order || 0) - (b.order || 0),
          )
        : [];

      let matchesDeparture = true;
      if (departureId !== undefined) {
        const firstStation = sortedStations[0];
        matchesDeparture = firstStation?.stationId === departureId;
      }

      let matchesDestination = true;
      if (destinationId !== undefined) {
        const lastStation = sortedStations[sortedStations.length - 1];
        matchesDestination = lastStation?.stationId === destinationId;
      }

      const matchesDate = dateInput ? dayjs(p.startTime).format("YYYY-MM-DD") === dateInput : true;

      return (
        isActive &&
        isFromToday &&
        matchesSearch &&
        matchesDeparture &&
        matchesDestination &&
        matchesDate
      );
    });
  }, [searchInput, departureId, destinationId, dateInput, plans]);

  const paginatedPlans = useMemo((): PlanExtended[] => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredPlans.slice(startIndex, startIndex + pageSize);
  }, [filteredPlans, currentPage]);

  const totalPages = Math.ceil(filteredPlans.length / pageSize);

  const handleBooking = (id: number): void => {
    router.push(`/home/ticket?planId=${id}`);
  };

  // Hàm cập nhật query trên URL khi người dùng thay đổi bộ lọc
  const updateFilterParam = (key: string, value: string | number | null | undefined): void => {
    // Lược bỏ từ khóa function
    const currentParams = new URLSearchParams(searchParams?.toString() || "");
    if (value !== undefined && value !== null && value !== "") {
      currentParams.set(key, String(value));
    } else {
      currentParams.delete(key);
    }

    // Reset lại trang về 1 khi lọc mới
    currentParams.set("page", "1");
    router.push(`/home/plan?${currentParams.toString()}`);
    setCurrentPage(1);
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

      <div className="max-w mx-auto px-6 py-10 md:px-20">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-50 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                Tuyến đường
              </label>
              <input
                type="text"
                placeholder="Nhập tên tuyến đường..."
                value={searchInput}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setSearchInput(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-lg text-sm font-bold text-slate-900 placeholder:text-slate-400 outline-none ring-1 ring-slate-200 focus:ring-blue-500/20 transition-all"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                Điểm đi
              </label>
              <Select
                showSearch
                allowClear
                placeholder="Chọn điểm đi"
                size="large"
                className="w-full"
                options={stationOptions}
                value={departureId}
                onChange={(val: number | undefined) => {
                  updateFilterParam("dep", val);
                }}
                optionFilterProp="label"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                Điểm đến
              </label>
              <Select
                showSearch
                allowClear
                placeholder="Chọn điểm đến"
                size="large"
                className="w-full"
                options={stationOptions}
                value={destinationId}
                onChange={(val: number | undefined) => {
                  updateFilterParam("des", val);
                }}
                optionFilterProp="label"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                Ngày đi
              </label>
              <div className="w-full bg-slate-50 rounded-lg ring-1 ring-slate-200 focus-within:ring-blue-500/20 transition-all">
                <DatePicker
                  format="DD/MM/YYYY"
                  variant="borderless"
                  placeholder="Chọn ngày"
                  className="w-full px-2 py-2 text-sm font-bold"
                  style={{ width: "100%" }}
                  value={dateInput ? dayjs(dateInput) : null}
                  disabledDate={(current: Dayjs) => {
                    return current ? current.isBefore(dayjs().startOf("day"), "day") : false;
                  }}
                  onChange={(date: Dayjs | null) => {
                    updateFilterParam("date", date ? date.format("YYYY-MM-DD") : null);
                  }}
                  suffixIcon={<CaretDownOutlined />}
                />
              </div>
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
                Hiển thị <b>{paginatedPlans.length}</b> / <b>{filteredPlans.length}</b> lịch trình
              </p>
              {(searchInput ||
                departureId !== undefined ||
                destinationId !== undefined ||
                dateInput) && (
                <button
                  onClick={() => {
                    setSearchInput("");
                    setCurrentPage(1);
                    router.push("/home/plan");
                  }}
                  className="text-blue-600 text-xs font-bold uppercase hover:underline"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedPlans.map((p) => (
                <PlanCard key={p.id} plan={p} onBook={handleBooking} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-12 flex justify-center items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                  className="px-4 py-2 rounded-lg bg-white border border-slate-300 text-sm font-bold text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 transition-all shadow-sm"
                >
                  Trước
                </button>

                {[...Array(totalPages)].map((_, index) => {
                  const pageNumber = index + 1;
                  const isActive = currentPage === pageNumber;

                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`w-10 h-10 rounded-lg text-sm font-bold transition-all border ${
                        isActive
                          ? "!bg-slate-900 !text-white shadow-md"
                          : "bg-white border-slate-300 text-slate-900 hover:border-slate-900 hover:bg-slate-50"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  className="px-4 py-2 rounded-lg bg-white border border-slate-300 text-sm font-bold text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 transition-all shadow-sm"
                >
                  Sau
                </button>
              </div>
            )}
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

// Cú pháp khai báo đầy đủ updateFilterParam ở bên ngoài để tránh lỗi cú pháp
const updateFilterParam = (key: string, value: string | number | null | undefined): void => {
  // Thực hiện các hàm bên trong nếu cần
};
