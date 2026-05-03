"use client";

import { useEffect, useMemo, useState } from "react";
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

import type { Car } from "@/model/car";
import { getCars, getBranchesForSelect, type Branch } from "@/services/carService";
import { getAccountInfo } from "@/services/accountService";
import { getRole } from "@/lib/auth/auth.service";

const normalizeRole = (role?: string | null): string => {
  return role?.replace("ROLE_", "").toLowerCase() || "";
};

const isManagerRole = (role: string): boolean => {
  return role === "manager" || role === "manager_branch";
};

export default function CarManagementPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentRole, setCurrentRole] = useState("");
  const [currentBranchId, setCurrentBranchId] = useState<number | null>(null);

  const [searchText, setSearchText] = useState("");
  const [selectedBranchId, setSelectedBranchId] = useState<number | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 6;

  const isAdmin = currentRole === "admin";
  const isManager = isManagerRole(currentRole);
  const canManageCar = isAdmin || isManager;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const role = normalizeRole(getRole());
        setCurrentRole(role);

        const [carsData, branchesData] = await Promise.all([getCars(), getBranchesForSelect()]);

        setCars(carsData.cars || []);
        setBranches(branchesData || []);

        if (isManagerRole(role)) {
          try {
            const accountInfo = await getAccountInfo();
            const branchId = Number(accountInfo.branchId);

            if (!Number.isNaN(branchId)) {
              setCurrentBranchId(branchId);
              setSelectedBranchId(branchId);
            }
          } catch (accountError) {
            console.error("Không lấy được branchId của manager:", accountError);
            setCurrentBranchId(null);
          }
        }
      } catch (err: unknown) {
        console.error(err);
        setError("Không thể tải dữ liệu xe");
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, []);

  const currentBranchName = useMemo(() => {
    if (currentBranchId === null) {
      return "";
    }

    return branches.find((branch) => branch.id === currentBranchId)?.name || "";
  }, [branches, currentBranchId]);

  const filteredCars = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    return cars.filter((car) => {
      const matchSearch = car.licensePlate.toLowerCase().includes(keyword);

      const matchBranch = isManager
        ? currentBranchId !== null && car.branch?.id === currentBranchId
        : selectedBranchId === "all" || car.branch?.id === selectedBranchId;

      return matchSearch && matchBranch;
    });
  }, [cars, searchText, isManager, currentBranchId, selectedBranchId]);

  const totalPages = Math.ceil(filteredCars.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentCars = filteredCars.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, selectedBranchId, currentBranchId]);

  return (
    <main className="min-h-screen bg-[#F8FAFC] px-6 py-6 font-sans text-slate-900">
      <div className="w-full">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tight text-[#1E293B]">
              DANH SÁCH XE {isManager && currentBranchName ? `- ${currentBranchName}` : ""}
            </h2>

            <p className="mt-1 text-[14px] text-slate-500">
              {isAdmin
                ? "Giám sát đội xe toàn hệ thống."
                : "Quản lý đội xe và trạng thái vận hành chi nhánh."}
            </p>
          </div>

          {canManageCar && (
            <Link href="/admin/car/add">
              <button className="flex items-center gap-2 rounded-lg bg-[#1677FF] px-5 py-2.5 text-sm font-bold !text-white shadow-sm shadow-blue-200 transition-all hover:bg-blue-600 [&_*]:!text-white">
                <PlusOutlined />
                Thêm xe
              </button>
            </Link>
          )}
        </div>

        <div className="mb-8 flex items-center gap-4">
          <div className="relative w-[400px]">
            <SearchOutlined className="absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-600" />

            <input
              type="text"
              placeholder="Tìm kiếm theo biển số xe..."
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm font-bold text-slate-900 shadow-sm transition-all placeholder:font-medium placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {isAdmin && (
            <div className="relative min-w-[220px]">
              <select
                value={selectedBranchId}
                onChange={(event) =>
                  setSelectedBranchId(
                    event.target.value === "all" ? "all" : Number(event.target.value),
                  )
                }
                className="w-full cursor-pointer appearance-none rounded-xl border border-slate-300 bg-white px-4 py-2.5 pr-10 text-sm font-bold text-slate-900 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="all">Tất cả chi nhánh</option>

                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>

              <DownOutlined className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-slate-600" />
            </div>
          )}
        </div>

        {loading && (
          <div className="flex flex-col items-center gap-4 p-20 text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
            <p className="font-bold text-slate-600">Đang tải dữ liệu xe...</p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-10 text-center font-bold text-red-500">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {filteredCars.length > 0 ? (
              <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {currentCars.map((car) => (
                  <CarCard key={car.id} car={car} canManageCar={canManageCar} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-20 text-center font-bold text-slate-600 shadow-sm">
                Không tìm thấy xe nào phù hợp với yêu cầu.
              </div>
            )}

            {filteredCars.length > 0 && (
              <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                <p className="text-xs font-bold text-slate-600">
                  Hiển thị {startIndex + 1}-
                  {Math.min(startIndex + itemsPerPage, filteredCars.length)} trong tổng số{" "}
                  {filteredCars.length} xe
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
    </main>
  );
}

function CarCard({ car, canManageCar }: { car: Car; canManageCar: boolean }) {
  const formatPlate = (plate: string) => {
    if (!plate) {
      return "—";
    }

    if (plate.includes("-")) {
      const parts = plate.split("-");
      return `${parts[0]} - ${parts[1]}`;
    }

    return plate;
  };

  const getCoverImage = (type?: string): string => {
    if (!type) {
      return "/images/bus3.png";
    }

    const carType = type.toUpperCase();

    if (carType.includes("9")) {
      return "/images/Car_9.jpg";
    }

    if (carType.includes("16")) {
      return "/images/Car_16.jpg";
    }

    if (carType.includes("45")) {
      return "/images/Car_45.jpg";
    }

    return "/images/bus3.png";
  };

  const coverImage = getCoverImage(car.carType);

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
      <div className="relative h-[220px] w-full overflow-hidden bg-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={coverImage}
          alt={car.licensePlate}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        <div className="absolute left-4 top-4 rounded-[6px] bg-[#1677FF] px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-sm">
          {car.carType || "N/A"}
        </div>

        <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-[10px] font-black uppercase tracking-wider shadow-sm backdrop-blur-sm">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              car.status === "RUNNING" ? "bg-[#059669]" : "bg-[#DC2626]"
            }`}
          />

          <span className={car.status === "RUNNING" ? "text-[#059669]" : "text-[#DC2626]"}>
            {car.status === "RUNNING" ? "RUNNING" : "STOP"}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-black tracking-tight text-slate-800">
            {formatPlate(car.licensePlate)}
          </h3>

          <span className="text-[12px] font-bold uppercase tracking-widest text-slate-500">
            SX: {car.manufactureYear || "N/A"}
          </span>
        </div>

        <div className="mb-6 space-y-3.5">
          <div className="flex items-center justify-between text-[13px]">
            <div className="flex items-center gap-2 font-bold text-slate-500">
              <UserOutlined className="text-[14px]" />
              Số ghế:
            </div>

            <span className="font-black text-slate-800">{car.totalSeat || 0} Chỗ</span>
          </div>

          <div className="flex items-center justify-between text-[13px]">
            <div className="flex items-center gap-2 font-bold text-slate-500">
              <EnvironmentOutlined className="text-[14px]" />
              Chi nhánh:
            </div>

            <span className="max-w-[150px] truncate text-right font-black text-slate-800">
              {car.branch?.name?.replace("Chi nhánh ", "") || "Chưa cập nhật"}
            </span>
          </div>
        </div>

        <div
          className={`mt-auto flex items-center border-t border-slate-100 px-4 pt-5 ${
            canManageCar ? "justify-between" : "justify-center"
          }`}
        >
          <Link
            href={`/admin/car/view?id=${car.id}`}
            className="rounded-full p-2 text-[#1677FF] transition-colors hover:bg-blue-50 hover:text-[#1677FF]"
          >
            <EyeOutlined className="text-[18px]" />
          </Link>

          {canManageCar && (
            <>
              <Link
                href={`/admin/car/edit?id=${car.id}`}
                className="rounded-full p-2 text-[#1677FF] transition-colors hover:bg-blue-50 hover:text-[#1677FF]"
              >
                <EditOutlined className="text-[18px]" />
              </Link>

              <button
                type="button"
                className="rounded-full p-2 text-[#1677FF] transition-colors hover:bg-blue-50 hover:text-[#1677FF]"
              >
                <DeleteOutlined className="text-[18px]" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
