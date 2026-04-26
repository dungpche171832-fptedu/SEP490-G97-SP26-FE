"use client";
import { useEffect, useState } from "react";
import { Button, Card, DatePicker, Input, Select, message } from "antd";
import { InfoCircleOutlined, CarOutlined, SwapOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import dayjs, { type Dayjs } from "dayjs";
import type { Account } from "@/model/account";
import type { Car } from "@/model/car";
import type { RouteResponse } from "@/model/route";
import type { CreatePlanPayload } from "@/model/plan";
import { planService } from "@/services/planService";
import { getDriversByCurrentManagerBranch, getAccountInfo } from "@/services/accountService";
import { getCarsByCurrentManagerBranch } from "@/services/carService";
import { getRoutes, getRouteDetail } from "@/services/routeService";

export default function CreatePlanPage() {
  const router = useRouter();

  const [planCode] = useState(() => `VT-${dayjs().format("YYYYMMDDHHmmss")}`);

  const [drivers, setDrivers] = useState<Account[]>([]);
  const [driverLoading, setDriverLoading] = useState(false);

  const [cars, setCars] = useState<Car[]>([]);
  const [carLoading, setCarLoading] = useState(false);

  const [routes, setRoutes] = useState<RouteResponse[]>([]);
  const [routeLoading, setRouteLoading] = useState(false);

  const [selectedDepartureRoute, setSelectedDepartureRoute] = useState<RouteResponse | null>(null);

  const [selectedReturnRoute, setSelectedReturnRoute] = useState<RouteResponse | null>(null);

  const [returnRouteLoading, setReturnRouteLoading] = useState(false);

  const [selectedDriverId, setSelectedDriverId] = useState<number | null>(null);
  const [selectedCarId, setSelectedCarId] = useState<number | null>(null);

  const [departureTime, setDepartureTime] = useState<Dayjs | null>(null);
  const [returnStartTime, setReturnStartTime] = useState<Dayjs | null>(null);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        setDriverLoading(true);

        const data = await getDriversByCurrentManagerBranch();
        setDrivers(data);
      } catch (error: unknown) {
        console.error(error);
        message.error("Không thể tải danh sách tài xế");
      } finally {
        setDriverLoading(false);
      }
    };

    fetchDrivers();
  }, []);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        setCarLoading(true);

        const data = await getCarsByCurrentManagerBranch();
        setCars(data);
      } catch (error: unknown) {
        console.error(error);
        message.error("Không thể tải danh sách xe");
      } finally {
        setCarLoading(false);
      }
    };

    fetchCars();
  }, []);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        setRouteLoading(true);

        const data = await getRoutes();
        setRoutes(data);
      } catch (error: unknown) {
        console.error(error);
        message.error("Không thể tải danh sách tuyến đường");
      } finally {
        setRouteLoading(false);
      }
    };

    fetchRoutes();
  }, []);

  const handleDepartureRouteChange = async (routeId: number) => {
    try {
      setRouteLoading(true);
      setReturnRouteLoading(true);
      setSelectedDepartureRoute(null);
      setSelectedReturnRoute(null);

      const departureRoute = await getRouteDetail(routeId);
      setSelectedDepartureRoute(departureRoute);

      if (!departureRoute.routeRevertId) {
        message.warning("Tuyến đường này chưa có chiều về");
        return;
      }

      const returnRoute = await getRouteDetail(departureRoute.routeRevertId);
      setSelectedReturnRoute(returnRoute);
    } catch (error: unknown) {
      console.error(error);
      message.error("Không thể tải chi tiết tuyến đường");
    } finally {
      setRouteLoading(false);
      setReturnRouteLoading(false);
    }
  };

  const mainRoutes = routes.filter((route) => {
    const code = route.code.toUpperCase();
    const name = route.name.toLowerCase();

    return !code.endsWith("_R") && !name.includes("reverse");
  });

  const departureStationNames =
    selectedDepartureRoute?.stations
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((station) => station.stationName) || [];

  const returnStationNames =
    selectedReturnRoute?.stations
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((station) => station.stationName) || [];

  const handleSavePlan = async () => {
    try {
      if (!selectedDriverId) {
        message.error("Vui lòng chọn tài xế");
        return;
      }

      if (!selectedCarId) {
        message.error("Vui lòng chọn xe");
        return;
      }

      if (!selectedDepartureRoute) {
        message.error("Vui lòng chọn tuyến đường chiều đi");
        return;
      }

      if (!selectedReturnRoute) {
        message.error("Không tìm thấy tuyến đường chiều về");
        return;
      }

      if (!departureTime) {
        message.error("Vui lòng chọn thời gian xuất phát chiều đi");
        return;
      }

      if (!returnStartTime) {
        message.error("Vui lòng chọn thời gian xuất phát chiều về");
        return;
      }

      if (returnStartTime.isBefore(departureTime)) {
        message.error("Thời gian xuất phát về phải sau thời gian xuất phát chiều đi");
        return;
      }

      setSaving(true);

      const currentAccount = await getAccountInfo();

      const payload: CreatePlanPayload = {
        code: planCode,
        routeId: selectedDepartureRoute.id,
        carId: selectedCarId,
        accountId: selectedDriverId,
        branchId: currentAccount.branchId,
        startTime: departureTime.toISOString(),
        returnStartTime: returnStartTime.toISOString(),
        status: "ACTIVE",
      };

      await planService.createPlan(payload);

      message.success("Tạo lịch trình thành công");
      router.push("/admin/managePlan");
    } catch (error: unknown) {
      console.error(error);
      message.error("Tạo lịch trình thất bại");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FC] px-7 py-6">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="mb-2 text-sm font-medium text-[#667085]">
            Quản lý <span className="mx-1">/</span> Lịch trình <span className="mx-1">/</span> Tạo
            mới
          </div>

          <h1 className="text-[32px] font-extrabold leading-tight text-[#1D2939]">
            Tạo Lịch Trình Mới
          </h1>
        </div>

        <div className="flex gap-3">
          <Button
            className="h-12 min-w-[82px] rounded-xl border-[#D0D5DD] text-[15px] font-semibold"
            onClick={() => router.back()}
          >
            Hủy
          </Button>

          <Button
            type="primary"
            loading={saving}
            onClick={handleSavePlan}
            className="h-12 min-w-[152px] rounded-xl bg-[#1677FF] text-[15px] font-semibold shadow-none"
          >
            Lưu lịch trình
          </Button>
        </div>
      </div>

      {/* Thông tin chung */}
      <section className="mb-9">
        <div className="mb-4 flex items-center gap-2">
          <InfoCircleOutlined className="text-[20px] text-[#1677FF]" />
          <h2 className="text-[20px] font-bold text-[#1D2939]">Thông tin chung</h2>
        </div>

        <Card className="rounded-2xl border-0 shadow-[0_16px_45px_rgba(16,24,40,0.06)]">
          <div className="grid grid-cols-1 gap-7 md:grid-cols-2 xl:grid-cols-3">
            <div>
              <Label required>Mã lịch trình</Label>
              <Input
                value={planCode}
                readOnly
                className="h-11 rounded-xl border-none bg-[#F2F4F7] text-[#667085]"
              />
            </div>

            <div>
              <Label required>Tài xế</Label>
              <Select
                value={selectedDriverId}
                placeholder="Chọn tài xế..."
                className="h-11 w-full"
                loading={driverLoading}
                onChange={(value: number) => setSelectedDriverId(value)}
                options={drivers.map((driver) => ({
                  label: driver.fullName,
                  value: driver.accountId,
                }))}
              />
            </div>

            <div>
              <Label required>Xe</Label>
              <Select
                value={selectedCarId}
                placeholder="Chọn xe..."
                className="h-11 w-full"
                loading={carLoading}
                onChange={(value: number) => setSelectedCarId(value)}
                options={cars.map((car) => ({
                  label: `${car.licensePlate} - ${car.carType}`,
                  value: car.id,
                }))}
              />
            </div>
          </div>
        </Card>
      </section>

      {/* Chiều đi + Chiều về */}
      <section className="grid grid-cols-1 gap-9 xl:grid-cols-2">
        {/* Chiều đi */}
        <TripCard
          type="go"
          title="Chiều Đi"
          icon={<CarOutlined />}
          routeLabel="Tuyến đường"
          routeValue={selectedDepartureRoute?.id}
          routeName={selectedDepartureRoute?.name || ""}
          stations={departureStationNames}
          timeLabel="Thời gian xuất phát"
          routeLoading={routeLoading}
          routeOptions={mainRoutes.map((route) => ({
            label: route.name,
            value: route.id,
          }))}
          onRouteChange={handleDepartureRouteChange}
          timeValue={departureTime}
          onTimeChange={setDepartureTime}
        />

        <TripCard
          type="return"
          title="Chiều Về"
          icon={<SwapOutlined />}
          routeLabel="Tuyến đường về"
          routeName={selectedReturnRoute?.name || ""}
          stations={returnStationNames}
          timeLabel="Thời gian xuất phát về"
          routeLoading={returnRouteLoading}
          timeValue={returnStartTime}
          onTimeChange={setReturnStartTime}
          auto
        />
      </section>

      {}
      <div className="mt-28 h-[160px] rounded-2xl bg-white shadow-[0_16px_45px_rgba(16,24,40,0.05)]" />
    </div>
  );
}

