"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Empty, Input, Select, Spin, message } from "antd";
import {
  ArrowDownOutlined,
  ArrowLeftOutlined,
  ArrowUpOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  EnvironmentFilled,
  PlusOutlined,
  RightOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { useParams, useRouter } from "next/navigation";
import type { RouteResponse, RouteStation, UpdateRoutePayload } from "@/model/route";
import { getRouteDetail, getRoutes, updateRoute } from "@/services/routeService";
import { getStations, type Station } from "@/services/station.service";

type StationType = "departure" | "waypoint" | "arrival";

interface EditableRouteStation extends RouteStation {
  stationCode?: string;
  address?: string;
  cityName?: string;
}

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

const toEditableStations = (stations: RouteStation[]): EditableRouteStation[] => {
  return [...stations]
    .sort((firstStation, secondStation) => firstStation.order - secondStation.order)
    .map((station, index) => ({
      ...station,
      order: index + 1,
    }));
};

const getStationSubText = (station: EditableRouteStation): string => {
  const values = [station.stationCode, station.address, station.cityName].filter(Boolean);

  return values.join(" • ");
};

export default function ManageRouteDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [routeDetail, setRouteDetail] = useState<RouteResponse | null>(null);
  const [reverseRouteCode, setReverseRouteCode] = useState("Chưa có");
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [routeNameInput, setRouteNameInput] = useState("");
  const [editableStations, setEditableStations] = useState<EditableRouteStation[]>([]);
  const [selectedStationId, setSelectedStationId] = useState<number | null>(null);

  const [stationOptions, setStationOptions] = useState<Station[]>([]);
  const [loadingStations, setLoadingStations] = useState(false);
  const [saving, setSaving] = useState(false);

  const routeId = useMemo(() => Number(params.id), [params.id]);

  const stationCount = isEditing ? editableStations.length : routeDetail?.stations.length || 0;

  const selectOptions = useMemo(() => {
    return stationOptions.map((station) => ({
      value: station.id,
      label: `${station.code} - ${station.name}${station.address ? ` - ${station.address}` : ""}`,
    }));
  }, [stationOptions]);

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
        setEditableStations(toEditableStations(detail.stations));
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

  useEffect(() => {
    const fetchStations = async () => {
      try {
        setLoadingStations(true);

        const response = await getStations();
        setStationOptions(response.stations || []);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Không thể tải danh sách điểm dừng";

        message.error(errorMessage);
      } finally {
        setLoadingStations(false);
      }
    };

    void fetchStations();
  }, []);

  const handleStartEdit = () => {
    if (!routeDetail) {
      return;
    }

    setRouteNameInput(routeDetail.name);
    setEditableStations(toEditableStations(routeDetail.stations));
    setSelectedStationId(null);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (!routeDetail) {
      return;
    }

    setRouteNameInput(routeDetail.name);
    setEditableStations(toEditableStations(routeDetail.stations));
    setSelectedStationId(null);
    setIsEditing(false);
  };

  const handleAddStation = () => {
    if (!selectedStationId) {
      message.error("Vui lòng chọn điểm dừng cần thêm");
      return;
    }

    const selectedStation = stationOptions.find((station) => station.id === selectedStationId);

    if (!selectedStation) {
      message.error("Điểm dừng không hợp lệ");
      return;
    }

    const isDuplicate = editableStations.some(
      (station) => station.stationId === selectedStation.id,
    );

    if (isDuplicate) {
      message.error("Điểm dừng này đã có trong tuyến");
      return;
    }

    setEditableStations((currentStations) => [
      ...currentStations,
      {
        stationId: selectedStation.id,
        stationName: selectedStation.name,
        stationCode: selectedStation.code,
        address: selectedStation.address,
        cityName: selectedStation.cityName,
        order: currentStations.length + 1,
      },
    ]);

    setSelectedStationId(null);
  };

  const handleRemoveStation = (stationId: number) => {
    setEditableStations((currentStations) =>
      currentStations
        .filter((station) => station.stationId !== stationId)
        .map((station, index) => ({
          ...station,
          order: index + 1,
        })),
    );
  };

  const handleMoveStation = (index: number, direction: "up" | "down") => {
    setEditableStations((currentStations) => {
      const nextIndex = direction === "up" ? index - 1 : index + 1;

      if (nextIndex < 0 || nextIndex >= currentStations.length) {
        return currentStations;
      }

      const nextStations = [...currentStations];
      const currentStation = nextStations[index];
      const targetStation = nextStations[nextIndex];

      if (!currentStation || !targetStation) {
        return currentStations;
      }

      nextStations[index] = targetStation;
      nextStations[nextIndex] = currentStation;

      return nextStations.map((station, stationIndex) => ({
        ...station,
        order: stationIndex + 1,
      }));
    });
  };

  const handleSaveRoute = async () => {
    if (!routeDetail) {
      return;
    }

    const newName = routeNameInput.trim();

    if (!newName) {
      message.error("Tên tuyến không được để trống");
      return;
    }

    if (editableStations.length < 2) {
      message.error("Cần ít nhất 2 điểm dừng trong tuyến");
      return;
    }

    const payload: UpdateRoutePayload = {
      code: routeDetail.code,
      name: newName,
      stations: editableStations.map((station, index) => ({
        stationId: station.stationId,
        order: index + 1,
      })),
    };

    try {
      setSaving(true);

      const updatedRoute = await updateRoute(routeId, payload);

      setRouteDetail(updatedRoute);
      setRouteNameInput(updatedRoute.name);
      setEditableStations(toEditableStations(updatedRoute.stations));
      setIsEditing(false);
      message.success("Cập nhật tuyến đường thành công");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Không thể cập nhật tuyến đường";

      message.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const displayedStations = isEditing
    ? editableStations
    : toEditableStations(routeDetail?.stations || []);

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

            {!isEditing ? (
              <Button
                type="default"
                icon={<EditOutlined />}
                onClick={handleStartEdit}
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
                  onClick={handleCancelEdit}
                  disabled={saving}
                  className="h-12 rounded-xl px-6 font-bold"
                >
                  Hủy
                </Button>

                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  loading={saving}
                  onClick={() => void handleSaveRoute()}
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

              {isEditing ? (
                <Input
                  value={routeNameInput}
                  onChange={(event) => setRouteNameInput(event.target.value)}
                  onPressEnter={() => void handleSaveRoute()}
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

          {isEditing && (
            <div className="mb-8 rounded-2xl border border-dashed border-[#b7cff5] bg-[#f8fbff] p-5">
              <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.14em] text-[#7d91b0]">
                Thêm điểm dừng vào tuyến
              </p>

              <div className="flex flex-col gap-3 md:flex-row">
                <Select
                  showSearch
                  allowClear
                  value={selectedStationId}
                  onChange={(value) => setSelectedStationId(value)}
                  loading={loadingStations}
                  placeholder="Chọn điểm dừng"
                  optionFilterProp="label"
                  options={selectOptions}
                  className="h-12 flex-1"
                />

                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddStation}
                  disabled={saving}
                  className="h-12 rounded-xl bg-[#1267db] px-6 font-bold"
                >
                  Thêm điểm
                </Button>
              </div>
            </div>
          )}

          {stationCount === 0 ? (
            <Empty description="Tuyến đường chưa có điểm dừng" />
          ) : (
            <div className="relative pl-20">
              <div className="absolute left-[15px] top-3 h-[calc(100%-24px)] w-[2px] bg-[#1677ff]" />

              <div className="space-y-10">
                {displayedStations.map((station, index) => {
                  const stationType = getStationType(index, stationCount);

                  return (
                    <div key={`${station.stationId}-${station.order}`} className="relative">
                      <div className="absolute left-[-74px] top-0 flex h-8 w-8 items-center justify-center rounded-full border-[5px] border-[#1267db] bg-white shadow-[0_4px_14px_rgba(18,103,219,0.22)]" />

                      <div className="rounded-3xl bg-[#f8f8fb] px-8 py-7">
                        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <p className="m-0 text-xs font-extrabold uppercase tracking-[0.12em] text-[#1267db]">
                            {getStationLabel(stationType)}
                          </p>

                          {isEditing && (
                            <div className="flex flex-wrap gap-2">
                              <Button
                                size="small"
                                icon={<ArrowUpOutlined />}
                                disabled={index === 0 || saving}
                                onClick={() => handleMoveStation(index, "up")}
                              >
                                Lên
                              </Button>

                              <Button
                                size="small"
                                icon={<ArrowDownOutlined />}
                                disabled={index === displayedStations.length - 1 || saving}
                                onClick={() => handleMoveStation(index, "down")}
                              >
                                Xuống
                              </Button>

                              <Button
                                size="small"
                                danger
                                icon={<DeleteOutlined />}
                                disabled={saving}
                                onClick={() => handleRemoveStation(station.stationId)}
                              >
                                Xóa
                              </Button>
                            </div>
                          )}
                        </div>

                        <h3 className="m-0 text-[21px] font-extrabold text-[#1f2430]">
                          <span className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#1f2430] text-sm font-extrabold">
                            {index + 1}
                          </span>
                          {station.stationName}
                        </h3>

                        {getStationSubText(station) ? (
                          <p className="mt-3 text-base italic text-[#7a879b]">
                            {getStationSubText(station)}
                          </p>
                        ) : (
                          <p className="mt-3 text-base italic text-[#7a879b]">
                            Thứ tự điểm dừng: {index + 1}
                          </p>
                        )}
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
