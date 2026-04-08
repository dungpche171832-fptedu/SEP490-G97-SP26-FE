"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  PlusOutlined,
  SearchOutlined,
  DownOutlined,
  BarcodeOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  UserOutlined,
  EditOutlined,
  EyeOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

import Header from "@/components/admin/Header";
import Sidebar from "@/components/admin/Sidebar";
import { getAllBranches, type Branch } from "@/services/branch.service";

export default function BranchPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");

  // Pagination FE
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setLoading(true);
        const data = await getAllBranches();
        setBranches(data || []);
      } catch (err) {
        console.error(err);
        setError("Không thể tải danh sách chi nhánh.");
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, []);

  // Lọc danh sách chi nhánh theo từ khóa tìm kiếm (Tên chi nhánh)
  const filteredBranches = branches.filter((b) =>
    b.name.toLowerCase().includes(searchText.toLowerCase()),
  );

  // Tính toán phân trang dựa trên danh sách đã lọc
  const totalPages = Math.ceil(filteredBranches.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentBranches = filteredBranches.slice(startIndex, startIndex + itemsPerPage);

  // Reset về trang 1 khi người dùng gõ tìm kiếm
  useEffect(() => {
    setCurrentPage(1);
  }, [searchText]);

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans">
      <Sidebar />

      <main className="flex-1 flex flex-col ml-64 overflow-hidden pt-16">
        <Header />

        {/* Content */}
        <div className="p-8 h-full overflow-y-auto">
          {/* Header Section */}
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-black text-[#1E293B] uppercase tracking-tight">
                DANH SÁCH CHI NHÁNH
              </h2>
              <p className="text-slate-500 mt-1 text-sm">
                Quản lý mạng lưới văn phòng và điểm đón khách trên toàn quốc
              </p>
            </div>

            {/* Nút Thêm Chi nhánh */}
            <Link href="/admin/branch/add">
              <button className="bg-[#1677FF] hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-all shadow-sm text-sm">
                <PlusOutlined /> Thêm chi nhánh
              </button>
            </Link>
          </div>

          {/* Filter & Search Bar */}
          <div className="flex items-center gap-0 bg-white rounded-lg border border-slate-200 w-max mb-8 shadow-sm">
            <button className="flex items-center gap-2 px-5 py-2.5 border-r border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors rounded-l-lg">
              Tên chi nhánh <DownOutlined className="text-[10px] text-slate-400 ml-1" />
            </button>
            <div className="relative w-80">
              <input
                type="text"
                placeholder="Tìm kiếm theo Tên chi nhánh..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full py-2.5 pl-4 pr-10 text-sm outline-none rounded-r-lg bg-transparent"
              />
              <SearchOutlined className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          {/* Data Section */}
          {loading && (
            <div className="p-10 text-center text-slate-500 bg-white rounded-xl border border-slate-200 shadow-sm">
              Đang tải dữ liệu...
            </div>
          )}

          {error && (
            <div className="p-10 text-center text-red-500 font-medium bg-white rounded-xl border border-slate-200 shadow-sm">
              {error}
            </div>
          )}

          {!loading && !error && (
            <>
              {/* Grid Cards Container */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                {currentBranches.length > 0 ? (
                  currentBranches.map((branch) => <BranchCard key={branch.id} branch={branch} />)
                ) : (
                  <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
                    Không tìm thấy chi nhánh nào phù hợp với từ khóa &quot;{searchText}&quot;.
                  </div>
                )}
              </div>

              {/* Pagination */}
              {filteredBranches.length > 0 && (
                <div className="px-6 py-4 bg-white flex items-center justify-between border border-slate-200 rounded-xl shadow-sm">
                  <p className="text-sm text-slate-500 font-medium">
                    Hiển thị {startIndex + 1}-
                    {Math.min(startIndex + itemsPerPage, filteredBranches.length)} trên tổng số{" "}
                    {filteredBranches.length} chi nhánh
                  </p>

                  <div className="flex items-center gap-1">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((prev) => prev - 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
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
                          className={`w-8 h-8 flex items-center justify-center rounded font-bold text-sm transition-all ${
                            currentPage === page
                              ? "bg-[#1677FF] text-white shadow-sm"
                              : "hover:bg-slate-100 text-slate-600"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}

                    <button
                      disabled={currentPage === totalPages || totalPages === 0}
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
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
    </div>
  );
}

function BranchCard({ branch }: { branch: Branch }) {
  return (
    <div className="bg-white rounded-[20px] p-6 border border-slate-200 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col h-full group">
      <div className="flex justify-between items-start mb-6">
        <h3 className="text-[17px] font-black text-slate-800 leading-tight pr-4">{branch.name}</h3>
        <span
          className={`shrink-0 text-[10px] font-extrabold px-3 py-1.5 rounded-[10px] uppercase tracking-wider text-center leading-none flex items-center justify-center ${
            branch.isActive ? "bg-[#D1FAE5] text-[#059669]" : "bg-[#F1F5F9] text-[#64748B]"
          }`}
        >
          {branch.isActive ? "HOẠT ĐỘNG" : "TẠM NGHỈ"}
        </span>
      </div>

      <div className="flex-1 flex flex-col gap-3.5 text-[13px] text-slate-600">
        <div className="flex items-start gap-3">
          <BarcodeOutlined className="text-slate-400 text-[15px] mt-[3px]" />
          <span className="font-semibold text-slate-700 tracking-wide">{branch.code}</span>
        </div>

        <div className="flex items-start gap-3">
          <EnvironmentOutlined className="text-slate-400 text-[15px] mt-[3px] shrink-0" />
          <span className="leading-snug line-clamp-2" title={branch.address}>
            {branch.address}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <PhoneOutlined className="text-slate-400 text-[15px]" />
          <span>{branch.phone}</span>
        </div>

        <div className="flex items-center gap-3">
          <MailOutlined className="text-slate-400 text-[15px]" />
          <span className="truncate" title={branch.email}>
            {branch.email}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <UserOutlined className="text-slate-400 text-[15px]" />
          <span className="font-medium text-slate-700 truncate">
            {branch.managerAccount?.fullName || "Chưa phân công"}
          </span>
        </div>
      </div>

      <div className="mt-6 pt-3 border-t border-slate-100 grid grid-cols-3 divide-x divide-slate-100">
        <button className="flex justify-center items-center gap-2 py-2 text-xs font-bold text-[#1677FF] hover:bg-blue-50 transition-colors rounded-bl-xl">
          <EditOutlined className="text-sm" /> Sửa
        </button>

        <Link
          href={`/admin/branch/${branch.id}`}
          className="flex justify-center items-center gap-2 py-2 text-xs font-bold text-slate-700 hover:text-[#1677FF] hover:bg-slate-50 transition-colors"
        >
          <EyeOutlined className="text-sm" /> Chi tiết
        </Link>

        <button className="flex justify-center items-center gap-2 py-2 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors rounded-br-xl">
          <DeleteOutlined className="text-sm" /> Xóa
        </button>
      </div>
    </div>
  );
}
