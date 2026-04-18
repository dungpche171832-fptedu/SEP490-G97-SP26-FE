/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, Suspense } from "react";
import {
  ArrowRightOutlined,
  EnvironmentOutlined,
  LoadingOutlined,
  CheckCircleOutlined,
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

// ============================================================================
// ĐỊNH NGHĨA KIỂU DỮ LIỆU ĐỂ LOẠI BỎ "ANY"
// ============================================================================

interface Station {
  id: number;
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  lat?: number;
  lng?: number;
}

interface Seat {
  id?: number;
  seatId?: number;
  code?: string;
  seatCode?: string;
  seatNumber?: string;
  status: string;
}

interface PlanDetail {
  id: number;
  code: string;
  startTime: string;
  carId?: number;
  carLicensePlate?: string;
  startStation?: Station;
  start_station?: Station;
  endStations?: Station[];
  end_stations?: Station[];
  seats?: Seat[];
  listSeats?: Seat[];
  car?: {
    id?: number;
    name?: string;
    carType?: string;
    branch?: {
      code?: string;
    };
  };
  carInfo?: {
    description?: string;
    licensePlate?: string;
    carType?: string;
    branchCode?: string;
  };
}

/**
 * MÀN HÌNH ĐẶT VÉ LIMOUSINE - CẬP NHẬT THEO ĐÚNG SCHEMA DATABASE
 */
function AddTicketContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = Number(searchParams.get("planId") || 0);

  // --- State dữ liệu từ Backend ---
  // Thay thế useState<any>(null) bằng useState<PlanDetail | null>(null)
  const [planDetail, setPlanDetail] = useState<PlanDetail | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [selectedDropOff, setSelectedDropOff] = useState<number | null>(null);

  // --- State tính toán & UI ---
  const [distanceKm, setDistanceKm] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);

  const [loadingPlan, setLoadingPlan] = useState(true);
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);
  const [isCalculatingPrice, setIsCalculatingPrice] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  // -- State cho Popup QR Chi nhánh --
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [branchImage, setBranchImage] = useState<string>("");
  const [isFetchingImage, setIsFetchingImage] = useState(false);

  // 1. Fetch thông tin chuyến xe chi tiết
  useEffect(() => {
    if (!planId) {
      message.error("Không tìm thấy mã chuyến xe!");
      router.push("/home/plan");
      return;
    }

    const fetchPlanData = async () => {
      try {
        setLoadingPlan(true);
        const res = await planService.getPlanById(planId);

        // Ép kiểu dữ liệu trả về thành PlanDetail
        const typedRes = res as PlanDetail;
        setPlanDetail(typedRes);

        const endStations = typedRes?.endStations || typedRes?.end_stations || [];
        if (endStations.length > 0) {
          setSelectedDropOff(endStations[0].id);
        }
      } catch (error) {
        message.error("Lỗi kết nối dữ liệu chuyến xe.");
      } finally {
        setLoadingPlan(false);
      }
    };

    fetchPlanData();
  }, [planId, router]);

  // 2. Tính khoảng cách OSRM
  useEffect(() => {
    const fetchDistance = async () => {
      if (!planDetail || !selectedDropOff) return;

      const start = planDetail.startStation || planDetail.start_station;
      const ends = planDetail.endStations || planDetail.end_stations || [];
      const target = ends.find((s: Station) => s.id === selectedDropOff);

      if (!start || !target) return;

      setIsCalculatingDistance(true);
      try {
        const targetIndex = ends.findIndex((s: Station) => s.id === selectedDropOff);
        const intermediateStations = ends.slice(0, targetIndex + 1);

        // Trích xuất tọa độ
        const coordinates = [start, ...intermediateStations].map((s: Station) => ({
          lng: Number(s.longitude || s.lng || 0),
          lat: Number(s.latitude || s.lat || 0),
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

  // 3. Tính giá tiền (Preview)
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
        setTotalAmount(res.price);
      } catch (error) {
        setTotalAmount(0);
      } finally {
        setIsCalculatingPrice(false);
      }
    };

    const timeoutId = setTimeout(fetchPreviewPrice, 300);
    return () => clearTimeout(timeoutId);
  }, [selectedSeats, distanceKm, selectedDropOff, planId, planDetail]);

  // 4. HIỂN THỊ MODAL THANH TOÁN
  const handleShowPaymentModal = async () => {
    if (selectedSeats.length === 0) {
      message.warning("Vui lòng chọn chỗ ngồi trước khi đặt!");
      return;
    }

    setIsFetchingImage(true);
    setIsPaymentModalOpen(true);

    try {
      const branchCode = planDetail?.carInfo?.branchCode || planDetail?.car?.branch?.code;
      if (branchCode) {
        const token = window.localStorage.getItem("token");
        const res = await fetch(`http://localhost:8080/api/branches?code=${branchCode}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          // Ép kiểu mảng branch
          const branches = (data.branches || data.result || []) as Record<string, unknown>[];

          if (branches.length > 0 && typeof branches[0].imageUrl === "string") {
            setBranchImage(branches[0].imageUrl);
          } else {
            setBranchImage("");
          }
        }
      }
    } catch (error) {
      console.warn("Không lấy được ảnh branch", error);
      setBranchImage("");
    } finally {
      setIsFetchingImage(false);
    }
  };

  // 5. XỬ LÝ ĐẶT VÉ CHÍNH THỨC
  const handleBookTicket = async () => {
    setIsBooking(true);
    try {
      const start = planDetail?.startStation || planDetail?.start_station;

      if (!start) {
        throw new Error("Không xác định được trạm bắt đầu");
      }

      const payload: TicketAddRequest = {
        planId: planId,
        carId: Number(planDetail?.car?.id || planDetail?.carId || 0),
        startStationId: start.id,
        endStationId: selectedDropOff!,
        distanceKm: distanceKm,
        totalAmount: totalAmount,
        note: "Khách hàng đặt vé trực tuyến",
        status: "PENDING",
        seatIds: selectedSeats,
      };

      await bookTicket(payload);
      message.success("Đặt vé thành công! Đang chuyển sang lịch sử...");

      setIsPaymentModalOpen(false);

      setTimeout(() => {
        router.push("/home/ticket/historyTicket");
      }, 1500);
    } catch (error) {
      message.error("Đặt vé không thành công, vui lòng kiểm tra lại.");
    } finally {
      setIsBooking(false);
    }
  };

  const toggleSeat = (seatId: number) => {
    setSelectedSeats((prev) =>
      prev.includes(seatId) ? prev.filter((id) => id !== seatId) : [...prev, seatId],
    );
  };

  if (loadingPlan)
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white">
        <Spin size="large" />
        <p className="mt-4 font-bold text-slate-500 italic">Đang tải sơ đồ chuyến xe...</p>
      </div>
    );

  // Lấy các danh sách để render
  const renderEndStations = planDetail?.endStations || planDetail?.end_stations || [];
  const renderSeats = planDetail?.seats || planDetail?.listSeats || [];
  const startStationToRender = planDetail?.startStation || planDetail?.start_station;

  return (
    <div className="min-h-screen bg-[#f0f2f5] pb-20 font-sans">
      {/* HEADER */}
      <div className="bg-white border-b border-slate-200 px-6 py-8 md:px-20 mb-8 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight text-center md:text-left">
            Đặt vé:{" "}
            {planDetail?.carInfo?.description ||
              planDetail?.carLicensePlate ||
              planDetail?.car?.name ||
              "Vietnam Limousine"}
          </h1>
          <p className="text-sm text-slate-500 font-medium text-center md:text-left">
            Chuyến xe: {planDetail?.code}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-20 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* CỘT TRÁI: LỘ TRÌNH & GHẾ */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1 w-full">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  ĐIỂM ĐÓN
                </p>
                <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl">
                  <EnvironmentOutlined className="text-blue-600 text-lg mt-1" />
                  <div>
                    <p className="font-bold text-slate-800">{startStationToRender?.name}</p>
                    <p className="text-[11px] text-slate-500">{startStationToRender?.address}</p>
                  </div>
                </div>
              </div>

              <ArrowRightOutlined className="text-slate-300 text-xl hidden md:block" />

              <div className="flex-1 w-full">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  ĐIỂM TRẢ
                </p>
                <select
                  className="w-full p-4 rounded-xl border border-slate-200 font-bold text-slate-800 outline-none focus:border-blue-500 transition-all bg-white"
                  value={selectedDropOff || ""}
                  onChange={(e) => setSelectedDropOff(Number(e.target.value))}
                >
                  {renderEndStations.map((s: Station) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-dashed border-slate-100 text-center">
              <span className="text-[11px] font-black text-blue-600 bg-blue-50 px-5 py-2 rounded-full uppercase">
                📍 Quãng đường thực tế: {isCalculatingDistance ? "Đang đo..." : `${distanceKm} km`}
              </span>
            </div>
          </div>

          {/* THÔNG TIN XE */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-2xl">
                🚐
              </div>
              <div>
                <h3 className="font-black text-slate-800 text-lg">
                  {planDetail?.carInfo?.description || "Vietnam Limousine"}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Biển số: {planDetail?.carInfo?.licensePlate || planDetail?.carLicensePlate}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-full">
                Wifi
              </span>
              <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-full">
                USB
              </span>
            </div>
          </div>

          {/* SƠ ĐỒ GHẾ */}
          <div className="bg-white rounded-2xl p-10 shadow-sm border border-slate-100 flex flex-col items-center">
            <div className="mb-10 text-center">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Sơ đồ vị trí ngồi
              </p>
              <div className="w-16 h-1 bg-blue-100 mx-auto mt-2 rounded-full"></div>
            </div>

            <div className="bg-slate-50 rounded-[40px] p-8 border border-slate-100 inline-block">
              {/* Dashboard Head */}
              <div className="flex justify-between items-start mb-10 px-2 opacity-40">
                <svg className="w-8 h-8 text-slate-800" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v4h-2zm0 6h2v2h-2z" />
                </svg>
                <div className="w-8 h-1 bg-slate-300 rounded-full mt-3"></div>
              </div>

              {/* Lưới ghế */}
              <div
                className={`grid gap-4 md:gap-6 ${
                  renderSeats.length <= 9
                    ? "grid-cols-3"
                    : renderSeats.length <= 16
                      ? "grid-cols-4"
                      : "grid-cols-5"
                }`}
              >
                {renderSeats.map((seat: Seat, i: number) => {
                  const is9SeatLayout = renderSeats.length === 9;
                  const renderEmptySpace =
                    is9SeatLayout && (i === 2 || i === 4 || i === 6) ? (
                      <div key={`empty-${i}`}></div>
                    ) : null;

                  // Xử lý id của ghế an toàn
                  const seatIdToUse = seat.seatId || seat.id || 0;

                  return (
                    <React.Fragment key={seatIdToUse}>
                      {renderEmptySpace}
                      <button
                        disabled={seat.status === "BOOKED"}
                        onClick={() => toggleSeat(seatIdToUse)}
                        className={`
                           flex flex-col items-center justify-center gap-1 transition-all duration-300 outline-none
                           ${
                             seat.status === "BOOKED"
                               ? "text-slate-300 cursor-not-allowed opacity-60"
                               : selectedSeats.includes(seatIdToUse)
                                 ? "text-blue-600 scale-110 drop-shadow-md"
                                 : "text-orange-500 hover:scale-105"
                           }
                         `}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill={
                            selectedSeats.includes(seatIdToUse) || seat.status === "BOOKED"
                              ? "currentColor"
                              : "none"
                          }
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-10 h-10 md:w-12 md:h-12"
                        >
                          <path d="M5 10V6a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v4"></path>
                          <rect x="2" y="10" width="4" height="6" rx="2"></rect>
                          <rect x="18" y="10" width="4" height="6" rx="2"></rect>
                          <rect x="6" y="14" width="12" height="4" rx="2"></rect>
                          <path d="M8 18v3a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-3"></path>
                        </svg>
                        <span
                          className={`text-xs font-black ${selectedSeats.includes(seatIdToUse) ? "text-blue-700" : seat.status === "BOOKED" ? "text-slate-400" : "text-slate-700"}`}
                        >
                          {seat.seatNumber || seat.code || seat.seatCode || "G"}
                        </span>
                      </button>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Chú giải */}
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 mt-10">
              <div className="flex items-center gap-2">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="w-5 h-5 md:w-6 md:h-6 text-orange-500"
                >
                  <path d="M5 10V6a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v4"></path>
                  <rect x="2" y="10" width="4" height="6" rx="2"></rect>
                  <rect x="18" y="10" width="4" height="6" rx="2"></rect>
                  <rect x="6" y="14" width="12" height="4" rx="2"></rect>
                  <path d="M8 18v3a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-3"></path>
                </svg>
                <span className="text-[10px] md:text-xs font-black text-slate-500 uppercase mt-1">
                  Trống
                </span>
              </div>
              <div className="flex items-center gap-2">
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="w-5 h-5 md:w-6 md:h-6 text-blue-600"
                >
                  <path d="M5 10V6a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v4"></path>
                  <rect x="2" y="10" width="4" height="6" rx="2"></rect>
                  <rect x="18" y="10" width="4" height="6" rx="2"></rect>
                  <rect x="6" y="14" width="12" height="4" rx="2"></rect>
                  <path d="M8 18v3a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-3"></path>
                </svg>
                <span className="text-[10px] md:text-xs font-black text-slate-500 uppercase mt-1">
                  Đang chọn
                </span>
              </div>
              <div className="flex items-center gap-2">
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="w-5 h-5 md:w-6 md:h-6 text-slate-300"
                >
                  <path d="M5 10V6a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v4"></path>
                  <rect x="2" y="10" width="4" height="6" rx="2"></rect>
                  <rect x="18" y="10" width="4" height="6" rx="2"></rect>
                  <rect x="6" y="14" width="12" height="4" rx="2"></rect>
                  <path d="M8 18v3a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-3"></path>
                </svg>
                <span className="text-[10px] md:text-xs font-black text-slate-500 uppercase mt-1">
                  Đã bán
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: THANH TOÁN */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden sticky top-8">
            <div className="bg-blue-600 p-8 text-white text-center">
              <h3 className="text-xl font-black tracking-widest">CHI TIẾT THANH TOÁN</h3>
              <p className="text-[10px] font-bold opacity-60 uppercase mt-1 tracking-tighter">
                VietTrung Logistics Premium
              </p>
            </div>

            <div className="p-8 space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase">Khởi hành</p>
                  <p className="text-xl font-black text-blue-600">
                    {planDetail?.startTime?.substring(11, 16) || "00:00"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase">Số lượng</p>
                  <p className="text-xl font-black text-slate-800">{selectedSeats.length} Vé</p>
                </div>
              </div>

              <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100/50">
                <p className="text-[10px] font-black text-blue-400 uppercase mb-2">
                  Vị trí ghế đã chọn
                </p>
                <p className="text-sm font-black text-blue-700 leading-relaxed">
                  {selectedSeats.length > 0
                    ? selectedSeats
                        .map(
                          (id) =>
                            renderSeats.find((s: Seat) => (s.seatId || s.id) === id)?.seatNumber ||
                            id,
                        )
                        .join(", ")
                    : "Quý khách vui lòng chọn ghế"}
                </p>
              </div>

              <div className="pt-6 border-t-2 border-dashed border-slate-100 flex justify-between items-center">
                <p className="font-black text-slate-400 text-xs uppercase">Tổng tiền thanh toán</p>
                {isCalculatingPrice ? (
                  <LoadingOutlined className="text-blue-600 text-xl" />
                ) : (
                  <p className="text-3xl font-black text-blue-600">
                    {totalAmount.toLocaleString("vi-VN")}đ
                  </p>
                )}
              </div>

              <button
                disabled={selectedSeats.length === 0 || totalAmount === 0 || isBooking}
                onClick={handleShowPaymentModal}
                className={`
                  w-full font-black py-5 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 text-sm tracking-widest
                  ${isBooking || selectedSeats.length === 0 ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200"}
                `}
              >
                {isBooking ? <LoadingOutlined /> : null}
                {isBooking ? "ĐANG XỬ LÝ..." : "XÁC NHẬN ĐẶT VÉ"}
              </button>

              <div className="flex items-center gap-2 justify-center text-[10px] font-bold text-slate-400 mt-2">
                <CheckCircleOutlined className="text-green-500" /> Hệ thống bảo mật 256-bit AES
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL THANH TOÁN / CHUYỂN KHOẢN QR */}
      <Modal
        title={
          <div className="flex justify-center w-full uppercase font-black text-blue-600 tracking-wider">
            Thanh toán vé xe
          </div>
        }
        open={isPaymentModalOpen}
        onOk={handleBookTicket}
        onCancel={() => setIsPaymentModalOpen(false)}
        confirmLoading={isBooking}
        okText="Hoàn tất thanh toán"
        cancelText="Hủy bỏ"
        centered
        okButtonProps={{ className: "bg-blue-600 font-bold tracking-wide border-none px-6" }}
        cancelButtonProps={{ className: "font-bold text-slate-500" }}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-2 border-t border-slate-100 mt-2">
          <p className="text-sm font-medium text-slate-600 text-center mb-6">
            Vui lòng quét mã QR hoặc chuyển khoản số tiền: <br />
            <span className="font-black text-3xl text-blue-600 mt-2 block">
              {totalAmount.toLocaleString("vi-VN")} đ
            </span>
          </p>

          <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm w-full flex justify-center mb-6 max-h-[400px] overflow-hidden relative">
            {isFetchingImage ? (
              <div className="h-48 flex flex-col items-center justify-center space-y-3">
                <Spin size="large" />
                <span className="text-xs text-slate-400 font-medium">
                  Đang tải mã QR của chi nhánh...
                </span>
              </div>
            ) : branchImage ? (
              <img
                src={branchImage}
                alt="Mã QR Thanh Toán"
                className="max-w-xs w-full object-contain rounded-xl"
              />
            ) : (
              <div className="h-48 w-full bg-slate-50 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200">
                <div className="text-slate-300 text-4xl mb-3">📷</div>
                <span className="text-slate-400 text-sm font-medium px-4 text-center">
                  Chi nhánh này chưa cập nhật ảnh mã QR thanh toán
                </span>
              </div>
            )}
          </div>

          <div className="bg-blue-50/70 p-4 rounded-xl w-full text-center border border-blue-100 border-dashed">
            <span className="text-[13px] text-slate-600 font-medium">
              Sau khi thanh toán thành công, vui lòng nhấn{" "}
              <b className="text-blue-600 uppercase tracking-wide">Hoàn tất</b> để xuất vé.
            </span>
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
