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

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setLoading(true);
        const data = await getAllBranches();
        setBranches(data || []);
      } catch (err) {
        console.error(err); // Sửa lỗi biến err không được dùng
        setError("Không thể tải danh sách chi nhánh.");
      } finally {
        setLoading(false);
      }
    };
    fetchBranches();
  }, []);

  const filteredBranches = branches.filter((b) =>
    b.name.toLowerCase().includes(searchText.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredBranches.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentBranches = filteredBranches.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText]);

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900">
      <Sidebar />

      <main className="flex-1 flex flex-col ml-64 overflow-hidden pt-16">
        <Header />

        <div className="p-8 h-full overflow-y-auto">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-black text-[#1E293B] uppercase tracking-tight">
                DANH SÁCH CHI NHÁNH
              </h2>
              <p className="text-slate-500 mt-1 text-[14px] font-medium">
                Quản lý mạng lưới văn phòng và điểm đón khách trên toàn quốc
              </p>
            </div>

            <Link href="/admin/branch/add">
              <button className="bg-[#1677FF] hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all shadow-sm shadow-blue-200 text-sm">
                <PlusOutlined /> Thêm chi nhánh
              </button>
            </Link>
          </div>

          {/* FILTER BAR */}
          <div className="flex items-center gap-0 bg-white rounded-xl border border-slate-300 w-max mb-8 shadow-sm overflow-hidden">
            <button className="flex items-center gap-2 px-5 py-2.5 border-r border-slate-200 text-sm font-bold text-slate-900 hover:bg-slate-50 transition-colors">
              Tên chi nhánh <DownOutlined className="text-[10px] text-slate-400" />
            </button>
            <div className="relative w-[320px]">
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full py-2.5 pl-4 pr-10 text-sm outline-none bg-transparent text-slate-900 font-bold placeholder:text-slate-400 placeholder:font-medium"
              />
              <SearchOutlined className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold" />
            </div>
          </div>

          {!loading && !error && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                {currentBranches.length > 0 ? (
                  currentBranches.map((branch) => <BranchCard key={branch.id} branch={branch} />)
                ) : (
                  <div className="col-span-full py-20 text-center text-slate-500 font-bold bg-white rounded-2xl border border-slate-200 shadow-sm">
                    {/* ✅ Sửa lỗi HTML Unescaped Entities ở dòng dưới */}
                    Không tìm thấy chi nhánh nào phù hợp với &quot;{searchText}&quot;.
                  </div>
                )}
              </div>

              {/* Pagination */}
              {filteredBranches.length > 0 && (
                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <p className="text-xs text-slate-600 font-bold">
                    Hiển thị {startIndex + 1}-
                    {Math.min(startIndex + itemsPerPage, filteredBranches.length)} trong tổng số{" "}
                    {filteredBranches.length} chi nhánh
                  </p>

                  <div className="flex items-center gap-1.5">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((prev) => prev - 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-300 text-slate-600 font-bold hover:bg-slate-50 disabled:opacity-50 transition-all"
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
                    {[...Array(totalPages)].map((_, index) => {
                      const page = index + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg font-black text-xs transition-all ${
                            currentPage === page
                              ? "bg-[#1677FF] text-white shadow-md shadow-blue-200"
                              : "bg-white border border-slate-300 text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    <button
                      disabled={currentPage === totalPages || totalPages === 0}
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-300 text-slate-600 font-bold hover:bg-slate-50 disabled:opacity-50 transition-all"
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
    </div>
  );
}

function BranchCard({ branch }: { branch: Branch }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group">
      <div className="flex justify-between items-start mb-6">
        <h3 className="text-[18px] font-black text-slate-900 leading-tight pr-4 tracking-tight">
          {branch.name}
        </h3>
        <span
          className={`shrink-0 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1.5 ${
            branch.isActive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${branch.isActive ? "bg-emerald-600" : "bg-red-600"}`}
          ></span>
          {branch.isActive ? "HOẠT ĐỘNG" : "TẠM NGHỈ"}
        </span>
      </div>

      <div className="flex-1 flex flex-col gap-4 text-[13px]">
        <div className="flex items-center gap-3">
          <BarcodeOutlined className="text-[#1677FF] text-[15px]" />
          <span className="font-bold text-slate-700 uppercase tracking-widest">{branch.code}</span>
        </div>

        <div className="flex items-start gap-3">
          <EnvironmentOutlined className="text-[#1677FF] text-[15px] mt-[2px] shrink-0" />
          <span className="text-slate-600 font-semibold leading-snug line-clamp-2">
            {branch.address}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <PhoneOutlined className="text-[#1677FF] text-[15px]" />
          <span className="text-slate-600 font-bold">{branch.phone}</span>
        </div>
      </div>

      <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between px-2">
        <Link
          href={`/admin/branch/edit?id=${branch.id}`}
          className="flex items-center gap-2 p-2 text-xs font-black text-slate-400 hover:text-[#1677FF] hover:bg-blue-50 transition-colors rounded-full"
        >
          <EditOutlined className="text-[16px]" /> SỬA
        </Link>

        <Link
          href={`/admin/branch/view?id=${branch.id}`}
          className="flex items-center gap-2 p-2 text-xs font-black text-slate-400 hover:text-[#1677FF] hover:bg-blue-50 transition-colors rounded-full"
        >
          <EyeOutlined className="text-[16px]" /> CHI TIẾT
        </Link>

        <button className="flex items-center gap-2 p-2 text-xs font-black text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors rounded-full">
          <DeleteOutlined className="text-[16px]" /> XÓA
        </button>
      </div>
    </div>
  );
}
