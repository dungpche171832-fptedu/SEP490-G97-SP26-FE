"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getTicketById, TicketInfo } from "@/services/ticket.service";
import { Loader2, Calendar, MapPin, User, Tag, BusFront, RotateCcw } from "lucide-react";
import { planService } from "@/services/planService";
import { Plan } from "@/model/plan";
import ExchangeTicketModal from "./ExchangeTicketModal";

const TicketDetailPage = () => {
  const params = useParams();
  const router = useRouter();

  const [ticket, setTicket] = useState<TicketInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [openExchangeModal, setOpenExchangeModal] = useState(false);
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      if (params?.id) {
        const data = await getTicketById(params.id as string);
        setTicket(data);
        setLoading(false);
      }
    };
    fetchDetail();
  }, [params?.id]);

  const handleOpenExchange = async () => {
    if (!ticket) return;

    try {
      setLoadingPlans(true);

      // Xử lý ép kiểu để khớp chính xác với Interface của getPlansForExchange
      const params = {
        totalSeat: Number(ticket.totalSeat || 0),
        departureStationId: Number(ticket.startStationId),
        destinationStationId: Number(ticket.endStationId),
        startTime: String(ticket.startTime),
        branchId: Number(ticket.branchId),
        carType: String(ticket.carType || ""),
      };

      // Kiểm tra dữ liệu bắt buộc trước khi gọi
      if (!params.departureStationId || !params.destinationStationId || !params.startTime) {
        alert("Thông tin vé hiện tại không đủ để tìm chuyến mới.");
        return;
      }

      const response = await planService.getPlansForExchange(params);

      const plans = response?.plans || [];

      if (plans.length === 0) {
        alert("Hiện tại không có chuyến nào khả dụng để đổi lịch trình.");
        return;
      }

      // Lọc bỏ chuyến trùng với chuyến hiện tại (nếu cần)
      const otherPlans = plans.filter((p) => p.id !== ticket.planId);

      if (otherPlans.length === 0) {
        alert("Hiện tại chỉ có duy nhất chuyến bạn đang đi.");
        return;
      }

      setAvailablePlans(otherPlans);
      setOpenExchangeModal(true);
    } catch (error: unknown) {
      console.error("Lỗi khi tìm chuyến mới:", error);

      const err = error as Error;

      alert(err.message || "Có lỗi xảy ra khi lấy danh sách chuyến.");
    } finally {
      setLoadingPlans(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + " VND";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">
          Đang tải dữ liệu vé...
        </p>
      </div>
    );
  }

  if (!ticket)
    return <div className="p-10 text-center text-red-500 font-bold italic">Không tìm thấy vé!</div>;

  return (
    <>
      <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 flex justify-center">
        <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
          <div className="p-8 pb-0">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">
                  #{ticket.bookingCode}
                </h1>
                <p className="text-slate-400 text-[11px] font-bold tracking-widest mt-1 uppercase">
                  Hệ thống xe Limousine Việt Trung
                </p>
              </div>
              <div
                className={`px-6 py-2 rounded-xl font-black text-sm shadow-sm border ${ticket.status === "PENDING" ? "bg-orange-50 text-orange-600 border-orange-100" : "bg-blue-50 text-blue-600 border-blue-100"}`}
              >
                {ticket.status}
              </div>
            </div>

            <div className="relative pl-10 mb-12">
              <div className="absolute left-[5px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-blue-600 to-slate-200"></div>
              <div className="relative mb-10">
                <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full border-4 border-white bg-blue-600 shadow-md"></div>
                <p className="text-xs font-black text-blue-600 uppercase mb-1 tracking-widest">
                  Điểm đón
                </p>
                <h3 className="font-bold text-xl text-slate-800">{ticket.startStation}</h3>
                <div className="flex items-center text-slate-400 text-xs mt-1 font-medium">
                  <Calendar className="w-3.5 h-3.5 mr-1.5" />
                  {ticket.startTime
                    ? new Date(ticket.startTime).toLocaleString("vi-VN")
                    : "Chưa có thời gian"}
                </div>
              </div>
              <div className="relative">
                <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full border-4 border-white bg-slate-300 shadow-sm"></div>
                <p className="text-xs font-black text-slate-400 uppercase mb-1 tracking-widest">
                  Điểm trả
                </p>
                <h3 className="font-bold text-xl text-slate-800">{ticket.endStation}</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-dashed border-slate-200 pt-10 pb-8">
              <DetailItem
                icon={<User className="w-4 h-4" />}
                label="Hành khách"
                value={ticket.accountName || "N/A"}
              />
              <div className="relative">
                <DetailItem
                  icon={<Tag className="w-4 h-4" />}
                  label="Mã chuyến"
                  value={ticket.planCode || `#PLN-${ticket.planId}`}
                />
                <button
                  onClick={handleOpenExchange}
                  disabled={loadingPlans}
                  className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] uppercase bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-md disabled:bg-slate-300"
                >
                  {loadingPlans ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <RotateCcw className="w-3 h-3" />
                  )}
                  Đổi chuyến
                </button>
              </div>
              <DetailItem
                icon={<BusFront className="w-4 h-4" />}
                label="Biển số"
                value={ticket.carLicensePlate || "Chưa xếp xe"}
              />
              <DetailItem
                icon={<MapPin className="w-4 h-4" />}
                label="Chi nhánh"
                value={ticket.branchName || "Chưa có thông tin"}
              />
              <div className="md:col-span-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  Số ghế
                </p>
                <div className="flex flex-wrap gap-2">
                  {ticket.seatNumbers?.map((s, idx) => (
                    <span
                      key={idx}
                      className="bg-blue-600 text-white px-3 py-1 rounded font-bold text-xs"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 p-8 text-white">
            <div className="flex justify-between items-end mb-8">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">
                  Tổng thanh toán
                </p>
                <h2 className="text-4xl font-black text-blue-400">
                  {formatCurrency(ticket.totalAmount)}
                </h2>
              </div>
            </div>
            <button
              onClick={() => router.back()}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white py-5 rounded-2xl font-black uppercase tracking-widest transition-all"
            >
              Quay lại danh sách
            </button>
          </div>
        </div>
      </div>

      <ExchangeTicketModal
        isOpen={openExchangeModal}
        onClose={() => setOpenExchangeModal(false)}
        ticket={ticket}
        availablePlans={availablePlans}
      />
    </>
  );
};

const DetailItem = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) => (
  <div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center">
      <span className="mr-1.5 opacity-50">{icon}</span>
      {label}
    </p>
    <p className="text-sm font-bold text-slate-800">{value}</p>
  </div>
);

export default TicketDetailPage;
