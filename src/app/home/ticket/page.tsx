"use client";
import { getBranchDetail } from "@/services/branch.service";
import React, { useState, useEffect, Suspense } from "react";
import {
  ArrowRightOutlined,
  EnvironmentOutlined,
  LoadingOutlined,
  CheckCircleOutlined,
  UserOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { message, Spin, Modal } from "antd";
import {
  previewTicketPrice,
  bookTicket,
  calculateDistanceOSRMList,
  TicketAddRequest,
} from "@/services/ticket.service";
import { planService } from "@/services/planService";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Car } from "@/services/carService";

// --- Interfaces để tránh lỗi 'any' ---
interface Station {
  id?: number;
  stationId?: number;
  name?: string;
  stationName?: string;
  longitude?: number;
  lng?: number;
  latitude?: number;
  lat?: number;
}

interface Seat {
  id: number;
  seatId: number;
  seatNumber: string;
  status: string;
}

interface PlanData {
  id: number;
  code: string;
  startStation: Station;
  start_station?: Station;
  endStations: Station[];
  end_stations?: Station[];
  car?: Car & {
    branch?: {
      id?: number;
      code?: string;
      name?: string;
      imageUrl?: string;
    };
  };
  carInfo?: Car & {
    branchId?: number;
    branchCode?: string;
    branch?: {
      id?: number;
      code?: string;
      name?: string;
      imageUrl?: string;
    };
  };
  seats?: Seat[];
  listSeats?: Seat[];
  carId?: number;
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

function AddTicketContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = Number(searchParams.get("planId") || 0);

