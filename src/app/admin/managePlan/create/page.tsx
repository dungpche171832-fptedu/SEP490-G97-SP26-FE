"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, DatePicker, Input, Select, Space, message } from "antd";
import { getCars, type Car } from "@/services/carService";
import { getAccounts } from "@/services/accountService";
import { getStations, type Station } from "@/services/station.service";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  InfoCircleOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import type { CreatePlanPayload } from "@/services/planService";
import { planService } from "@/services/planService";

type StationFormItem = {
  stationOrder: number;
  stationId?: number;
  stationName: string;
};
type DriverAccount = {
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  accountId: number;
  password: string;
  fullName: string;
  email: string;
  phone: string;
  role: {
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    roleId: number;
    name: string;
  };
  branchId: number;
  status: string;
};

type AccountApiResponse = {
  accounts?: DriverAccount[];
  data?: DriverAccount[];
  result?: DriverAccount[];
};

const getBranchIdFromToken = (): number | undefined => {
  if (typeof window === "undefined") return undefined;

  const token = localStorage.getItem("token");
  if (!token) return undefined;

  try {
    const payloadBase64 = token.split(".")[1];
    const payloadJson = atob(payloadBase64);
    const payload = JSON.parse(payloadJson);
    // console.log("TOKEN PAYLOAD:", payload);

    const branchId = payload.branchId ?? payload.branchID ?? payload.branch_id;

    if (branchId === undefined || branchId === null) return undefined;

    return Number(branchId);
  } catch (error) {
    console.error("Không đọc được branchId từ token:", error);
    return undefined;
  }
};
export default function CreatePlanPage() {
  const router = useRouter();

  const [code, setCode] = useState("LT-2026-001");
  const [status, setStatus] = useState("ACTIVE");
  const [carId, setCarId] = useState<number | undefined>(undefined);
  const [accountId, setAccountId] = useState<number | undefined>(undefined);
  const [startTime, setStartTime] = useState<Dayjs | null>(null);
  const [endTime, setEndTime] = useState<Dayjs | null>(null);
  const [cars, setCars] = useState<Car[]>([]);
  const [carsLoading, setCarsLoading] = useState(false);
  const [drivers, setDrivers] = useState<DriverAccount[]>([]);
  const [driversLoading, setDriversLoading] = useState(false);
  // const [stationOptionsData, setStationOptionsData] = useState<any[]>([]);
  const [stationOptionsData, setStationOptionsData] = useState<Station[]>([]);
  const [stationsLoading, setStationsLoading] = useState(false);
  const [stations, setStations] = useState<StationFormItem[]>([
    { stationOrder: 1, stationId: undefined, stationName: "" },
    { stationOrder: 2, stationId: undefined, stationName: "" },
  ]);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        setCarsLoading(true);

        const branchId = getBranchIdFromToken();
        const response = await getCars(branchId);

        setCars(response.cars || []);
      } catch (error) {
        console.error("Lỗi lấy danh sách xe:", error);
        message.error("Không tải được danh sách xe");
      } finally {
        setCarsLoading(false);
      }
    };

    fetchCars();
  }, []);

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        setDriversLoading(true);

        const branchId = getBranchIdFromToken();
        const response = (await getAccounts()) as AccountApiResponse;

        const accounts: DriverAccount[] =
          response.accounts ?? response.data ?? response.result ?? [];

        const filteredDrivers = accounts.filter((item) => {
          const roleName = String(item.role?.name || "").toLowerCase();
          const itemBranchId = item.branchId;

          return roleName === "staff" && Number(itemBranchId) === Number(branchId);
        });

        setDrivers(filteredDrivers);
      } catch (error) {
        console.error("Lỗi lấy danh sách tài xế:", error);
        message.error("Không tải được danh sách tài xế");
      } finally {
        setDriversLoading(false);
      }
    };

    fetchDrivers();
  }, []);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        setStationsLoading(true);
        const response = await getStations();
        setStationOptionsData(response.stations || []);
      } catch (error) {
        console.error("Lỗi lấy danh sách trạm:", error);
        message.error("Không tải được danh sách trạm");
      } finally {
        setStationsLoading(false);
      }
    };

    fetchStations();
  }, []);
  const carOptions = cars.map((car) => ({
    value: car.id,
    label: `${car.licensePlate} - ${car.branch?.name || "Không rõ chi nhánh"}`,
  }));
  const driverOptions = drivers.map((driver) => ({
    value: driver.accountId,
    label: `${driver.fullName} - ${driver.email}`,
  }));
  const stationOptions = stationOptionsData.map((station) => ({
    value: station.id,
    label: `${station.name} - ${station.cityName}`,
  }));
  const [submitting, setSubmitting] = useState(false);

  const durationText = useMemo(() => {
    if (!startTime || !endTime) return "Chưa xác định";

    const diffMinutes = dayjs(endTime).diff(dayjs(startTime), "minute");
    if (diffMinutes <= 0) return "Chưa xác định";

    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;

    if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h`;
    return `${minutes}m`;
  }, [startTime, endTime]);

  const handleStationChange = (index: number, stationId: number) => {
    const selectedStation = stationOptionsData.find((item) => item.id === stationId);

    setStations((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              stationId,
              stationName: selectedStation?.name || "",
            }
          : item,
      ),
    );
  };

  const handleAddStation = () => {
    setStations((prev) => [
      ...prev,
      {
        stationOrder: prev.length + 1,
        stationName: "",
      },
    ]);
  };

  const handleRemoveStation = (index: number) => {
    const updated = stations
      .filter((_, i) => i !== index)
      .map((item, i) => ({
        ...item,
        stationOrder: i + 1,
      }));

    setStations(updated);
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      message.error("Vui lòng nhập mã lịch trình");
      return;
    }

    if (carId == null) {
      message.error("Vui lòng chọn xe");
      return;
    }

    if (accountId == null) {
      message.error("Vui lòng chọn tài xế");
      return;
    }

    if (!startTime || !endTime) {
      message.error("Vui lòng chọn thời gian khởi hành và kết thúc");
      return;
    }

    const validStations = stations.filter(
      (item) => item.stationId !== undefined && item.stationId !== null,
    );

    if (validStations.length < 2) {
      message.error("Cần ít nhất 2 trạm dừng");
      return;
    }

    const payload: CreatePlanPayload = {
      code: code.trim(),
      carId,
      accountId,
      startTime: dayjs(startTime).format("YYYY-MM-DDTHH:mm:ss"),
      endTime: dayjs(endTime).format("YYYY-MM-DDTHH:mm:ss"),
      status,
      stations: validStations.map((item, index) => ({
        stationId: item.stationId as number,
        stationOrder: index + 1,
      })),
    };

    try {
      setSubmitting(true);
      console.log("CREATE PLAN PAYLOAD:", payload);
      await planService.createPlan(payload);
      message.success("Tạo lịch trình thành công");
      router.push("/admin/managePlan");
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : "Không thể tạo lịch trình";
      message.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl pb-10">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-sm text-slate-400">Quản lý &gt; Lịch trình &gt; Tạo mới</p>
          <div className="flex items-center gap-3">
            <CalendarOutlined className="text-2xl text-blue-600" />
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-800">
              Tạo Lịch Trình Mới
            </h1>
          </div>
        </div>

        <Space>
          <Button
            className="h-11 rounded-xl px-6 font-semibold"
            onClick={() => router.push("/admin/managePlan")}
          >
            Hủy
          </Button>
          <Button
            type="primary"
            loading={submitting}
            onClick={handleSubmit}
            className="h-11 rounded-xl bg-blue-600 px-6 font-bold shadow"
          >
            Lưu lịch trình
          </Button>
        </Space>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_0.95fr]">
        <div className="space-y-6">
          <Card className="rounded-3xl border-0 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <InfoCircleOutlined className="text-xl text-blue-600" />
              <h2 className="text-3xl font-extrabold text-slate-800">Thông tin cơ bản</h2>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-bold uppercase tracking-wide text-slate-500">
                  Mã lịch trình *
                </label>
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="h-12 rounded-xl"
                  placeholder="LT-2026-001"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold uppercase tracking-wide text-slate-500">
                  Trạng thái *
                </label>
                <Select
                  value={status}
                  onChange={setStatus}
                  className="w-full"
                  size="large"
                  options={[
                    { value: "ACTIVE", label: "Chuẩn bị hoạt động" },
                    { value: "SCHEDULED", label: "Đã lên lịch" },
                    { value: "COMPLETE", label: "Hoàn thành" },
                  ]}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold uppercase tracking-wide text-slate-500">
                  Xe *
                </label>
                <Select
                  value={carId}
                  onChange={setCarId}
                  className="w-full"
                  size="large"
                  placeholder="Chọn xe"
                  loading={carsLoading}
                  options={carOptions}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold uppercase tracking-wide text-slate-500">
                  Tài khoản lái xe *
                </label>
                <Select
                  value={accountId}
                  onChange={setAccountId}
                  className="w-full"
                  size="large"
                  placeholder="Chọn tài xế"
                  loading={driversLoading}
                  options={driverOptions}
                />
              </div>
            </div>
          </Card>

          <Card className="rounded-3xl border-0 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <ClockCircleOutlined className="text-xl text-blue-600" />
              <h2 className="text-3xl font-extrabold text-slate-800">Thời gian</h2>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-bold uppercase tracking-wide text-slate-500">
                  Ngày &amp; giờ khởi hành *
                </label>
                <DatePicker
                  showTime
                  value={startTime}
                  onChange={setStartTime}
                  className="h-12 w-full rounded-xl"
                  format="DD/MM/YYYY HH:mm"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold uppercase tracking-wide text-slate-500">
                  Ngày &amp; giờ kết thúc *
                </label>
                <DatePicker
                  showTime
                  value={endTime}
                  onChange={setEndTime}
                  className="h-12 w-full rounded-xl"
                  format="DD/MM/YYYY HH:mm"
                />
              </div>
            </div>

            <div className="mt-8 rounded-2xl bg-blue-50 p-5">
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-slate-700">Tổng thời gian di chuyển:</span>
                <span className="text-3xl font-extrabold text-blue-700">{durationText}</span>
              </div>
            </div>
          </Card>
        </div>

        <div>
          <Card className="rounded-3xl border-0 shadow-sm">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <EnvironmentOutlined className="text-xl text-blue-600" />
                <h2 className="text-3xl font-extrabold leading-tight text-slate-800">
                  Hành trình &amp; Trạm dừng
                </h2>
              </div>

              <Button
                type="link"
                icon={<PlusCircleOutlined />}
                onClick={handleAddStation}
                className="font-bold"
              >
                Thêm trạm
              </Button>
            </div>

            <div className="space-y-4">
              {stations.map((station, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm"
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                      Trạm {index + 1}
                    </span>

                    {stations.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveStation(index)}
                        className="text-sm font-semibold text-red-500"
                      >
                        Xóa
                      </button>
                    )}
                  </div>

                  <Select
                    value={station.stationId}
                    onChange={(value) => handleStationChange(index, value)}
                    placeholder={`Chọn trạm ${index + 1}`}
                    className="w-full"
                    size="large"
                    loading={stationsLoading}
                    options={stationOptions}
                  />
                </div>
              ))}

              <div className="mt-6 overflow-hidden rounded-2xl">
                <div className="flex h-52 items-end bg-[linear-gradient(180deg,#E8EEF8_0%,#DCE7F5_100%)] p-5 text-slate-500">
                  <span className="text-sm font-semibold">Xem bản đồ chi tiết</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="mt-10 flex items-center justify-between border-t border-slate-200 pt-6">
        <span className="text-sm text-slate-400">* Các trường có dấu sao là bắt buộc</span>

        <Space>
          <Button
            className="h-11 rounded-xl px-6 font-semibold"
            onClick={() => router.push("/admin/managePlan")}
          >
            Hủy
          </Button>
          <Button
            type="primary"
            loading={submitting}
            onClick={handleSubmit}
            className="h-11 rounded-xl bg-blue-600 px-8 font-bold shadow"
          >
            Lưu lịch trình
          </Button>
        </Space>
      </div>
    </div>
  );
}
