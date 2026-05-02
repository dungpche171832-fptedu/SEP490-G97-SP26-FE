"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Form, Input, Modal, Select, Spin, message } from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  PlusOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import type { CreateRoutePayload } from "@/model/route";
import { createRoute } from "@/services/routeService";
import { getStations, type Station } from "@/services/station.service";

interface RouteStationFormItem {
  stationId: number;
  stationName: string;
  stationCode: string;
  address: string;
  cityName: string;
  order: number;
}

interface CreateRouteFormValues {
  code: string;
  name: string;
  nameRevert: string;
}

interface AddStationFormValues {
  stationId: number;
}

const generateReverseRouteCode = (code: string): string => {
  const normalizedCode = code.trim().toUpperCase();

  if (!normalizedCode) {
    return "";
  }

  return `${normalizedCode}_R`;
};

const getStationSubText = (station: RouteStationFormItem): string => {
  const values = [station.stationCode, station.address, station.cityName].filter(Boolean);

  return values.join(" • ");
};

export default function CreateRoutePage() {
  const router = useRouter();
  const [form] = Form.useForm<CreateRouteFormValues>();
  const [addStationForm] = Form.useForm<AddStationFormValues>();

  const [stations, setStations] = useState<RouteStationFormItem[]>([]);
  const [stationOptions, setStationOptions] = useState<Station[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingStations, setLoadingStations] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const codeValue = Form.useWatch("code", form);

  const reverseRouteCode = useMemo(() => {
    return generateReverseRouteCode(typeof codeValue === "string" ? codeValue : "");
  }, [codeValue]);

  const reverseStations = useMemo(() => {
    return [...stations].reverse().map((station, index) => ({
      ...station,
      order: index + 1,
    }));
  }, [stations]);

  const selectOptions = useMemo(() => {
    return stationOptions.map((station) => ({
      value: station.id,
      label: `${station.code} - ${station.name}${station.address ? ` - ${station.address}` : ""}`,
    }));
  }, [stationOptions]);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        setLoadingStations(true);

        const response = await getStations();
        setStationOptions(response.stations);
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

  const handleOpenAddStationModal = () => {
    addStationForm.resetFields();
    setIsModalOpen(true);
  };

  const handleAddStation = async () => {
    let values: AddStationFormValues;

    try {
      values = await addStationForm.validateFields();
    } catch {
      return;
    }

    const selectedStation = stationOptions.find((station) => station.id === values.stationId);

    if (!selectedStation) {
      message.error("Điểm dừng không hợp lệ");
      return;
    }

    const isDuplicate = stations.some((station) => station.stationId === selectedStation.id);

    if (isDuplicate) {
      message.error("Điểm dừng này đã tồn tại trong tuyến");
      return;
    }

    setStations((currentStations) => [
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

    addStationForm.resetFields();
    setIsModalOpen(false);
  };

  const handleRemoveStation = (stationId: number) => {
    setStations((currentStations) =>
      currentStations
        .filter((station) => station.stationId !== stationId)
        .map((station, index) => ({
          ...station,
          order: index + 1,
        })),
    );
  };

  const handleSubmit = async () => {
    let values: CreateRouteFormValues;

    try {
      values = await form.validateFields();
    } catch {
      message.error("Vui lòng nhập đầy đủ thông tin bắt buộc");
      return;
    }

    if (stations.length < 2) {
      message.error("Cần ít nhất 2 điểm dừng để tạo tuyến");
      return;
    }

    const payload: CreateRoutePayload = {
      code: values.code.trim().toUpperCase(),
      name: values.name.trim(),
      nameRevert: values.nameRevert.trim(),
      stations: stations.map((station, index) => ({
        stationId: station.stationId,
        order: index + 1,
      })),
    };

    try {
      setSubmitting(true);

      await createRoute(payload);

      message.success("Tạo tuyến đường thành công");
      router.push("/admin/manageRoute");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Không thể tạo tuyến đường";

      message.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f9fd] px-6 py-6">
      <div className="mx-auto max-w-[1280px]">
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push("/admin/manageRoute")}
              style={{
                borderColor: "#1267db",
                color: "#1267db",
              }}
              className="mb-4 h-10 rounded-lg border-2 bg-white px-5 font-semibold shadow-none hover:!border-[#1267db] hover:!text-[#1267db]"
            >
              Quay lại
            </Button>

            <h1 className="m-0 text-[38px] font-extrabold leading-tight text-[#10182f]">
              Tạo Tuyến Đường Mới
            </h1>
          </div>

          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            loading={submitting}
            onClick={() => void handleSubmit()}
            className="h-12 min-w-[240px] rounded-lg bg-[#1267db] px-8 text-sm font-bold shadow-[0_10px_24px_rgba(18,103,219,0.25)]"
          >
            Tạo Tuyến
          </Button>
        </div>

        <Form form={form} layout="vertical" requiredMark={false}>
          <div className="grid grid-cols-1 gap-11 xl:grid-cols-2">
            <section className="rounded-[30px] border-l-[7px] border-[#1267db] bg-white p-11 shadow-[0_22px_55px_rgba(15,23,42,0.06)]">
              <div className="mb-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-3xl">🚌</span>
                  <h2 className="m-0 text-[30px] font-extrabold text-[#202431]">Chiều Đi</h2>
                </div>

                <span className="rounded-full bg-[#eef4ff] px-6 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-[#1267db]">
                  Bắt buộc
                </span>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Form.Item
                  label={
                    <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#9aabc4]">
                      <span className="text-red-500">*</span> Mã tuyến
                    </span>
                  }
                  name="code"
                  rules={[{ required: true, message: "Vui lòng nhập mã tuyến" }]}
                >
                  <Input
                    placeholder="HN-HP-01"
                    className="h-16 rounded-2xl border-none bg-[#f5f7fb] px-5 text-lg font-bold text-[#1f2430]"
                  />
                </Form.Item>

                <Form.Item
                  label={
                    <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#9aabc4]">
                      <span className="text-red-500">*</span> Tên tuyến
                    </span>
                  }
                  name="name"
                  rules={[{ required: true, message: "Vui lòng nhập tên tuyến" }]}
                >
                  <Input
                    placeholder="Hà Nội - Hải Phòng"
                    className="h-16 rounded-2xl border-none bg-[#f5f7fb] px-5 text-lg font-bold text-[#1f2430]"
                  />
                </Form.Item>
              </div>

              <div className="mb-5 mt-8 flex items-center justify-between">
                <p className="m-0 text-xs font-extrabold uppercase tracking-[0.16em] text-[#9aabc4]">
                  Danh sách điểm dừng
                </p>

                <button
                  type="button"
                  onClick={handleOpenAddStationModal}
                  className="inline-flex items-center gap-2 text-sm font-extrabold text-[#1267db]"
                >
                  <PlusOutlined />
                  Thêm điểm
                </button>
              </div>

              <div className="space-y-4">
                {stations.length === 0 ? (
                  <div className="rounded-2xl bg-[#f5f7fb] px-5 py-8 text-center text-sm font-semibold text-[#8a9bb6]">
                    Chưa có điểm dừng nào
                  </div>
                ) : (
                  stations.map((station) => (
                    <div
                      key={station.stationId}
                      className="flex min-h-16 items-center gap-4 rounded-2xl bg-[#f1f3f7] px-4 py-3"
                    >
                      <div className="grid gap-[4px] text-[#cbd5e1]">
                        <span className="h-1 w-1 rounded-full bg-current" />
                        <span className="h-1 w-1 rounded-full bg-current" />
                        <span className="h-1 w-1 rounded-full bg-current" />
                      </div>

                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1267db] text-sm font-extrabold text-white">
                        {station.order}
                      </span>

                      <div className="min-w-0 flex-1">
                        <p className="m-0 truncate text-lg font-extrabold text-[#202431]">
                          {station.stationName}
                        </p>

                        {getStationSubText(station) && (
                          <p className="m-0 mt-1 truncate text-xs font-medium text-[#8a9bb6]">
                            {getStationSubText(station)}
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveStation(station.stationId)}
                        className="text-[#94a3b8] transition hover:text-red-500"
                      >
                        <DeleteOutlined />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-10 border-t border-[#edf2f7] pt-7">
                <p className="mb-5 text-xs font-extrabold uppercase tracking-[0.16em] text-[#9aabc4]">
                  Xem trước lộ trình
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  {stations.map((station, index) => (
                    <div
                      key={`preview-out-${station.stationId}`}
                      className="flex items-center gap-3"
                    >
                      <span
                        className={`h-3 w-3 rounded-full ${
                          index === 0 ? "bg-[#1267db]" : "bg-[#9ac3ea]"
                        }`}
                      />

                      {index < stations.length - 1 && (
                        <span className="h-[2px] w-10 bg-[#cfe1f2]" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-[30px] border-l-[7px] border-[#16a765] bg-[#eef8f5] p-11 shadow-[0_22px_55px_rgba(15,23,42,0.04)]">
              <div className="mb-10 flex items-center gap-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#0f6ebd] text-lg text-white">
                  <SwapOutlined />
                </span>

                <h2 className="m-0 text-[30px] font-extrabold text-[#202431]">Chiều Về</h2>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Form.Item
                  label={
                    <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#9aabc4]">
                      Mã tuyến về
                    </span>
                  }
                >
                  <Input
                    readOnly
                    value={reverseRouteCode}
                    placeholder="Không bắt buộc"
                    className="h-16 rounded-2xl border-none bg-white px-5 text-lg font-bold text-[#1f2430]"
                  />
                </Form.Item>

                <Form.Item
                  label={
                    <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#9aabc4]">
                      <span className="text-red-500">*</span> Tên tuyến về
                    </span>
                  }
                  name="nameRevert"
                  rules={[{ required: true, message: "Vui lòng nhập tên tuyến về" }]}
                >
                  <Input
                    placeholder="Hải Phòng - Hà Nội"
                    className="h-16 rounded-2xl border-none bg-white px-5 text-lg font-bold text-[#1f2430]"
                  />
                </Form.Item>
              </div>

              <div className="mb-5 mt-8">
                <p className="m-0 text-xs font-extrabold uppercase tracking-[0.16em] text-[#9aabc4]">
                  Danh sách điểm dừng
                </p>
              </div>

              <div className="space-y-4">
                {reverseStations.length === 0 ? (
                  <div className="rounded-2xl bg-white/80 px-5 py-8 text-center text-sm font-semibold text-[#8a9bb6]"></div>
                ) : (
                  reverseStations.map((station) => (
                    <div
                      key={`reverse-${station.stationId}`}
                      className="flex min-h-16 items-center gap-4 rounded-2xl bg-white/80 px-4 py-3"
                    >
                      <div className="grid gap-[4px] text-[#d9e6e2]">
                        <span className="h-1 w-1 rounded-full bg-current" />
                        <span className="h-1 w-1 rounded-full bg-current" />
                        <span className="h-1 w-1 rounded-full bg-current" />
                      </div>

                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#16a765] text-sm font-extrabold text-white">
                        {station.order}
                      </span>

                      <div className="min-w-0 flex-1">
                        <p className="m-0 truncate text-lg font-extrabold text-[#202431]">
                          {station.stationName}
                        </p>

                        {getStationSubText(station) && (
                          <p className="m-0 mt-1 truncate text-xs font-medium text-[#7aa99a]">
                            {getStationSubText(station)}
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveStation(station.stationId)}
                        className="text-[#9abdaf] transition hover:text-red-500"
                      >
                        <DeleteOutlined />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-10 border-t border-[#d5e8e1] pt-7">
                <p className="mb-5 text-xs font-extrabold uppercase tracking-[0.16em] text-[#9aabc4]">
                  Xem trước lộ trình ngược
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  {reverseStations.map((station, index) => (
                    <div
                      key={`preview-back-${station.stationId}`}
                      className="flex items-center gap-3"
                    >
                      <span
                        className={`h-3 w-3 rounded-full ${
                          index === 0 ? "bg-[#16a765]" : "bg-[#94d6b3]"
                        }`}
                      />

                      {index < reverseStations.length - 1 && (
                        <span className="h-[2px] w-10 bg-[#bde8d1]" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </Form>
      </div>

      <Modal
        title="Thêm điểm dừng"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => void handleAddStation()}
        okText="Thêm điểm"
        cancelText="Hủy"
        okButtonProps={{
          className: "bg-[#1267db]",
        }}
      >
        <Form form={addStationForm} layout="vertical">
          <Form.Item
            label="Chọn điểm dừng"
            name="stationId"
            rules={[{ required: true, message: "Vui lòng chọn điểm dừng" }]}
          >
            <Select
              showSearch
              loading={loadingStations}
              placeholder="Chọn điểm dừng từ danh sách"
              optionFilterProp="label"
              options={selectOptions}
              notFoundContent={loadingStations ? <Spin size="small" /> : "Không có điểm dừng"}
            />
          </Form.Item>
        </Form>
      </Modal>
    </main>
  );
}