function Label({ children, required = false }: { children: React.ReactNode; required?: boolean }) {
  return (
    <div className="mb-2 text-xs font-extrabold uppercase tracking-[0.08em] text-[#667085]">
      {children} {required && <span className="text-[#F04438]">*</span>}
    </div>
  );
}

function TripCard({
  type,
  title,
  icon,
  routeLabel,
  routeValue,
  routeName,
  stations,
  timeLabel,
  routeOptions = [],
  routeLoading = false,
  onRouteChange,
  timeValue,
  onTimeChange,
  auto = false,
}: {
  type: "go" | "return";
  title: string;
  icon: React.ReactNode;
  routeLabel: string;
  routeValue?: number;
  routeName: string;
  stations: string[];
  timeLabel: string;
  timeValue: Dayjs | null;
  onTimeChange: (value: Dayjs | null) => void;
  routeOptions?: {
    label: string;
    value: number;
  }[];
  routeLoading?: boolean;
  onRouteChange?: (routeId: number) => void;
  auto?: boolean;
}) {
  const isGo = type === "go";

  const mainColor = isGo ? "#1677FF" : "#12B76A";
  const headerBg = isGo ? "#EEF6FF" : "#ECFDF3";
  const stationBg = isGo ? "#EEF8FF" : "#ECFDF3";

  return (
    <Card
      className="overflow-hidden rounded-2xl border-0 shadow-[0_16px_45px_rgba(16,24,40,0.06)]"
      styles={{
        body: {
          padding: 0,
        },
      }}
    >
      <div className="flex min-h-[390px]">
        <div
          className="w-1"
          style={{
            backgroundColor: mainColor,
          }}
        />

        <div className="flex-1">
          <div
            className="flex h-[58px] items-center gap-3 px-6"
            style={{
              backgroundColor: headerBg,
            }}
          >
            <span
              className="flex h-7 w-7 items-center justify-center rounded-lg text-white"
              style={{
                backgroundColor: mainColor,
              }}
            >
              {icon}
            </span>

            <span className="text-[17px] font-extrabold text-[#1D2939]">{title}</span>
          </div>

          <div className="p-7">
            <div className="mb-6">
              <div className="mb-2 flex items-center justify-between">
                <Label required={!auto}>{routeLabel}</Label>
              </div>

              {auto ? (
                <Input
                  value={routeName}
                  readOnly
                  placeholder="Tự động theo chiều đi"
                  className="h-11 rounded-xl border-none bg-[#EAF6FF] text-[#475467]"
                />
              ) : (
                <Select
                  value={routeValue}
                  placeholder="Chọn tuyến đường"
                  className="h-11 w-full"
                  loading={routeLoading}
                  options={routeOptions}
                  onChange={(value: number) => {
                    onRouteChange?.(value);
                  }}
                />
              )}
            </div>

            <div className="mb-6">
              <div className="mb-2 flex items-center justify-between">
                <Label>Điểm dừng trên tuyến</Label>
              </div>

              <div
                className="rounded-xl px-4 py-4"
                style={{
                  backgroundColor: stationBg,
                }}
              >
                {stations.length === 0 ? (
                  <div className="text-sm font-medium text-[#98A2B3]">Chưa có điểm dừng</div>
                ) : (
                  <div className="space-y-3">
                    {stations.map((station, index) => {
                      const dotColor = "#1677FF";

                      return (
                        <div key={`${station}-${index}`} className="flex items-center gap-3">
                          <span
                            className="flex h-4 w-4 items-center justify-center rounded-full border-2 bg-white"
                            style={{
                              borderColor: dotColor,
                              color: dotColor,
                            }}
                          >
                            <span
                              className="h-1.5 w-1.5 rounded-full"
                              style={{
                                backgroundColor: dotColor,
                              }}
                            />
                          </span>

                          <span className="text-sm font-medium text-[#344054]">{station}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label required>{timeLabel}</Label>
              <DatePicker
                value={timeValue}
                onChange={onTimeChange}
                showTime
                format="DD/MM/YYYY, HH:mm"
                placeholder="dd/mm/yyyy, --:--"
                className="h-11 w-full rounded-xl border-none bg-[#F2F4F7]"
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
