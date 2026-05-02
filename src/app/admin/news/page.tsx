import React from "react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  FileText,
} from "lucide-react";

export default function NewsManagement() {
  const newsItems = [
    {
      id: 1,
      status: "ACTIVE",
      featured: true,
      order: 1,
      title: "Mở rộng trung tâm kho vận miền Nam đáp ứng nhu cầu cuối năm",
      startDate: "15/10/2023 - 08:00",
      endDate: "Không có",
    },
    {
      id: 2,
      status: "ACTIVE",
      featured: false,
      order: 2,
      title: "Cập nhật chính sách thông quan hàng hóa quý IV/2023",
      startDate: "01/10/2023 - 00:00",
      endDate: "31/12/2023 - 23:59",
    },
    {
      id: 3,
      status: "INACTIVE",
      featured: false,
      order: 3,
      title: "Thông báo lịch nghỉ lễ Quốc Khánh 2/9 năm 2023",
      startDate: "25/08/2023 - 08:00",
      endDate: "05/09/2023 - 23:59",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
            QUẢN LÝ TIN TỨC
          </h1>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors duration-200">
            <Plus size={18} />
            Thêm tin tức
          </button>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="relative flex-1 w-full">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Tìm kiếm bài viết..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="relative w-full md:w-64">
            <select className="w-full pl-4 pr-10 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none transition-all cursor-pointer">
              <option>Tất cả trạng thái</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
            <ChevronDown
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              size={16}
            />
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {newsItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between"
            >
              <div className="p-5">
                {/* Card Top Information */}
                <div className="flex justify-between items-center mb-5">
                  <span
                    className={`px-2.5 py-0.5 text-xs font-semibold rounded-full uppercase tracking-wider ${
                      item.status === "ACTIVE"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200/40"
                        : "bg-slate-100 text-slate-600 border border-slate-200/40"
                    }`}
                  >
                    {item.status}
                  </span>

                  <div className="flex items-center gap-2">
                    {item.featured && (
                      <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                        • TIN NỔI BẬT
                      </span>
                    )}
                    <span className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                      Thứ tự: {item.order}
                    </span>
                  </div>
                </div>

                {/* Card Image Placeholder */}
                <div className="bg-gray-50 border border-dashed border-gray-200 rounded-lg p-6 mb-5 h-36 flex flex-col items-center justify-center text-gray-400 gap-2">
                  <FileText size={36} className="text-gray-300" />
                  <span className="text-xs font-medium text-gray-500">Xem trước hình ảnh</span>
                </div>

                {/* Card Title */}
                <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 mb-6 h-10 overflow-hidden">
                  {item.title}
                </h3>

                {/* Date Details */}
                <div className="space-y-2 text-xs bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400 font-medium w-12 shrink-0">Bắt đầu:</span>
                    <span className="font-semibold text-gray-700 break-all">{item.startDate}</span>
                  </div>
                  <hr className="border-gray-200/60" />
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400 font-medium w-12 shrink-0">Kết thúc:</span>
                    <span className="font-semibold text-gray-700 break-all">{item.endDate}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="px-5 py-4 border-t border-gray-50 flex justify-end gap-3">
                <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <Edit2 size={16} />
                </button>
                <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Section */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <span className="text-sm text-gray-500">
            Hiển thị <span className="font-semibold text-gray-700">1 - 9</span> của{" "}
            <span className="font-semibold text-gray-700">24</span> bài viết
          </span>

          <div className="flex items-center gap-1">
            <button
              className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30"
              disabled
            >
              <ChevronLeft size={16} />
            </button>
            <button className="px-3 py-1.5 text-sm font-semibold text-white bg-blue-600 rounded-lg shadow-sm">
              1
            </button>
            <button className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              2
            </button>
            <button className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              3
            </button>
            <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
