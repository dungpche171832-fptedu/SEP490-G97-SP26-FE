"use client";

import {
  ArrowLeftOutlined,
  CalendarOutlined,
  CarOutlined,
  PhoneOutlined,
  UserOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { Button, Tag, Spin, Select, message, Modal } from "antd";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { planService } from "@/services/planService";
import { getCars } from "@/services/carService";
import { getAccountInfo } from "@/services/accountService";
import type {
  PlanDetailResponse,
  PlanStationResponse,
  PlanSeatResponse,
  PlanStatus,
} from "@/model/plan";
import type { Account, AccountResponse } from "@/model/account";
import type { Car, CarListResponse } from "@/model/car";
import { getRole } from "@/lib/auth/auth.service";

const STATUS_OPTIONS: { label: string; value: PlanStatus }[] = [
  { label: "Hoạt động", value: "ACTIVE" },
  { label: "Đang chạy", value: "RUNNING" },
  { label: "Hoàn thành", value: "COMPLETE" },
  { label: "Không hoạt động", value: "INACTIVE" },
];

function formatDate(value?: string): string {
  if (!value) return "--/--/----";

  const datePart = value.split("T")[0];

  if (!datePart) return "--/--/----";

  const [year, month, day] = datePart.split("-");

  if (!year || !month || !day) return "--/--/----";

  return `${day}/${month}/${year}`;
}

function formatTime(value?: string): string {
  if (!value) return "--:--";

  const timePart = value.split("T")[1];

  if (!timePart) return "--:--";

  return timePart.slice(0, 5);
}

function getSortedStations(stations?: PlanStationResponse[]): PlanStationResponse[] {
  return [...(stations || [])].sort((a, b) => a.order - b.order);
}

function getStatusLabel(status?: string): string {
  switch (status) {
    case "ACTIVE":
      return "Hoạt động";
    case "INACTIVE":
      return "Không hoạt động";
    case "RUNNING":
      return "Đang chạy";
    case "COMPLETE":
      return "Hoàn thành";
    default:
      return status || "Không xác định";
  }
}

function getStatusClassName(status?: string): string {
  switch (status) {
    case "ACTIVE":
      return "!m-0 !w-fit !rounded-full !bg-[#DDFBE6] !px-4 !py-[6px] !text-[14px] !font-semibold !text-[#16A34A]";
    case "RUNNING":
      return "!m-0 !w-fit !rounded-full !bg-[#EFF8FF] !px-4 !py-[6px] !text-[14px] !font-semibold !text-[#1570EF]";
    case "COMPLETE":
      return "!m-0 !w-fit !rounded-full !bg-[#F2F4F7] !px-4 !py-[6px] !text-[14px] !font-semibold !text-[#344054]";
    case "INACTIVE":
      return "!m-0 !w-fit !rounded-full !bg-[#FFF1F0] !px-4 !py-[6px] !text-[14px] !font-semibold !text-[#F5222D]";
    default:
      return "!m-0 !w-fit !rounded-full !bg-[#F2F4F7] !px-4 !py-[6px] !text-[14px] !font-semibold !text-[#344054]";
  }
}
const CHANGE_CAR_STATUS_OPTIONS = ["RUNNING", "STOP", "ACTIVE", "AVAILABLE"];

function normalizeRoleName(roleName?: string): string {
  return (roleName || "").replace("ROLE_", "").toLowerCase().trim();
}

function normalizeStatus(status?: string): string {
  return (status || "").toUpperCase().trim();
}

async function getCurrentManagerBranchId(): Promise<number> {
  const currentAccount = await getAccountInfo();
  const managerBranchId = Number(currentAccount.branchId);

  if (Number.isNaN(managerBranchId)) {
    throw new Error("Tài khoản Manager chưa có branchId hợp lệ");
  }

  return managerBranchId;
}

export default function PlanDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [planDetail, setPlanDetail] = useState<PlanDetailResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [updatingStatus, setUpdatingStatus] = useState<boolean>(false);
  const [selectedStatus, setSelectedStatus] = useState<PlanStatus | undefined>(undefined);
  const [driverModalOpen, setDriverModalOpen] = useState<boolean>(false);
  const [carModalOpen, setCarModalOpen] = useState<boolean>(false);

  const [drivers, setDrivers] = useState<Account[]>([]);
  const [cars, setCars] = useState<Car[]>([]);

  const [selectedDriverId, setSelectedDriverId] = useState<number | undefined>(undefined);
  const [selectedCarId, setSelectedCarId] = useState<number | undefined>(undefined);

  const [loadingDrivers, setLoadingDrivers] = useState<boolean>(false);
  const [loadingCars, setLoadingCars] = useState<boolean>(false);

  const [changingDriver, setChangingDriver] = useState<boolean>(false);
  const [changingCar, setChangingCar] = useState<boolean>(false);

  const currentRole = getRole()?.replace("ROLE_", "").toLowerCase() || "";

  useEffect(() => {
    const fetchPlanDetail = async () => {
      try {
        setLoading(true);

        const data = await planService.getPlanDetail(id);

        setPlanDetail(data);
        setSelectedStatus(data.status);
      } catch (error: unknown) {
        console.error("Lỗi lấy chi tiết lịch trình:", error);

        let errorMsg = "Không lấy được chi tiết lịch trình";

        if (error instanceof Error) {
          errorMsg = error.message;
        }

        message.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPlanDetail();
    }
  }, [id]);
  const fetchDrivers = async () => {
    try {
      setLoadingDrivers(true);

      const managerBranchId = await getCurrentManagerBranchId();

      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

      const response = await fetch("http://localhost:8080/api/account", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401 || response.status === 403) {
        throw new Error("Phiên đăng nhập hết hạn hoặc không có quyền.");
      }

      if (!response.ok) {
        const errorText = await response.text();

        console.error("GET /api/account failed:", response.status, errorText);

        throw new Error(errorText || "Không lấy được danh sách tài xế");
      }

      const data: AccountResponse = await response.json();

      const driverList = (data.accounts || []).filter((account: Account) => {
        const accountBranchId = Number(account.branchId);
        const roleName = normalizeRoleName(account.role?.name);
        const status = normalizeStatus(account.status);

        const isSameBranch = accountBranchId === managerBranchId;
        const isStaffDriver = account.role?.roleId === 3 || roleName === "staff";
        const isActiveStatus = status === "ACTIVE";

        return isSameBranch && isStaffDriver && isActiveStatus;
      });

      setDrivers(driverList);
    } catch (error: unknown) {
      console.error("Lỗi lấy danh sách tài xế:", error);

      let errorMsg = "Không lấy được danh sách tài xế";

      if (error instanceof Error) {
        errorMsg = error.message;
      }

      message.error(errorMsg);
    } finally {
      setLoadingDrivers(false);
    }
  };

  const fetchCars = async () => {
    try {
      setLoadingCars(true);

      const managerBranchId = await getCurrentManagerBranchId();

      const response: CarListResponse = await getCars();
      const allCars = response.cars || [];

      const currentCar = allCars.find((car: Car) => car.id === planDetail?.carId);
      const currentCarType = currentCar?.carType;

      if (!currentCarType) {
        setCars([]);
        message.warning("Không xác định được loại xe hiện tại của lịch trình");
        return;
      }

      const carList = allCars.filter((car: Car) => {
        const carBranchId = Number(car.branch?.id);
        const status = normalizeStatus(car.status);

        const isSameBranch = carBranchId === managerBranchId;
        const isSameCarType = car.carType === currentCarType;
        const canChangePlanCar = CHANGE_CAR_STATUS_OPTIONS.includes(status);

        return isSameBranch && isSameCarType && canChangePlanCar;
      });

      setCars(carList);
    } catch (error: unknown) {
      console.error("Lỗi lấy danh sách xe:", error);

      let errorMsg = "Không lấy được danh sách xe";

      if (error instanceof Error) {
        errorMsg = error.message;
      }

      message.error(errorMsg);
    } finally {
      setLoadingCars(false);
    }
  };

  const handleOpenDriverModal = async () => {
    setSelectedDriverId(planDetail?.accountId);
    setDriverModalOpen(true);

    if (drivers.length === 0) {
      await fetchDrivers();
    }
  };

  const handleOpenCarModal = async () => {
    setSelectedCarId(planDetail?.carId);
    setCarModalOpen(true);

    if (cars.length === 0) {
      await fetchCars();
    }
  };
  const refreshPlanDetail = async () => {
    if (!id) return;

    const data = await planService.getPlanDetail(id);

    setPlanDetail(data);
    setSelectedStatus(data.status);
  };

  const handleChangeDriver = async () => {
    if (!id || selectedDriverId === undefined) {
      message.warning("Vui lòng chọn tài xế mới");
      return;
    }

    if (selectedDriverId === planDetail?.accountId) {
      message.warning("Tài xế mới đang trùng với tài xế hiện tại");
      return;
    }

    try {
      setChangingDriver(true);

      await planService.changeDriver(id, {
        newDriverId: selectedDriverId,
      });

      await refreshPlanDetail();

      setDriverModalOpen(false);
      message.success("Đổi tài xế thành công");
    } catch (error: unknown) {
      console.error("Lỗi đổi tài xế:", error);

      let errorMsg = "Không đổi được tài xế";

      if (error instanceof Error) {
        errorMsg = error.message;
      }

      message.error(errorMsg);
    } finally {
      setChangingDriver(false);
    }
  };

  const handleChangeCar = async () => {
    if (!id || selectedCarId === undefined) {
      message.warning("Vui lòng chọn xe mới");
      return;
    }

    if (selectedCarId === planDetail?.carId) {
      message.warning("Xe mới đang trùng với xe hiện tại");
      return;
    }

    const selectedCar = cars.find((car) => car.id === selectedCarId);

    try {
      setChangingCar(true);

      await planService.changeCar(id, {
        newCarId: selectedCarId,
      });

      if (selectedCar) {
        setPlanDetail((prev) =>
          prev
            ? {
                ...prev,
                carId: selectedCar.id,
                carLicensePlate: selectedCar.licensePlate,
              }
            : prev,
        );
      }

      setCarModalOpen(false);
      message.success("Đổi xe thành công");

      await refreshPlanDetail();
    } catch (error: unknown) {
      console.error("Lỗi đổi xe:", error);

      let errorMsg = "Không đổi được xe";

      if (error instanceof Error) {
        errorMsg = error.message;
      }

      message.error(errorMsg);
    } finally {
      setChangingCar(false);
    }
  };

  const handleUpdateStatus = async (statusOverride?: PlanStatus) => {
    const statusToUpdate = statusOverride || selectedStatus;

    if (!id || !statusToUpdate) {
      message.warning("Vui lòng chọn trạng thái");
      return;
    }

    try {
      setUpdatingStatus(true);

      const updatedPlan = await planService.updatePlanStatus(id, {
        status: statusToUpdate,
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
    } catch (error: unknown) {
      console.error("Lỗi cập nhật trạng thái:", error);

      let errorMsg = "Không cập nhật được trạng thái lịch trình";

      if (error instanceof Error) {
        errorMsg = error.message;
      }

      message.error(errorMsg);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const orderedStations = useMemo(() => {
    return getSortedStations(planDetail?.stations);
  }, [planDetail]);
  const sortedSeats = useMemo(() => {
    return [...(planDetail?.seats || [])].sort((a: PlanSeatResponse, b: PlanSeatResponse) =>
      a.seatNumber.localeCompare(b.seatNumber, undefined, {
        numeric: true,
        sensitivity: "base",
      }),
    );
  }, [planDetail]);

  const fromOffice = orderedStations[0]?.stationName || "Chưa có dữ liệu";
  const toOffice = orderedStations[orderedStations.length - 1]?.stationName || "Chưa có dữ liệu";

  const route =
    orderedStations.length >= 2 ? `${fromOffice} - ${toOffice}` : "Chưa có dữ liệu hành trình";

  const departureDate = formatDate(planDetail?.startTime);
  const departureTime = formatTime(planDetail?.startTime);

  const currentStatus = planDetail?.status;
  const statusClassName = getStatusClassName(currentStatus);
  const statusText = getStatusLabel(currentStatus);

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
              Mã lịch trình: <span className="font-semibold text-[#1570EF]">{planDetail.code}</span>
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
              Thao tác lịch trình
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {currentRole === "manager" ? (
                <Button
                  danger
                  type="primary"
                  size="large"
                  loading={updatingStatus}
                  onClick={() => handleUpdateStatus("INACTIVE")}
                  className="!rounded-xl !font-semibold"
                >
                  Chuyển không hoạt động
                </Button>
              ) : currentRole === "staff" ? (
                <Button
                  type="primary"
                  size="large"
                  loading={updatingStatus}
                  onClick={() => handleUpdateStatus("COMPLETE")}
                  className="!rounded-xl !border-0 !bg-[#16A34A] !font-semibold hover:!bg-[#15803D]"
                >
                  Hoàn thành
                </Button>
              ) : (
                <>
                  <Select
                    value={selectedStatus}
                    onChange={(value: PlanStatus) => setSelectedStatus(value)}
                    options={STATUS_OPTIONS}
                    className="w-full sm:w-[220px]"
                    size="large"
                  />

                  <Button
                    type="primary"
                    size="large"
                    loading={updatingStatus}
                    onClick={() => handleUpdateStatus()}
                    className="!rounded-xl !border-0 !bg-[#1570EF] !font-semibold hover:!bg-[#175CD3]"
                  >
                    Cập nhật trạng thái
                  </Button>
                </>
              )}
            </div>
          </div>

          <div>
            <p className="mb-2 text-[13px] font-bold uppercase tracking-wide text-[#98A2B3]">
              Trạng thái hiện tại
            </p>

            <Tag bordered={false} className={statusClassName}>
              ● {statusText}
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

                  <p className="mt-2 text-[15px] text-[#667085]">
                    Tuyến:{" "}
                    <span className="font-semibold text-[#344054]">
                      {planDetail.routeName || "Chưa có dữ liệu"}
                    </span>
                  </p>

                  <p className="mt-1 text-[15px] text-[#667085]">
                    Chi nhánh:{" "}
                    <span className="font-semibold text-[#344054]">
                      {planDetail.branchName || "Chưa có dữ liệu"}
                    </span>
                  </p>
                </div>

                <Tag bordered={false} className={statusClassName}>
                  ● {statusText}
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
                  <Button
                    size="small"
                    onClick={handleOpenCarModal}
                    className="!mt-3 !rounded-lg !border-[#1570EF] !font-semibold !text-[#1570EF]"
                  >
                    Đổi xe
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[16px] text-[#667085]">Biển số</span>
                  <span className="rounded-lg bg-[#F2F4F7] px-3 py-2 text-[16px] font-bold text-[#344054]">
                    {planDetail.carLicensePlate || "Chưa có dữ liệu"}
                  </span>
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
                    {planDetail.driverName || "Chưa có dữ liệu"}
                  </h3>
                  <Button
                    size="small"
                    onClick={handleOpenDriverModal}
                    className="!mt-3 !rounded-lg !border-[#EA580C] !font-semibold !text-[#EA580C]"
                  >
                    Đổi tài xế
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[16px] text-[#667085]">Số điện thoại</span>
                  <span className="flex items-center gap-2 text-[16px] font-semibold text-[#1570EF]">
                    <PhoneOutlined />
                    {planDetail.driverPhone || "Chưa có dữ liệu"}
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
                orderedStations.map((station: PlanStationResponse) => (
                  <div
                    key={station.stationId}
                    className="flex items-center justify-between rounded-xl border border-[#EAECF0] bg-[#FCFCFD] px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EFF8FF] text-[14px] font-bold text-[#1570EF]">
                        {station.order}
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
                Khu vực sơ đồ xe
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-[18px] border border-[#DDE3EA] bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-[20px] font-extrabold text-[#101828]">Danh sách ghế</h3>

            <div className="mx-auto max-w-[280px]">
              {sortedSeats.length > 0 ? (
                <div className="grid grid-cols-2 gap-x-10 gap-y-5">
                  {sortedSeats.map((seat: PlanSeatResponse) => (
                    <div
                      key={seat.seatId}
                      className="flex h-[86px] w-[86px] items-center justify-center rounded-2xl border border-[#EAECF0] bg-[#FCFCFD] text-center shadow-sm"
                    >
                      <span className="text-[16px] font-bold text-[#101828]">
                        {seat.seatNumber}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[#667085]">Chưa có dữ liệu ghế</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal
        title="Đổi tài xế cho lịch trình"
        open={driverModalOpen}
        onCancel={() => setDriverModalOpen(false)}
        onOk={handleChangeDriver}
        confirmLoading={changingDriver}
        okText="Xác nhận đổi"
        cancelText="Hủy"
      >
        <div className="py-3">
          <p className="mb-2 text-sm font-medium text-[#344054]">Chọn tài xế mới</p>

          <Select
            showSearch
            loading={loadingDrivers}
            value={selectedDriverId}
            onChange={(value: number) => setSelectedDriverId(value)}
            placeholder="Chọn tài xế"
            className="w-full"
            optionFilterProp="label"
            options={drivers.map((driver) => ({
              label: `${driver.fullName} - ${driver.phone}`,
              value: driver.accountId,
            }))}
          />
        </div>
      </Modal>

      <Modal
        title="Đổi xe cho lịch trình"
        open={carModalOpen}
        onCancel={() => setCarModalOpen(false)}
        onOk={handleChangeCar}
        confirmLoading={changingCar}
        okText="Xác nhận đổi"
        cancelText="Hủy"
      >
        <div className="py-3">
          <p className="mb-2 text-sm font-medium text-[#344054]">Chọn xe mới</p>

          <Select
            showSearch
            loading={loadingCars}
            value={selectedCarId}
            onChange={(value: number) => setSelectedCarId(value)}
            placeholder="Chọn xe"
            className="w-full"
            optionFilterProp="label"
            options={cars.map((car) => ({
              label: `${car.licensePlate} - ${car.carType} - ${
                car.branch?.name || "Chưa có chi nhánh"
              }`,
              value: car.id,
            }))}
          />
        </div>
      </Modal>
    </div>
  );
}
