"use client";
import React from "react";
import Image from "next/image"; // Import component Image
import { Plan } from "src/model/plan";

interface PlanCardProps {
  plan: Plan;
  onBook?: (id: number) => void;
}

const PlanCard: React.FC<PlanCardProps> = ({ plan, onBook }) => {
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
      {/* Ảnh Thumbnail sử dụng Next.js Image */}
      <div className="relative h-44 overflow-hidden">
        <Image
          src={`https://api.dicebear.com/7.x/initials/svg?seed=${plan.id}`}
          alt="thumbnail"
          fill // Sử dụng fill để lấp đầy container relative phía trên
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
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
          <h3 className="font-bold text-slate-700 text-sm">
            {from} → {to}
          </h3>
        </div>

        <div className="flex justify-between items-center text-slate-400 text-[11px] mb-4">
          <div className="flex items-center gap-1">
            <span>
              {start.time} - {start.day}
            </span>
          </div>
          <span className="font-bold text-slate-500">3h</span>
        </div>

        <button
          disabled={!isActive}
          onClick={() => onBook && onBook(plan.id)}
          className={`w-full py-2.5 rounded-lg font-bold text-[10px] flex items-center justify-center gap-2 transition-all ${
            isActive
              ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm active:scale-95"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
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
