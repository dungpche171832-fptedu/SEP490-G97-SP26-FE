"use client";

import { useEffect, useState } from "react";
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

import { getRole } from "@/lib/auth/auth.service";
import { getStations } from "@/services/station.service";
import type { Station } from "@/services/station.service";

export interface City {
  id: number;
  name: string;
}

const CITY_OPTIONS: City[] = [
  { id: 1, name: "Hà Nội (Việt Nam)" },
  { id: 2, name: "Lạng Sơn (Việt Nam)" },
  { id: 3, name: "Nanning (China)" },
];

const ITEMS_PER_PAGE = 6;

const normalizeRole = (role?: string | null): string => {
  return role?.replace("ROLE_", "").toLowerCase() || "";
};

export default function StationManagementPage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchText, setSearchText] = useState("");
  const [selectedCityId, setSelectedCityId] = useState<number | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);

  const currentRole = normalizeRole(getRole());
  const canManageStation = currentRole === "admin" || currentRole === "manager";

  useEffect(() => {
    const fetchStationsData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getStations();
        setStations(response.stations || []);
      } catch (err) {
        console.error(err);
        setError("Không thể tải dữ liệu điểm dừng từ Server");
      } finally {
        setLoading(false);
      }
    };

    void fetchStationsData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, selectedCityId]);

  const filteredStations = stations.filter((station) => {
    const keyword = searchText.toLowerCase().trim();

    const matchSearch =
      station.name.toLowerCase().includes(keyword) || station.code.toLowerCase().includes(keyword);

    const selectedCity = CITY_OPTIONS.find((city) => city.id === selectedCityId);
    const matchCity = selectedCityId === "all" || station.cityName === selectedCity?.name;

    return matchSearch && matchCity;
  });

  const totalPages = Math.ceil(filteredStations.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentStations = filteredStations.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="min-h-full bg-[#F8FAFC] px-6 py-8 font-sans text-slate-900">
      <div className="mx-auto w-full max-w-[1320px]">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tight text-[#1E293B]">
              DANH SÁCH ĐIỂM DỪNG
            </h2>
            <p className="mt-1 text-[14px] text-slate-500">
              Quản lý danh mục các trạm dừng, bến đỗ toàn hệ thống.
            </p>
          </div>

          {canManageStation && (
            <Link href="/admin/station/add">
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg bg-[#1677FF] px-5 py-2.5 text-sm font-bold !text-white shadow-sm shadow-blue-200 transition-all hover:bg-blue-600 [&_*]:!text-white"
              >
                <PlusOutlined />
                Thêm điểm dừng
              </button>
            </Link>
          )}
        </div>

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative w-full md:max-w-[420px]">
            <SearchOutlined className="absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-600" />

            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc mã trạm..."
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm font-bold text-slate-900 shadow-sm transition-all placeholder:font-medium placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="relative w-full md:max-w-[240px]">
            <select
              value={selectedCityId}
              onChange={(event) =>
                setSelectedCityId(event.target.value === "all" ? "all" : Number(event.target.value))
              }
              className="w-full cursor-pointer appearance-none rounded-xl border border-slate-300 bg-white px-4 py-2.5 pr-10 text-sm font-bold text-slate-900 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">Tất cả tỉnh/thành</option>
              {CITY_OPTIONS.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>

            <DownOutlined className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-slate-600" />
          </div>
        </div>

        {loading && (
          <div className="flex flex-col items-center gap-4 p-20 text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
            <p className="font-bold text-slate-600">Đang tải dữ liệu điểm dừng từ hệ thống...</p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-10 text-center font-bold text-red-500">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {filteredStations.length > 0 ? (
              <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3">
                {currentStations.map((station) => (
                  <StationCard
                    key={station.id}
                    station={station}
                    canManageStation={canManageStation}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-20 text-center font-bold text-slate-600 shadow-sm">
                Không tìm thấy điểm dừng nào phù hợp với yêu cầu.
              </div>
            )}

            {filteredStations.length > 0 && (
              <div className="flex flex-col gap-4 border-t border-slate-200 pt-4 md:flex-row md:items-center md:justify-between">
                <p className="text-xs font-bold text-slate-600">
                  Hiển thị {startIndex + 1}-
                  {Math.min(startIndex + ITEMS_PER_PAGE, filteredStations.length)} trong tổng số{" "}
                  {filteredStations.length} điểm dừng
                </p>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 bg-white font-bold text-slate-600 transition-all hover:bg-slate-50 disabled:opacity-50"
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

                  {Array.from({ length: totalPages }, (_, index) => {
                    const page = index + 1;

                    return (
                      <button
                        key={page}
                        type="button"
                        onClick={() => setCurrentPage(page)}
                        className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-black transition-all ${
                          currentPage === page
                            ? "bg-[#1677FF] text-white shadow-md shadow-blue-200"
                            : "border border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    disabled={currentPage === totalPages || totalPages === 0}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 bg-white font-bold text-slate-600 transition-all hover:bg-slate-50 disabled:opacity-50"
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
    </div>
  );
}

function StationCard({
  station,
  canManageStation,
}: {
  station: Station;
  canManageStation: boolean;
}) {
  return (
    <div className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
      <div className="flex items-center justify-between gap-4 p-6 pb-2">
        <span className="rounded-[6px] bg-blue-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-blue-600">
          {station.cityName || "N/A"}
        </span>

        <span className="shrink-0 font-mono text-[12px] font-bold tracking-wider text-slate-500">
          {station.code}
        </span>
      </div>

      <div className="flex flex-1 flex-col px-6">
        <h3 className="mb-4 mt-2 text-xl font-black leading-snug tracking-tight text-slate-800">
          {station.name}
        </h3>

        <div className="mb-4 space-y-4">
          <div className="flex items-start gap-3">
            <EnvironmentOutlined className="mt-[2px] shrink-0 text-[15px] text-slate-400" />

            <span className="line-clamp-2 text-[13px] font-semibold leading-relaxed text-slate-600">
              {station.address || "Chưa cập nhật địa chỉ"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <AimOutlined className="shrink-0 text-[15px] text-slate-400" />

            <span className="rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1.5 font-mono text-[12px] font-bold tracking-wide text-slate-500">
              {station.latitude}° N, {station.longitude}° E
            </span>
          </div>
        </div>
      </div>

      <div
        className={`mt-auto flex items-center border-t border-slate-100 px-5 pb-5 pt-4 ${
          canManageStation ? "justify-between" : "justify-center"
        }`}
      >
        <Link
          href={`/admin/station/view?id=${station.id}`}
          className="flex items-center gap-2 rounded-full p-2 text-xs font-black text-slate-400 transition-colors hover:bg-blue-50 hover:text-[#1677FF]"
        >
          <EyeOutlined className="text-[16px]" />
          CHI TIẾT
        </Link>

        {canManageStation && (
          <>
            <Link
              href={`/admin/station/edit?id=${station.id}`}
              className="flex items-center gap-2 rounded-full p-2 text-xs font-black text-slate-400 transition-colors hover:bg-blue-50 hover:text-[#1677FF]"
            >
              <EditOutlined className="text-[16px]" />
              SỬA
            </Link>

            <button
              type="button"
              className="flex items-center gap-2 rounded-full p-2 text-xs font-black text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
            >
              <DeleteOutlined className="text-[16px]" />
              XÓA
            </button>
          </>
        )}
      </div>
    </div>
  );
}
