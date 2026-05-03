"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Plus,
  Edit2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  FileText,
} from "lucide-react";
import { newsService } from "@/services/newsService";
import { NewsItem } from "@/model/news";
import { useRouter } from "next/navigation";

export default function NewsManagementPage() {
  const router = useRouter();

  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 9;

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const data = await newsService.getListAdmin();
        setNewsList(data);
        setError(null);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Lỗi khi tải dữ liệu!");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return "Không có";
    const date = new Date(dateString);
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} - ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const filteredAndSortedNews = useMemo(() => {
    return [...newsList]
      .sort((a, b) => b.id - a.id)
      .filter((item) => {
        const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase());

        if (statusFilter === "ACTIVE") {
          return matchesSearch && item.isActive;
        } else if (statusFilter === "INACTIVE") {
          return matchesSearch && !item.isActive;
        }

        return matchesSearch;
      });
  }, [newsList, search, statusFilter]);

  const totalItems = filteredAndSortedNews.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedNews = filteredAndSortedNews.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleAddNews = () => {
    router.push("/admin/news/addNews");
  };

  const handleEditNews = (id: number) => {
    router.push(`/admin/news/detail/${id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
            QUẢN LÝ TIN TỨC
          </h1>
          <button
            onClick={handleAddNews}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors duration-200 cursor-pointer"
          >
            <Plus size={18} />
            Thêm tin tức
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="relative flex-1 w-full">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Tìm kiếm bài viết..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="relative w-full md:w-64">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-4 pr-10 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-sm !text-black focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none transition-all cursor-pointer"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
            <ChevronDown
              className="absolute right-3.5 top-1/2 -translate-y-1/2 !text-black pointer-events-none"
              size={16}
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Đang tải dữ liệu...</div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">{error}</div>
        ) : paginatedNews.length === 0 ? (
          <div className="text-center py-12 text-gray-400">Không tìm thấy bài viết nào</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {paginatedNews.map((item) => (
              <div
                key={item.id}
                onClick={() => handleEditNews(item.id)}
                className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200 flex flex-col justify-between cursor-pointer"
              >
                <div className="p-5">
                  <div className="flex justify-between items-center mb-5">
                    <span
                      className={`px-2.5 py-0.5 text-xs font-semibold rounded-full uppercase tracking-wider ${
                        item.isActive
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200/40"
                          : "bg-slate-100 text-slate-600 border border-slate-200/40"
                      }`}
                    >
                      {item.isActive ? "ACTIVE" : "INACTIVE"}
                    </span>
                    <span className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                      Thứ tự: {item.displayOrder}
                    </span>
                  </div>

                  <div className="bg-gray-50 border border-dashed border-gray-200 rounded-lg p-6 mb-5 h-36 flex flex-col items-center justify-center text-gray-400 gap-2 overflow-hidden">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <>
                        <FileText size={36} className="text-gray-300" />
                        <span className="text-xs font-medium text-gray-500">
                          Xem trước hình ảnh
                        </span>
                      </>
                    )}
                  </div>

                  <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 mb-6 h-10 overflow-hidden">
                    {item.title}
                  </h3>

                  <div className="space-y-2 text-xs bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div className="flex items-start gap-2">
                      <span className="text-gray-400 font-medium w-12 shrink-0">Bắt đầu:</span>
                      <span className="font-semibold text-gray-700 break-all">
                        {formatDate(item.startTime)}
                      </span>
                    </div>
                    <hr className="border-gray-200/60" />
                    <div className="flex items-start gap-2">
                      <span className="text-gray-400 font-medium w-12 shrink-0">Kết thúc:</span>
                      <span className="font-semibold text-gray-700 break-all">
                        {formatDate(item.endTime)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="px-5 py-4 border-t border-gray-50 flex justify-end gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditNews(item.id);
                    }}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <span className="text-sm text-gray-500">
              Hiển thị{" "}
              <span className="font-semibold text-gray-700">
                {startIndex + 1} - {Math.min(startIndex + itemsPerPage, totalItems)}
              </span>{" "}
              của <span className="font-semibold text-gray-700">{totalItems}</span> bài viết
            </span>

            <div className="flex items-center gap-1">
              <button
                className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 cursor-pointer"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: totalPages }, (_, index) => {
                const pageNum = index + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-1.5 text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer ${
                      currentPage === pageNum
                        ? "text-white bg-blue-600"
                        : "text-gray-600 bg-white hover:bg-gray-100 border border-gray-200"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 cursor-pointer"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
