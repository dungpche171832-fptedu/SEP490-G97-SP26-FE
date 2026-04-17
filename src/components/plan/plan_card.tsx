import React from "react";
import { Plan } from "src/model/plan";

interface PlanCardProps {
  plan: Plan;
}

const PlanCard: React.FC<PlanCardProps> = ({ plan }) => {
  // Hàm format thời gian nhanh
  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const time = date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const day = date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    return { time, day };
  };

  const start = formatDateTime(plan.startTime);

  // Xác định điểm đi và điểm đến từ danh sách stations
  const sortedStations = [...plan.stations].sort((a, b) => a.stationOrder - b.stationOrder);
  const from = sortedStations[0]?.stationName || "Chưa xác định";
  const to = sortedStations[sortedStations.length - 1]?.stationName || "Chưa xác định";

  // Logic trạng thái dựa trên "status" từ API
  const isActive = plan.status.toLowerCase() === "active" || plan.status === "HOẠT ĐỘNG";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden group hover:shadow-md transition-all">
      {/* Thumbnail Area */}
      <div className="relative h-44 bg-slate-200">
        {/* Nếu API có trường Image hãy thay vào đây, tạm thời dùng placeholder hoặc ảnh mặc định */}
        <img
          src={`https://source.unsplash.com/featured/?bus,vietnam&sig=${plan.id}`}
          alt={plan.carLicensePlate}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div
          className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-bold tracking-tight ${
            isActive ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
          }`}
        >
          {plan.status.toUpperCase()}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-5">
        <div className="flex justify-between items-start">
          <span className="text-blue-600 text-[11px] font-bold tracking-widest">{plan.code}</span>
          <span className="text-[10px] text-slate-400 font-medium">BS: {plan.carLicensePlate}</span>
        </div>

        <div className="flex items-center gap-2.5 mt-2">
          <div className="p-1.5 bg-blue-50 rounded-lg">
            <svg
              className="w-5 h-5 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.806H8.002c-.446 0-.852.22-1.096.592l-2.77 4.235m11.955 4.408A12.026 12.026 0 018.625 10.5h10.375"
              />
            </svg>
          </div>
          <h3 className="font-bold text-slate-800 text-base line-clamp-1">
            {from} <span className="text-slate-300 font-normal mx-1">→</span> {to}
          </h3>
        </div>

        <p className="text-[12px] text-slate-500 mt-1 italic">Tài xế: {plan.driverName}</p>

        <div className="flex justify-between mt-5 text-slate-500 text-[13px]">
          <div className="flex items-center gap-1.5 text-slate-400">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>
              {start.time} - {start.day}
            </span>
          </div>
          <span className="font-semibold text-slate-700">Giá vé: ---</span>
        </div>

        {/* Action Button */}
        <button
          disabled={!isActive}
          className={`w-full mt-6 py-3 rounded-xl font-bold text-xs tracking-widest flex items-center justify-center gap-2 transition-all
            ${
              isActive
                ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200 active:scale-[0.97]"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
        >
          CHI TIẾT LỊCH TRÌNH
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="2.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default PlanCard;
