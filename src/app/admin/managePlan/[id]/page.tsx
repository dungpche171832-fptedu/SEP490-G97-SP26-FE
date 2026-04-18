"use client";

import {
  ArrowLeftOutlined,
  CalendarOutlined,
  CarOutlined,
  PhoneOutlined,
  UserOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { Button, Tag, Spin, Select, message } from "antd";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { planService, type PlanDetailResponse } from "@/services/planService";

const STATUS_OPTIONS = [
  { label: "Hoạt động", value: "ACTIVE" },
  { label: "Đã lên lịch", value: "SCHEDULED" },
  { label: "Hoàn thành", value: "COMPLETE" },
];

export default function PlanDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [planDetail, setPlanDetail] = useState<PlanDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  useEffect(() => {
    const fetchPlanDetail = async () => {
      try {
        setLoading(true);
        const data = await planService.getPlanDetail(id);
        setPlanDetail(data);
        setSelectedStatus(data.status || "");
      } catch (error) {
        console.error("Lỗi lấy chi tiết lịch trình:", error);
        message.error("Không lấy được chi tiết lịch trình");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPlanDetail();
    }
  }, [id]);

  const handleUpdateStatus = async () => {
    if (!id || !selectedStatus) {
      message.warning("Vui lòng chọn trạng thái");
      return;
    }

    try {
      setUpdatingStatus(true);
      const updatedPlan = await planService.updatePlanStatus(id, {
        status: selectedStatus,
      });

      setPlanDetail((prev) =>
        prev
          ? {
              ...prev,
              ...updatedPlan,
              status: updatedPlan.status,
            }
          : updatedPlan,
      );

      setSelectedStatus(updatedPlan.status);
      message.success("Cập nhật trạng thái thành công");
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái:", error);
      message.error("Không cập nhật được trạng thái lịch trình");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const orderedStations = useMemo(() => {
    if (!planDetail?.stations) return [];
    return [...planDetail.stations].sort((a, b) => a.stationOrder - b.stationOrder);
  }, [planDetail]);

  const fromOffice = orderedStations[0]?.stationName || "Chưa có dữ liệu";
  const toOffice = orderedStations[orderedStations.length - 1]?.stationName || "Chưa có dữ liệu";

  const route =
    orderedStations.length >= 2 ? `${fromOffice} - ${toOffice}` : "Chưa có dữ liệu hành trình";

  const departureDate = planDetail?.startTime
    ? new Date(planDetail.startTime).toLocaleDateString("vi-VN")
    : "--/--/----";

  const departureTime = planDetail?.startTime
    ? new Date(planDetail.startTime).toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "--:--";

  const normalizedStatus = (planDetail?.status || "").toUpperCase();

  const statusConfig = (() => {
    switch (normalizedStatus) {
      case "ACTIVE":
        return {
          text: "Hoạt động",
          className:
            "!m-0 !w-fit !rounded-full !bg-[#DDFBE6] !px-4 !py-[6px] !text-[14px] !font-semibold !text-[#16A34A]",
        };
      case "SCHEDULED":
        return {
          text: "Đã lên lịch",
          className:
            "!m-0 !w-fit !rounded-full !bg-[#EFF8FF] !px-4 !py-[6px] !text-[14px] !font-semibold !text-[#1570EF]",
        };
      case "COMPLETE":
        return {
          text: "Hoàn thành",
          className:
            "!m-0 !w-fit !rounded-full !bg-[#F2F4F7] !px-4 !py-[6px] !text-[14px] !font-semibold !text-[#344054]",
        };
      default:
        return {
          text: planDetail?.status || "Không xác định",
          className:
            "!m-0 !w-fit !rounded-full !bg-[#F2F4F7] !px-4 !py-[6px] !text-[14px] !font-semibold !text-[#344054]",
        };
    }
  })();

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!planDetail) {
    return (
      <div className="w-full">
        <div className="rounded-[18px] border border-[#DDE3EA] bg-white p-8 text-center shadow-sm">
          <p className="text-[18px] font-semibold text-[#101828]">Không có dữ liệu lịch trình</p>
          <Button
            onClick={() => router.back()}
            className="!mt-4 !h-[44px] !rounded-xl !border-0 !bg-[#0F172A] !px-6 !font-semibold !text-white hover:!bg-[#1E293B]"
          >
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[#D0D5DD] bg-white text-[#344054] shadow-sm transition hover:bg-[#F9FAFB]"
          >
            <ArrowLeftOutlined className="text-[18px]" />
          </button>

          <div>
            <h1 className="text-[24px] font-extrabold uppercase leading-tight text-[#101828] md:text-[36px]">
              Chi tiết lịch trình
            </h1>
            <p className="mt-1 text-[16px] text-[#667085]">
              Mã vận đơn: <span className="font-semibold text-[#1570EF]">{planDetail.code}</span>
            </p>
          </div>
        </div>

        <Button
          onClick={() => router.back()}
          className="!h-[44px] !rounded-xl !border-0 !bg-[#0F172A] !px-6 !font-semibold !text-white hover:!bg-[#1E293B]"
        >
          Đóng
        </Button>
      </div>

      <div className="mb-6 rounded-[18px] border border-[#DDE3EA] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-[13px] font-bold uppercase tracking-wide text-[#1570EF]">
              Cập nhật trạng thái lịch trình
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Select
                value={selectedStatus}
                onChange={setSelectedStatus}
                options={STATUS_OPTIONS}
                className="w-full sm:w-[220px]"
                size="large"
              />
              <Button
                type="primary"
                size="large"
                loading={updatingStatus}
                onClick={handleUpdateStatus}
                className="!border-0 !bg-[#1570EF] !font-semibold hover:!bg-[#175CD3]"
              >
                Cập nhật trạng thái
              </Button>
            </div>
          </div>

          <div>
            <p className="mb-2 text-[13px] font-bold uppercase tracking-wide text-[#98A2B3]">
              Trạng thái hiện tại
            </p>
            <Tag bordered={false} className={statusConfig.className}>
              ● {statusConfig.text}
            </Tag>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <div className="overflow-hidden rounded-[18px] border border-[#DDE3EA] bg-white shadow-sm">
            <div className="h-[6px] w-full bg-[#1570EF]" />

            <div className="p-6">
              <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="mb-2 text-[13px] font-bold uppercase tracking-wide text-[#1570EF]">
                    Hành trình
                  </p>
                  <h2 className="text-[24px] font-extrabold text-[#101828]">{route}</h2>
                </div>

                <Tag bordered={false} className={statusConfig.className}>
                  ● {statusConfig.text}
                </Tag>
              </div>

              <div className="grid grid-cols-1 gap-6 border-b border-dashed border-[#D0D5DD] pb-6 md:grid-cols-2">
                <div className="flex items-start gap-3">
                  <div className="mt-1 text-[#1570EF]">
                    <ClockCircleOutlined className="text-[20px]" />
                  </div>

                  <div>
                    <p className="mb-1 text-[13px] font-semibold uppercase text-[#98A2B3]">
                      Giờ xuất phát
                    </p>
                    <p className="text-[18px] font-bold text-[#101828]">{departureTime}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 text-[#1570EF]">
                    <CalendarOutlined className="text-[20px]" />
                  </div>

                  <div>
                    <p className="mb-1 text-[13px] font-semibold uppercase text-[#98A2B3]">
                      Ngày khởi hành
                    </p>
                    <p className="text-[18px] font-bold text-[#101828]">{departureDate}</p>
                  </div>
                </div>
              </div>

              <div className="pt-8">
                <div className="flex flex-col items-center justify-between gap-5 md:flex-row">
                  <div className="text-[20px] font-semibold text-[#1D2939]">{fromOffice}</div>

                  <div className="flex w-full max-w-[260px] items-center gap-3">
                    <div className="h-[2px] flex-1 bg-[#DDE3EA]" />
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#BFDBFE] bg-[#EFF8FF] text-[#1570EF]">
                      <CarOutlined className="text-[16px]" />
                    </div>
                    <div className="h-[2px] flex-1 bg-[#DDE3EA]" />
                  </div>

                  <div className="text-[20px] font-semibold text-[#1D2939]">{toOffice}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-[18px] border border-[#DDE3EA] bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#1570EF]">
                  <CarOutlined className="text-[24px]" />
                </div>

                <div>
                  <p className="text-[13px] font-bold uppercase text-[#98A2B3]">Thông tin xe</p>
                  <h3 className="mt-1 text-[20px] font-extrabold text-[#101828]">
                    Xe #{planDetail.carId}
                  </h3>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[16px] text-[#667085]">Biển số</span>
                  <span className="rounded-lg bg-[#F2F4F7] px-3 py-2 text-[16px] font-bold text-[#344054]">
                    {planDetail.carLicensePlate}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-[16px] text-[#667085]">Tiện ích</span>
                  <div className="flex items-center gap-3 text-[#98A2B3]">
                    <Image src="/icons/wifi.svg" alt="wifi" width={18} height={18} />
                    <Image src="/icons/snow.svg" alt="snow" width={18} height={18} />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-[16px] text-[#667085]">Số ghế</span>
                  <span className="text-[16px] font-semibold text-[#101828]">
                    {planDetail.seats?.length || 0} ghế
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-[18px] border border-[#DDE3EA] bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF7ED] text-[#EA580C]">
                  <UserOutlined className="text-[24px]" />
                </div>

                <div>
                  <p className="text-[13px] font-bold uppercase text-[#98A2B3]">Tài xế</p>
                  <h3 className="mt-1 text-[20px] font-extrabold text-[#101828]">
                    {planDetail.driverName}
                  </h3>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[16px] text-[#667085]">Số điện thoại</span>
                  <span className="flex items-center gap-2 text-[16px] font-semibold text-[#1570EF]">
                    <PhoneOutlined />
                    Chưa có dữ liệu
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-[16px] text-[#667085]">Mã tài xế</span>
                  <span className="text-[16px] font-semibold text-[#101828]">
                    #{planDetail.accountId}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-[18px] border border-[#DDE3EA] bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-[20px] font-extrabold text-[#101828]">Danh sách điểm dừng</h3>

            <div className="space-y-3">
              {orderedStations.length > 0 ? (
                orderedStations.map((station) => (
                  <div
                    key={station.stationId}
                    className="flex items-center justify-between rounded-xl border border-[#EAECF0] bg-[#FCFCFD] px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EFF8FF] text-[14px] font-bold text-[#1570EF]">
                        {station.stationOrder}
                      </div>
                      <span className="text-[16px] font-medium text-[#101828]">
                        {station.stationName}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-[#667085]">Chưa có danh sách điểm dừng</p>
              )}
            </div>
          </div>
        </div>

        <div className="xl:col-span-4">
          <div className="flex h-[235px] items-center justify-center rounded-[18px] bg-[#06112B] p-5 shadow-[0_16px_40px_rgba(2,6,23,0.18)]">
            <div className="flex h-full w-full items-center justify-center rounded-[12px] bg-white">
              <div className="px-4 text-center text-[16px] font-medium text-[#98A2B3]">
                Khu vực sơ đồ / hình ảnh xe
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-[18px] border border-[#DDE3EA] bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-[20px] font-extrabold text-[#101828]">Danh sách ghế</h3>

            <div className="grid grid-cols-4 gap-3">
              {planDetail.seats && planDetail.seats.length > 0 ? (
                planDetail.seats.map((seat) => (
                  <div
                    key={seat.seatId}
                    className="rounded-xl border border-[#EAECF0] bg-[#FCFCFD] px-3 py-3 text-center"
                  >
                    <div className="text-[14px] font-bold text-[#101828]">{seat.seatNumber}</div>
                    <div className="mt-1 text-[12px] text-[#667085]">{seat.status}</div>
                  </div>
                ))
              ) : (
                <p className="col-span-4 text-[#667085]">Chưa có dữ liệu ghế</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
