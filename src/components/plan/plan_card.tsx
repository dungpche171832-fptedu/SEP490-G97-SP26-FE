"use client";

import React from "react";
import Image from "next/image";
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
  const namePlan = plan.routeName;
  const statusLower = plan.status.toLowerCase();
  const isActive = statusLower === "active" || statusLower === "hoạt động";
  const isPending = statusLower === "pending" || statusLower === "tạm dừng";

  return (
    <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:shadow-lg">
      <div className="relative h-44 overflow-hidden">
        <Image
          src="/images/bus3.png"
          alt={`thumbnail ${plan.id}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      <div className="p-4">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase text-blue-500">
            {plan.code || `LT-${plan.id}`}
          </span>

          <span
            className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
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

        <div className="mb-3 flex items-center gap-2">
          <h3 className="text-sm font-bold text-slate-700">{namePlan}</h3>
        </div>

        <div className="mb-4 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1">
            <span>
              {start.time} - {start.day}
            </span>
          </div>
        </div>

        <button
          type="button"
          disabled={!isActive}
          onClick={() => onBook && onBook(plan.id)}
          className={`flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-[10px] font-bold transition-all ${
            isActive
              ? "bg-blue-600 !text-white shadow-sm hover:bg-blue-700 active:scale-95 [&_*]:!text-white"
              : "cursor-not-allowed bg-slate-200 text-slate-400"
          }`}
        >
          ĐẶT VÉ
          <svg
            className="h-3 w-3"
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