  const [planDetail, setPlanDetail] = useState<PlanData | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [selectedDropOff, setSelectedDropOff] = useState<number | null>(null);
  const [distanceKm, setDistanceKm] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);
  const [isCalculatingPrice, setIsCalculatingPrice] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [branchImage, setBranchImage] = useState<string>("/images/QR.png");
  const [isFetchingImage, setIsFetchingImage] = useState(false);

  useEffect(() => {
    if (!planId) {
      message.error("Không tìm thấy mã chuyến xe!");
      router.push("/home/plan");
      return;
    }
    const fetchPlanData = async () => {
      try {
        setLoadingPlan(true);
        const res = await planService.getPlanByIdForTicket(planId);
        setPlanDetail(res);
        const endStations = res?.endStations || res?.end_stations || [];
        if (endStations.length > 0) {
          setSelectedDropOff(endStations[0].id || endStations[0].stationId);
        }
      } catch {
        message.error("Lỗi kết nối dữ liệu chuyến xe.");
      } finally {
        setLoadingPlan(false);
      }
    };
    fetchPlanData();
  }, [planId, router]);

  useEffect(() => {
    const fetchDistance = async () => {
      if (!planDetail || !selectedDropOff) return;
      const start = planDetail.startStation || planDetail.start_station;
      const ends = planDetail.endStations || planDetail.end_stations || [];
      const targetIndex = ends.findIndex((s: Station) => (s.id || s.stationId) === selectedDropOff);
      if (targetIndex === -1) return;

      setIsCalculatingDistance(true);
      try {
        const intermediateStations = ends.slice(0, targetIndex + 1);
        const coordinates = [start, ...intermediateStations].map((s: Station | undefined) => ({
          lng: s?.longitude || s?.lng || 0,
          lat: s?.latitude || s?.lat || 0,
        }));
        const dist = await calculateDistanceOSRMList(coordinates);
        setDistanceKm(dist);
      } catch (error) {
        console.error("Lỗi OSRM:", error);
      } finally {
        setIsCalculatingDistance(false);
      }
    };
    fetchDistance();
  }, [selectedDropOff, planDetail]);

  useEffect(() => {
    const fetchPreviewPrice = async () => {
      if (selectedSeats.length === 0 || distanceKm === 0) {
        setTotalAmount(0);
        return;
      }
      setIsCalculatingPrice(true);
      try {
        const carType = planDetail?.carInfo?.carType || planDetail?.car?.carType || "SEAT_9";
        const res = await previewTicketPrice({
          carType: carType,
          distanceKm: distanceKm,
          seatCount: selectedSeats.length,
        });
        setTotalAmount(res.price || 0);
      } catch {
        setTotalAmount(0);
      } finally {
        setIsCalculatingPrice(false);
      }
    };
    const timeoutId = setTimeout(fetchPreviewPrice, 400);
    return () => clearTimeout(timeoutId);
  }, [selectedSeats, distanceKm, planDetail]);

  const toggleSeat = (seatId: number) => {
    setSelectedSeats((prev) =>
      prev.includes(seatId) ? prev.filter((id) => id !== seatId) : [...prev, seatId],
    );
  };

  const handleShowPaymentModal = async () => {
    if (selectedSeats.length === 0) {
      message.warning("Vui lòng chọn chỗ ngồi trước khi đặt!");
      return;
    }

    setIsFetchingImage(true);
    setIsPaymentModalOpen(true);

    try {
      const branchId =
        planDetail?.carInfo?.branchId ||
        planDetail?.carInfo?.branch?.id ||
        planDetail?.car?.branch?.id;

      if (!branchId) {
        return;
      }

      const branchDetail = await getBranchDetail(String(branchId));
      if (branchDetail?.imageUrl) {
        setBranchImage(branchDetail.imageUrl);
      }
    } catch (error) {
      console.error("Không lấy được QR chi nhánh:", error);
      setBranchImage("");
    } finally {
      setIsFetchingImage(false);
    }
  };

  const handleBookTicket = async () => {
    setIsBooking(true);
    try {
      const start = planDetail?.startStation || planDetail?.start_station;
      const payload: TicketAddRequest = {
        planId: planId,
        carId: planDetail?.car?.id || planDetail?.carId || 0,
        branchId:
          planDetail?.carInfo?.branchId ||
          planDetail?.carInfo?.branch?.id ||
          planDetail?.car?.branch?.id ||
          0,
        startStationId: start?.id || start?.stationId || 0,
        endStationId: selectedDropOff!,
        distanceKm: distanceKm,
        totalAmount: totalAmount,
        note: "Khách hàng đặt vé trực tuyến",
        status: "PENDING",
        seatIds: selectedSeats,
      };
      await bookTicket(payload);
      message.success("Đặt vé thành công!");
      setIsPaymentModalOpen(false);
      setTimeout(() => router.push("/home/ticket/historyTicket"), 1500);
    } catch {
      message.error("Đặt vé thất bại.");
    } finally {
      setIsBooking(false);
    }
  };

  if (loadingPlan)
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white">
        <Spin size="large" />
        <p className="mt-4 font-bold text-slate-500">Đang tải sơ đồ...</p>
      </div>
    );

  const startStation = planDetail?.startStation || planDetail?.start_station;
  const endStations = planDetail?.endStations || planDetail?.end_stations || [];
  const carInfo = planDetail?.carInfo || planDetail?.car;
  const seats = planDetail?.seats || planDetail?.listSeats || [];

  return (
    <div className="min-h-screen bg-[#f1f5f9] pb-24 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-6 md:px-20 mb-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
              <span className="p-2 bg-blue-600 text-white rounded-lg text-sm">CAR</span>
              ĐẶT VÉ LIMOUSINE
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Lịch trình: <span className="text-blue-600 font-bold">{planDetail?.code}</span>
            </p>
          </div>
          <div className="flex items-center gap-4 bg-white border border-slate-200 px-5 py-3 rounded-2xl shadow-sm">
            <div className="text-right">
              <p className="text-[10px] text-slate-400 font-bold uppercase">Tạm tính</p>
              <p className="text-xl font-black text-blue-600">
                {(totalAmount || 0).toLocaleString("vi-VN")}đ
              </p>
            </div>
            <div className="w-px h-8 bg-slate-200"></div>
            <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-black">
              {selectedSeats.length} Ghế
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-20 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Cột trái */}
        <div className="lg:col-span-8 space-y-6">
          {/* Lộ trình */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-sm font-black text-slate-800 uppercase mb-4 flex items-center gap-2">
              <EnvironmentOutlined className="text-blue-600" /> Thông tin lộ trình
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-11 items-center gap-4">
              <div className="md:col-span-5 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Điểm đón</p>
                <p className="font-bold text-slate-800 line-clamp-1">
                  {startStation?.name || startStation?.stationName}
                </p>
              </div>

              <div className="md:col-span-1 flex flex-col items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <ArrowRightOutlined />
                </div>
              </div>

              <div className="md:col-span-5">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">
                  Điểm trả khách
                </p>
                <select
                  className="w-full p-4 rounded-xl border border-slate-200 font-bold text-black bg-white outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer"
                  style={{ color: "black", opacity: 1 }}
                  value={selectedDropOff || ""}
                  onChange={(e) => setSelectedDropOff(Number(e.target.value))}
                >
                  {endStations.map((s: Station) => (
                    <option
                      key={s.id || s.stationId}
                      value={s.id || s.stationId}
                      className="text-black bg-white"
                    >
                      {s.name || s.stationName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-slate-500 bg-blue-50 w-fit px-3 py-1.5 rounded-lg border border-blue-100">
              <InfoCircleOutlined /> Quãng đường dự kiến:{" "}
              {isCalculatingDistance ? <LoadingOutlined /> : `${distanceKm} KM`}
            </div>
          </div>

          {/* Sơ đồ ghế */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-10 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-800">Sơ đồ ghế ngồi</h3>
                <p className="text-xs text-slate-400">Vui lòng chọn vị trí ghế bạn muốn ngồi</p>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-slate-100 border border-slate-300 rounded-sm"></div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Trống</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-orange-500 rounded-sm"></div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Đang chọn</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-yellow-500 rounded-sm"></div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">
                    Người khác đang chọn
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-slate-300 rounded-sm"></div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Đã đặt</span>
                </div>
              </div>
            </div>

            <div className="relative mx-auto max-w-[400px] bg-slate-50 rounded-[40px] rounded-t-[100px] p-8 border-x-[12px] border-t-[20px] border-b-[15px] border-slate-800 shadow-2xl">
              <div className="absolute -left-6 top-20 w-4 h-16 bg-slate-800 rounded-l-lg"></div>
              <div className="absolute -right-6 top-20 w-4 h-16 bg-slate-800 rounded-r-lg"></div>
              <div className="w-full h-12 bg-slate-200/50 rounded-t-[80px] mb-6 border-b-4 border-slate-300 flex items-center justify-center">
                <div className="w-20 h-1 bg-slate-400 rounded-full opacity-30"></div>
              </div>

              <div className="flex justify-between items-center mb-12 px-2 pb-6 border-b-2 border-dashed border-slate-300">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center shadow-inner text-white">
                    <DriverIcon />
                  </div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                    Tài xế
                  </span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center border-2 border-dashed border-blue-300 text-blue-500">
                    <UserOutlined style={{ fontSize: 20 }} />
                  </div>
                  <span className="text-[9px] font-bold text-blue-500 uppercase tracking-wider">
                    Phụ xe
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-y-10 justify-between relative">
                <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-8 bg-slate-100/50 rounded-full -z-10"></div>
                {seats.map((seat: Seat, index: number) => {
                  const isBooked = seat.status === "BOOKED";
                  const isChoosing = seat.status === "HOLD";
                  const isSelected = selectedSeats.includes(seat.id || seat.seatId);
                  const isLastExtra = seats.length % 2 !== 0 && index === seats.length - 1;

                  return (
                    <button
                      key={seat.id || seat.seatId}
                      disabled={isBooked || isChoosing}
                      onClick={() => toggleSeat(seat.id || seat.seatId)}
                      className={`relative transition-all duration-300 
                                            ${isLastExtra ? "w-full flex justify-center mt-4" : "w-[40%]"}`}
                    >
                      <div
                        className={`relative aspect-[1/1.1] w-full max-w-[80px] mx-auto rounded-t-xl rounded-b-md flex flex-col items-center justify-center border-b-[6px] transition-all 
                          ${
                            isBooked
                              ? "bg-slate-200 border-slate-300 opacity-60"
                              : isChoosing
                                ? "bg-yellow-100 border-yellow-400 border-2 opacity-90 cursor-not-allowed"
                                : isSelected
                                  ? "bg-orange-500 border-orange-700 -translate-y-1 shadow-lg shadow-orange-200"
                                  : "bg-white border-slate-200 shadow-md hover:border-blue-400 hover:bg-blue-50"
                          }
                                                    
                                            `}
                      >
                        <div
                          className={`absolute -top-2 w-3/4 h-2 rounded-t-lg ${isSelected ? "bg-orange-600" : "bg-slate-200"}`}
                        ></div>
                        <span
                          className={`text-[10px] font-black mb-1 z-10 ${isSelected ? "text-white" : "text-slate-500"}`}
                        >
                          {seat.seatNumber}
                        </span>
                        <BusSeatIcon
                          className={`w-7 h-7 z-10 ${isSelected ? "text-white" : isBooked ? "text-slate-400" : "text-slate-300"}`}
                        />
                      </div>
                      {isSelected && (
                        <div className="absolute top-0 right-2 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center text-[10px] text-white shadow-sm z-20">
                          ✓
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-12 w-full h-4 border-t-4 border-slate-200 flex justify-between px-10">
                <div className="w-8 h-2 bg-red-500/20 rounded-b-full"></div>
                <div className="w-8 h-2 bg-red-500/20 rounded-b-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Cột phải */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl p-6 sticky top-10 border border-slate-200 shadow-sm">
            <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
              <CheckCircleOutlined className="text-blue-600" /> Chi tiết đặt vé
            </h3>
            <div className="space-y-4 mb-8">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase mb-2">
                  <span>Vị trí ghế</span>
                  <span>{selectedSeats.length} Ghế</span>
                </div>
                <p className="text-blue-600 font-black">
                  {selectedSeats.length > 0
                    ? selectedSeats
                        .map((id) => seats.find((s: Seat) => (s.id || s.seatId) === id)?.seatNumber)
                        .join(", ")
                    : "Chưa chọn"}
                </p>
              </div>
              <div className="flex justify-between items-center px-1">
                <span className="text-slate-500 text-sm font-medium">Giá vé 1 ghế</span>
                <span className="font-bold text-slate-800">
                  {selectedSeats.length > 0
                    ? (totalAmount / selectedSeats.length).toLocaleString("vi-VN")
                    : 0}
                  đ
                </span>
              </div>
              <div className="w-full h-px bg-slate-100 my-2"></div>
              <div className="flex justify-between items-end px-1">
                <span className="text-slate-500 text-sm font-medium mb-1">Thành tiền</span>
                <div className="text-right">
                  <p className="text-2xl font-black text-blue-600">
                    {(totalAmount || 0).toLocaleString("vi-VN")}đ
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={handleShowPaymentModal}
              disabled={selectedSeats.length === 0 || isCalculatingPrice}
              className={`w-full py-4 rounded-xl font-black uppercase tracking-widest transition-all shadow-lg
                                ${
                                  selectedSeats.length === 0 || isCalculatingPrice
                                    ? "bg-slate-100 !text-black opacity-100 shadow-none cursor-not-allowed"
                                    : "bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-blue-200"
                                }`}
            >
              {isCalculatingPrice ? <LoadingOutlined /> : "Xác nhận & Thanh toán"}
            </button>
          </div>
        </div>
      </div>

      <Modal
        title={null}
        open={isPaymentModalOpen}
        onCancel={() => setIsPaymentModalOpen(false)}
        footer={null}
        centered
        width={420}
        styles={{ body: { padding: 0 } }}
      >
        <div className="bg-white rounded-3xl overflow-hidden">
          <div className="bg-blue-600 p-8 text-center text-white">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
              💳
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight">Thanh toán vé xe</h3>
            <p className="text-blue-100 text-xs mt-1 opacity-80">Quét mã QR để hoàn tất đặt chỗ</p>
            <p>Nội dung chuyển khoản vui lòng nhập theo mã số dưới đây</p>
          </div>
          <div className="p-8">
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-6 flex flex-col items-center">
              {isFetchingImage ? (
                <Spin size="large" />
              ) : branchImage ? (
                <Image
                  src={branchImage}
                  alt="QR Payment"
                  width={300}
                  height={300}
                  className="w-full rounded-xl shadow-sm border-2 border-white"
                  unoptimized
                />
              ) : (
                <p className="text-slate-400 font-bold italic py-20 text-xs">
                  Chưa có mã QR thanh toán
                </p>
              )}
              <div className="mt-6 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Số tiền chuyển khoản
                </p>
                <p className="text-2xl font-black text-blue-600">
                  {(totalAmount || 0).toLocaleString("vi-VN")}đ
                </p>
              </div>
            </div>
            <button
              onClick={handleBookTicket}
              disabled={isBooking}
              className="w-full mt-8 py-4 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest transition-all"
            >
              {isBooking ? <LoadingOutlined /> : "Tôi đã chuyển khoản"}
            </button>
            <button
              onClick={() => setIsPaymentModalOpen(false)}
              className="w-full mt-4 text-slate-400 font-bold text-xs uppercase hover:text-slate-600"
            >
              Hủy bỏ
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function TicketPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center">
          <Spin size="large" />
        </div>
      }
    >
      <AddTicketContent />
    </Suspense>
  );
}
