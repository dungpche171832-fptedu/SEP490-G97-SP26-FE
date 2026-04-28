"use client";

import React, { useState, useEffect } from "react";
import { Loader2, X, Calendar, MapPin } from "lucide-react";
import { TicketInfo, changePlan } from "@/services/ticket.service";
import { planService } from "@/services/planService";
import { message } from "antd";

interface PlanSeatResponse {
  seatId: number;
  seatNumber: string;
  status: string;
}

interface PlanDetailResponse {
  id: number;
  code: string;
  seats?: PlanSeatResponse[];
  listSeats?: PlanSeatResponse[];
}

interface ExchangeTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: TicketInfo;
  availablePlans: PlanSummary[];
  onSuccess?: () => void;
}

interface PlanSummary {
  id: number;
  code: string;
  startTime?: string;
  [key: string]: unknown;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

const BusSeatIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M7 18V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v12" />
    <path d="M5 18v-2a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2" />
    <path d="M19 18H5a2 2 0 0 0-2 2v1h18v-1a2 2 0 0 0-2-2z" />
  </svg>
);

const DriverIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a10 10 0 0 0-10 10" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const ExchangeTicketModal = ({
  isOpen,
  onClose,
  ticket,
  availablePlans,
  onSuccess,
}: ExchangeTicketModalProps) => {
  const [selectedPlan, setSelectedPlan] = useState<PlanSummary | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<PlanSeatResponse[]>([]);
  const [planDetail, setPlanDetail] = useState<PlanDetailResponse | null>(null);
  const [loadingPlanDetail, setLoadingPlanDetail] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const requiredSeats = ticket.totalSeats || 1;

  useEffect(() => {
    if (!isOpen) {
      setSelectedPlan(null);
      setPlanDetail(null);
      setSelectedSeats([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectPlan = async (planId: string) => {
    if (!planId) {
      setSelectedPlan(null);
      setPlanDetail(null);
      setSelectedSeats([]);
      return;
    }

    const basicPlan = availablePlans.find((p) => p.id === Number(planId)) || null;
    setSelectedPlan(basicPlan);
    setSelectedSeats([]);

    try {
      setLoadingPlanDetail(true);
      const res = await planService.getPlanByIdForTicket(Number(planId));
      setPlanDetail(res as PlanDetailResponse);
    } catch {
      message.error("Lỗi tải sơ đồ ghế");
    } finally {
      setLoadingPlanDetail(false);
    }
  };

  const toggleSeat = (seat: PlanSeatResponse) => {
    const isSelected = selectedSeats.some((s) => s.seatId === seat.seatId);

    if (isSelected) {
      setSelectedSeats(selectedSeats.filter((s) => s.seatId !== seat.seatId));
    } else {
      if (selectedSeats.length < requiredSeats) {
        setSelectedSeats([...selectedSeats, seat]);
      } else {
        message.warning(`Bạn chỉ được chọn tối đa ${requiredSeats} ghế`);
      }
    }
  };

  const handleConfirmExchange = async () => {
    // Kiểm tra đã chọn đủ số ghế chưa
    if (selectedSeats.length !== requiredSeats) {
      message.error(`Vui lòng chọn đủ ${requiredSeats} ghế cho chuyến mới`);
      return;
    }

    if (!selectedPlan || !ticket.id) return;

    try {
      setIsSubmitting(true);
      const payload = {
        newPlanId: selectedPlan.id,
        newSeatIds: selectedSeats.map((s) => s.seatId),
      };

      await changePlan(ticket.id, payload);

      message.success("Đổi chuyến thành công!");
      if (onSuccess) onSuccess();
      onClose();
    } catch (error: unknown) {
      const err = error as ApiError;
      message.error(err.response?.data?.message || "Đổi chuyến thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[32px] shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-xl font-black text-slate-900 uppercase italic tracking-tight">
              Đổi lịch trình vé
            </h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
              Mã vé: {ticket.bookingCode}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-2 gap-10 font-sans">
          <div className="space-y-6">
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl">
              <label className="text-[10px] font-black text-blue-600 uppercase mb-1 block">
                Chuyến hiện tại
              </label>
              <div className="font-bold text-slate-700 text-lg">{ticket.planCode || "N/A"}</div>
              <div className="flex items-center text-slate-400 text-[11px] mt-1 font-medium">
                <Calendar className="w-3.5 h-3.5 mr-1.5" />
                {ticket.startTime
                  ? new Date(ticket.startTime).toLocaleString("vi-VN")
                  : "Chưa xác định"}
              </div>
              <div className="mt-2 text-[10px] font-bold text-slate-500 italic">
                Số lượng ghế cần đổi: {requiredSeats}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">
                  Chọn chuyến mới
                </label>
                <select
                  onChange={(e) => handleSelectPlan(e.target.value)}
                  className="w-full p-4 border-2 border-slate-100 rounded-2xl font-bold text-slate-800 outline-none focus:border-blue-600 bg-white cursor-pointer transition-all appearance-none shadow-sm"
                >
                  <option value="">-- Chọn chuyến mới --</option>
                  {availablePlans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code} -{" "}
                      {p.startTime ? new Date(p.startTime).toLocaleTimeString("vi-VN") : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  Chi nhánh: {ticket.branchName || "Hệ thống"}
                </span>
              </div>
            </div>

            {selectedPlan && (
              <div className="p-6 bg-slate-900 rounded-[24px] text-white shadow-2xl transform transition-all scale-105 origin-left">
                <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">
                  Thông tin đổi vé
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Mã chuyến:</span>
                    <span className="font-bold text-blue-400">{selectedPlan.code}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Ghế đã chọn:</span>
                    <span
                      className={`font-bold ${selectedSeats.length === requiredSeats ? "text-green-400" : "text-orange-400 animate-pulse"}`}
                    >
                      {selectedSeats.length > 0
                        ? selectedSeats.map((s) => s.seatNumber).join(", ")
                        : `Chọn đủ ${requiredSeats} ghế...`}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center justify-center border-l border-slate-100 pl-4">
            {loadingPlanDetail ? (
              <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            ) : planDetail ? (
              <div className="w-full max-w-[280px]">
                <div className="relative bg-white rounded-[40px] rounded-t-[70px] p-6 border-x-[10px] border-t-[15px] border-b-[12px] border-slate-900 shadow-2xl">
                  <div className="flex justify-between items-center mb-8 pb-4 border-b-2 border-dashed border-slate-100">
                    <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-white shadow-inner">
                      <DriverIcon />
                    </div>
                    <div className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em]">
                      Lối vào
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-8 justify-items-center">
                    {(planDetail.seats || planDetail.listSeats || []).map((seat) => {
                      const isBooked = seat.status === "BOOKED";
                      const isSelected = selectedSeats.some((s) => s.seatId === seat.seatId);
                      return (
                        <button
                          key={seat.seatId}
                          disabled={isBooked}
                          onClick={() => toggleSeat(seat)}
                          className={`relative w-full max-w-[65px] aspect-square rounded-xl border-b-[6px] transition-all duration-200
                            ${
                              isBooked
                                ? "bg-slate-100 border-slate-200 opacity-40 cursor-not-allowed"
                                : isSelected
                                  ? "bg-orange-500 border-orange-700 -translate-y-1.5 shadow-lg"
                                  : "bg-white border-slate-100 hover:border-blue-400 hover:bg-blue-50"
                            }
                          `}
                        >
                          <span
                            className={`text-[10px] font-black block mb-0.5 ${isSelected ? "text-white" : "text-slate-400"}`}
                          >
                            {seat.seatNumber}
                          </span>
                          <BusSeatIcon
                            className={`w-6 h-6 mx-auto ${isSelected ? "text-white" : "text-slate-200"}`}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs font-black uppercase tracking-widest text-slate-300">
                Vui lòng chọn chuyến xe
              </p>
            )}
          </div>
        </div>

        <div className="p-6 border-t bg-slate-50 flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-4 font-black text-slate-400 hover:text-slate-600 uppercase text-xs"
          >
            Hủy
          </button>
          <button
            disabled={selectedSeats.length !== requiredSeats || isSubmitting}
            onClick={handleConfirmExchange}
            className={`flex-[2] py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all
              ${
                selectedSeats.length === requiredSeats && !isSubmitting
                  ? "bg-blue-600 text-white shadow-xl hover:bg-blue-700"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }
            `}
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin mx-auto" />
            ) : (
              "Xác nhận đổi chuyến"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExchangeTicketModal;
