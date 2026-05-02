"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Empty, Input, Spin, message } from "antd";
import {
  ArrowLeftOutlined,
  CloseOutlined,
  EditOutlined,
  EnvironmentFilled,
  RightOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { useParams, useRouter } from "next/navigation";
import type { RouteResponse } from "@/model/route";
import { getRouteDetail, getRoutes, updateRouteName } from "@/services/routeService";

type StationType = "departure" | "waypoint" | "arrival";

const getStationType = (index: number, total: number): StationType => {
  if (index === 0) {
    return "departure";
  }

  if (index === total - 1) {
    return "arrival";
  }

  return "waypoint";
};

const getStationLabel = (type: StationType): string => {
  if (type === "departure") {
    return "KHỞI HÀNH (DEP)";
  }

  if (type === "arrival") {
    return "ĐIỂM ĐẾN (ARR)";
  }

  return "ĐIỂM TRUNG CHUYỂN (WAY)";
};

export default function ManageRouteDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [routeDetail, setRouteDetail] = useState<RouteResponse | null>(null);
  const [reverseRouteCode, setReverseRouteCode] = useState("Chưa có");
  const [loading, setLoading] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const [routeNameInput, setRouteNameInput] = useState("");
  const [saving, setSaving] = useState(false);

  const routeId = useMemo(() => Number(params.id), [params.id]);

  useEffect(() => {
    const fetchRouteDetail = async () => {
      if (!routeId || Number.isNaN(routeId)) {
        message.error("ID tuyến đường không hợp lệ");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const [detail, routes] = await Promise.all([getRouteDetail(routeId), getRoutes()]);

        const reverseRoute = routes.find((route) => route.id === detail.routeRevertId);

        setRouteDetail(detail);
        setRouteNameInput(detail.name);
        setReverseRouteCode(reverseRoute?.code || "Chưa có");
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Không thể tải thông tin tuyến đường";

        message.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    void fetchRouteDetail();
  }, [routeId]);

  const handleStartEditName = () => {
    if (!routeDetail) {
      return;
    }

    setRouteNameInput(routeDetail.name);
    setIsEditingName(true);
  };

  const handleCancelEditName = () => {
    setRouteNameInput(routeDetail?.name || "");
    setIsEditingName(false);
  };

  const handleSaveRouteName = async () => {
    if (!routeDetail) {
      return;
    }

    const newName = routeNameInput.trim();

    if (!newName) {
      message.error("Tên tuyến không được để trống");
      return;
    }

    if (newName === routeDetail.name) {
      setIsEditingName(false);
      return;
    }

    try {
      setSaving(true);

      const updatedRoute = await updateRouteName(routeId, routeDetail, newName);

      setRouteDetail(updatedRoute);
      setRouteNameInput(updatedRoute.name);
      setIsEditingName(false);
      message.success("Cập nhật tên tuyến thành công");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Không thể cập nhật tên tuyến";

      message.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f9fd]">
        <Spin size="large" />
      </main>
    );
  }

  if (!routeDetail) {
    return (
      <main className="min-h-screen bg-[#f7f9fd] px-6 py-6">
        <section className="rounded-[28px] bg-white p-10 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
          <Empty description="Không tìm thấy thông tin tuyến đường" />

          <div className="mt-6 flex justify-center">
            <Button onClick={() => router.push("/admin/manageRoute")}>Quay lại</Button>
          </div>
        </section>
      </main>
    );
  }

  const stationCount = routeDetail.stations.length;

  return (
    <main className="min-h-screen bg-[#f7f9fd] px-6 py-6">
      <div className="mx-auto max-w-[1180px] space-y-8">
        <div>
          <Button
            type="default"
            icon={<ArrowLeftOutlined />}
            onClick={() => router.push("/admin/manageRoute")}
            style={{
              borderColor: "#1267db",
              color: "#1267db",
            }}
            className="h-11 rounded-xl border-2 bg-white px-6 text-sm font-bold shadow-none hover:!border-[#1267db] hover:!text-[#1267db]"
          >
            Quay lại
          </Button>
        </div>

        <section className="rounded-[28px] bg-white p-10 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
          <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eaf4ff] text-[#1267db]">
                <EnvironmentFilled />
              </div>

              <h1 className="m-0 text-[26px] font-extrabold text-[#202431]">
                Thông Tin Tuyến Đường
              </h1>
            </div>

            {!isEditingName ? (
              <Button
                type="default"
                icon={<EditOutlined />}
                onClick={handleStartEditName}
                style={{
                  borderColor: "#1267db",
                  color: "#1267db",
                }}
                className="h-12 min-w-[160px] rounded-xl border-2 bg-white px-6 font-bold shadow-none hover:!border-[#1267db] hover:!text-[#1267db]"
              >
                Chỉnh Sửa
              </Button>
            ) : (
              <div className="flex flex-wrap gap-3">
                <Button
                  icon={<CloseOutlined />}
                  onClick={handleCancelEditName}
                  disabled={saving}
                  className="h-12 rounded-xl px-6 font-bold"
                >
                  Hủy
                </Button>

                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  loading={saving}
                  onClick={() => void handleSaveRouteName()}
                  className="h-12 rounded-xl bg-[#1267db] px-6 font-bold"
                >
                  Lưu
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-5">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-[#9aabc4]">
                ID Tuyến
              </p>
              <span className="inline-flex rounded-md bg-[#e5e7eb] px-4 py-2 text-sm font-bold text-[#4b5563]">
                #{routeDetail.id}
              </span>
            </div>

            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-[#9aabc4]">
                Mã Tuyến
              </p>
              <span className="inline-flex rounded-md bg-[#eef4ff] px-5 py-2 text-sm font-extrabold text-[#1267db]">
                {routeDetail.code}
              </span>
            </div>

            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-[#9aabc4]">
                Tên Tuyến
              </p>

              {isEditingName ? (
                <Input
                  value={routeNameInput}
                  onChange={(event) => setRouteNameInput(event.target.value)}
                  onPressEnter={() => void handleSaveRouteName()}
                  disabled={saving}
                  maxLength={100}
                  className="h-12 rounded-xl border-[#1267db] font-bold"
                  placeholder="Nhập tên tuyến"
                />
              ) : (
                <h2 className="m-0 max-w-[220px] text-[22px] font-extrabold leading-snug text-[#171b26]">
                  {routeDetail.name}
                </h2>
              )}
            </div>

            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-[#9aabc4]">
                Tuyến Ngược
              </p>
              <span className="inline-flex items-center gap-2 rounded-full bg-[#0f5bd7] px-5 py-2 text-sm font-extrabold text-white">
                {reverseRouteCode}
                <RightOutlined className="text-xs" />
              </span>
            </div>

            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-[#9aabc4]">
                Số Trạm Dừng
              </p>
              <p className="m-0 text-[22px] font-extrabold text-[#171b26]">{stationCount} trạm</p>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] bg-white p-10 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
          <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#eaf4ff] text-[#1267db]">
                <EnvironmentFilled className="text-xl" />
              </div>

              <h2 className="m-0 text-[24px] font-extrabold text-[#202431]">Danh Sách Điểm Dừng</h2>
            </div>

            <div className="inline-flex h-11 items-center justify-center rounded-full bg-[#0f5bd7] px-8 text-sm font-extrabold uppercase tracking-[0.12em] text-white">
              {stationCount} trạm dừng hoạt động
            </div>
          </div>

          {stationCount === 0 ? (
            <Empty description="Tuyến đường chưa có điểm dừng" />
          ) : (
            <div className="relative pl-20">
              <div className="absolute left-[15px] top-3 h-[calc(100%-24px)] w-[2px] bg-[#1677ff]" />

              <div className="space-y-10">
                {routeDetail.stations.map((station, index) => {
                  const stationType = getStationType(index, stationCount);

                  return (
                    <div key={`${station.stationId}-${station.order}`} className="relative">
                      <div className="absolute left-[-74px] top-0 flex h-8 w-8 items-center justify-center rounded-full border-[5px] border-[#1267db] bg-white shadow-[0_4px_14px_rgba(18,103,219,0.22)]" />

                      <div className="rounded-3xl bg-[#f8f8fb] px-8 py-7">
                        <p className="mb-4 text-xs font-extrabold uppercase tracking-[0.12em] text-[#1267db]">
                          {getStationLabel(stationType)}
                        </p>

                        <h3 className="m-0 text-[21px] font-extrabold text-[#1f2430]">
                          <span className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#1f2430] text-sm font-extrabold">
                            {index + 1}
                          </span>
                          {station.stationName}
                        </h3>

                        <p className="mt-3 text-base italic text-[#7a879b]">
                          Thứ tự điểm dừng: {station.order}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
