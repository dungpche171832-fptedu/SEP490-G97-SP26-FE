import React from "react";
import { Plan } from "src/model/plan";

interface PlanCardProps {
  plan: Plan;
}

const PlanCard: React.FC<PlanCardProps> = ({ plan }) => {
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
  const sortedStations = [...plan.stations].sort((a, b) => a.stationOrder - b.stationOrder);
  const from = sortedStations[0]?.stationName || "Hà Nội";
  const to = sortedStations[sortedStations.length - 1]?.stationName || "Hải Phòng";

  const statusLower = plan.status.toLowerCase();
  const isActive = statusLower === "active" || statusLower === "hoạt động";
  const isPending = statusLower === "pending" || statusLower === "tạm dừng";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition-all duration-300">
      {/* Ảnh Thumbnail */}
      <div className="relative h-44 overflow-hidden">
        <img
          src={`https://api.dicebear.com/7.x/initials/svg?seed=${plan.id}`} // Thay bằng URL ảnh thật
          className="w-full h-full object-cover"
          alt="thumbnail"
        />
        <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
          </svg>
          3
        </div>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-blue-500 text-[10px] font-bold uppercase">
            {plan.code || `LT-${plan.id}`}
          </span>
          <span
            className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
              isActive
                ? "bg-green-100 text-green-600"
                : isPending
                  ? "bg-yellow-100 text-yellow-600"
                  : "bg-red-100 text-red-600"
            }`}
          >
            {plan.status.toUpperCase()}
          </span>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
            <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H11.05a2.5 2.5 0 014.9 0H17a1 1 0 001-1V5a1 1 0 00-1-1H3z" />
          </svg>
          <h3 className="font-bold text-slate-700 text-sm">
            {from} → {to}
          </h3>
        </div>

        <div className="flex justify-between items-center text-slate-400 text-[11px] mb-4">
          <div className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>
              {start.time} - {start.day}
            </span>
          </div>
          <span className="font-bold text-slate-500">3h</span>
        </div>

        {/* Thanh Progress Bar màu xanh đặc trưng */}
        <div className="w-full bg-slate-100 h-1.5 rounded-full mb-6 overflow-hidden">
          <div
            className={`h-full rounded-full ${isActive ? "bg-green-500" : isPending ? "bg-red-500" : "bg-slate-300"}`}
            style={{ width: isActive ? "45%" : isPending ? "15%" : "0%" }}
          ></div>
        </div>

        <button
          disabled={!isActive}
          className={`w-full py-2 rounded-lg font-bold text-[10px] flex items-center justify-center gap-2 transition-all ${
            isActive
              ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
              : "bg-slate-200 text-slate-400"
          }`}
        >
          ĐẶT VÉ
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="3"
          >
            <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default PlanCard;
