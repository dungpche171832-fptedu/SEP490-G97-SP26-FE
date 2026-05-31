"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Form, Input, Modal, Select, message } from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  PlusOutlined,
  SwapOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
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
  if (!normalizedCode) return "";
  return `${normalizedCode}_R`;
};

export default function CreateRoutePage() {
  const router = useRouter();
  const [form] = Form.useForm<CreateRouteFormValues>();
  const [addStationForm] = Form.useForm<AddStationFormValues>();

  const [stations, setStations] = useState<RouteStationFormItem[]>([]);
  const [reverseStations, setReverseStations] = useState<RouteStationFormItem[]>([]);
  const [stationOptions, setStationOptions] = useState<Station[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReverseModalOpen, setIsReverseModalOpen] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const codeValue = Form.useWatch("code", form);

  const reverseRouteCode = useMemo(() => {
    return generateReverseRouteCode(typeof codeValue === "string" ? codeValue : "");
  }, [codeValue]);

  const selectOptions = useMemo(() => {
    return stationOptions.map((station) => ({
      value: station.id,
      label: `${station.code} - ${station.name}${station.address ? ` - ${station.address}` : ""}`,
    }));
  }, [stationOptions]);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await getStations();
        setStationOptions(response.stations);
      } catch {
        message.error("Không thể tải danh sách điểm dừng");
      }
    };
    void fetchStations();
  }, []);

  // Logic: Tự động đảo ngược chiều đi sang chiều về khi Chiều Đi thay đổi
  useEffect(() => {
    const initialReverse = [...stations].reverse().map((station, index) => ({
      ...station,
      order: index + 1,
    }));
    setReverseStations(initialReverse);
  }, [stations]);

  const handleAddStation = async () => {
    const values = await addStationForm.validateFields();
    const selectedStation = stationOptions.find((s) => s.id === values.stationId);
    if (!selectedStation) return;
    if (stations.some((s) => s.stationId === selectedStation.id)) {
      message.error("Điểm dừng này đã tồn tại");
      return;
    }
    setStations((current) => [
      ...current,
      {
        stationId: selectedStation.id,
        stationName: selectedStation.name,
        stationCode: selectedStation.code,
        address: selectedStation.address,
        cityName: selectedStation.cityName,
        order: current.length + 1,
      },
    ]);
    setIsModalOpen(false);
    addStationForm.resetFields();
  };

  const handleRemoveStation = (stationId: number) => {
    setStations((current) =>
      current
        .filter((s) => s.stationId !== stationId)
        .map((s, index) => ({ ...s, order: index + 1 })),
    );
  };

  const handleAddReverseStation = async () => {
    const values = await addStationForm.validateFields();
    const selectedStation = stationOptions.find((s) => s.id === values.stationId);
    if (!selectedStation) return;
    if (reverseStations.some((s) => s.stationId === selectedStation.id)) {
      message.error("Điểm dừng này đã tồn tại trong chiều về");
      return;
    }

    setReverseStations((current) => {
      const newStations = [...current];
      const lastIndex = newStations.length > 0 ? newStations.length - 1 : 0;
      newStations.splice(lastIndex, 0, {
        stationId: selectedStation.id,
        stationName: selectedStation.name,
        stationCode: selectedStation.code,
        address: selectedStation.address,
        cityName: selectedStation.cityName,
        order: 0,
      });
      return newStations.map((s, index) => ({ ...s, order: index + 1 }));
    });
    setIsReverseModalOpen(false);
    addStationForm.resetFields();
  };

  const handleRemoveReverseStation = (stationId: number, index: number) => {
    if (index === 0 || index === reverseStations.length - 1) {
      message.warning("Không thể xóa điểm đầu hoặc điểm cuối của lộ trình");
      return;
    }
    setReverseStations((current) =>
      current
        .filter((s) => s.stationId !== stationId)
        .map((s, index) => ({ ...s, order: index + 1 })),
    );
  };

  const moveStation = (index: number, direction: "up" | "down") => {
    const newStations = [...reverseStations];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (
      targetIndex <= 0 ||
      targetIndex >= newStations.length - 1 ||
      index <= 0 ||
      index >= newStations.length - 1
    ) {
      return;
    }

    [newStations[index], newStations[targetIndex]] = [newStations[targetIndex], newStations[index]];
    setReverseStations(newStations.map((s, idx) => ({ ...s, order: idx + 1 })));
  };

  const handleSubmit = async () => {
    let values: CreateRouteFormValues;
    try {
      values = await form.validateFields();
    } catch {
      message.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    const payload: CreateRoutePayload = {
      code: values.code.trim().toUpperCase(),
      name: values.name.trim(),
      nameRevert: values.nameRevert.trim(),
      stations: stations.map((s, idx) => ({ stationId: s.stationId, order: idx + 1 })),
      reverseStations: reverseStations.map((s, idx) => ({
        stationId: s.stationId,
        order: idx + 1,
      })),
    };

    try {
      setSubmitting(true);
      await createRoute(payload);
      message.success("Tạo tuyến đường thành công");
      router.push("/admin/manageRoute");
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Lỗi tạo tuyến";
      message.error(errorMsg);
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
              className="mb-4 h-10 rounded-lg border-2 border-[#1267db] text-[#1267db] font-semibold bg-white shadow-none"
            >
              Quay lại
            </Button>
            <h1 className="m-0 text-[38px] font-extrabold text-[#10182f]">Tạo Tuyến Đường Mới</h1>
          </div>
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            loading={submitting}
            onClick={() => void handleSubmit()}
            className="h-12 min-w-[240px] rounded-lg bg-[#1267db] font-bold shadow-lg"
          >
            Tạo Tuyến
          </Button>
        </div>

        <Form form={form} layout="vertical" requiredMark={false}>
          <div className="grid grid-cols-1 gap-11 xl:grid-cols-2">
            {/* CHIỀU ĐI */}
            <section className="rounded-[30px] border-l-[7px] border-[#1267db] bg-white p-11 shadow-sm">
              <div className="mb-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-3xl">🚌</span>
                  <h2 className="m-0 text-[30px] font-extrabold text-[#202431]">Chiều Đi</h2>
                </div>
                <span className="rounded-full bg-[#eef4ff] px-6 py-2 text-xs font-extrabold text-[#1267db] uppercase">
                  Bắt buộc
                </span>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Form.Item
                  label={
                    <span className="text-xs font-extrabold uppercase text-[#9aabc4]">
                      Mã tuyến
                    </span>
                  }
                  name="code"
                  rules={[{ required: true }]}
                >
                  <Input
                    placeholder="HN-HP-01"
                    className="h-16 rounded-2xl bg-[#f5f7fb] border-none text-lg font-bold"
                  />
                </Form.Item>
                <Form.Item
                  label={
                    <span className="text-xs font-extrabold uppercase text-[#9aabc4]">
                      Tên tuyến
                    </span>
                  }
                  name="name"
                  rules={[{ required: true }]}
                >
                  <Input
                    placeholder="Hà Nội - Hải Phòng"
                    className="h-16 rounded-2xl bg-[#f5f7fb] border-none text-lg font-bold"
                  />
                </Form.Item>
              </div>
              <div className="mb-5 mt-8 flex items-center justify-between">
                <p className="m-0 text-xs font-extrabold text-[#9aabc4] uppercase">
                  Danh sách điểm dừng
                </p>
                <button
                  type="button"
                  onClick={() => {
                    addStationForm.resetFields();
                    setIsModalOpen(true);
                  }}
                  className="text-[#1267db] font-extrabold flex items-center gap-2"
                >
                  <PlusOutlined /> Thêm điểm
                </button>
              </div>
              <div className="space-y-4">
                {stations.map((station) => (
                  <div
                    key={station.stationId}
                    className="flex items-center gap-4 rounded-2xl bg-[#f1f3f7] px-4 py-3"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1267db] text-white font-bold">
                      {station.order}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="m-0 truncate font-extrabold text-[#202431]">
                        {station.stationName}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveStation(station.stationId)}
                      className="text-[#94a3b8] hover:text-red-500"
                    >
                      <DeleteOutlined />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* CHIỀU VỀ */}
            <section className="rounded-[30px] border-l-[7px] border-[#16a765] bg-[#eef8f5] p-11 shadow-sm">
              <div className="mb-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#0f6ebd] text-white">
                    <SwapOutlined />
                  </span>
                  <h2 className="m-0 text-[30px] font-extrabold text-[#202431]">Chiều Về</h2>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Form.Item
                  label={
                    <span className="text-xs font-extrabold text-[#9aabc4] uppercase">
                      Mã tuyến về
                    </span>
                  }
                >
                  <Input
                    readOnly
                    value={reverseRouteCode}
                    className="h-16 rounded-2xl bg-white border-none text-lg font-bold"
                  />
                </Form.Item>
                <Form.Item
                  label={
                    <span className="text-xs font-extrabold text-[#9aabc4] uppercase">
                      Tên tuyến về
                    </span>
                  }
                  name="nameRevert"
                  rules={[{ required: true }]}
                >
                  <Input
                    placeholder="Hải Phòng - Hà Nội"
                    className="h-16 rounded-2xl bg-white border-none text-lg font-bold"
                  />
                </Form.Item>
              </div>
              <div className="space-y-4 mt-8">
                <div className="mb-5 mt-8 flex items-center justify-between">
                  <p className="m-0 text-xs font-extrabold text-[#9aabc4] uppercase">
                    Danh sách điểm dừng
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      addStationForm.resetFields();
                      setIsReverseModalOpen(true);
                    }}
                    className="text-[#16a765] font-extrabold flex items-center gap-2"
                  >
                    <PlusOutlined /> Thêm điểm trung gian
                  </button>
                </div>
                {reverseStations.map((station, index) => {
                  const isFirstOrLast = index === 0 || index === reverseStations.length - 1;
                  return (
                    <div
                      key={`rev-${station.stationId}-${index}`}
                      className={`flex items-center gap-4 rounded-2xl px-4 py-3 ${isFirstOrLast ? "bg-[#d1e7dd] border border-[#16a765]" : "bg-white/80"}`}
                    >
                      <span
                        className={`flex h-9 w-9 items-center justify-center rounded-full font-bold text-white ${isFirstOrLast ? "bg-[#16a765]" : "bg-[#94d6b3]"}`}
                      >
                        {station.order}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="m-0 truncate font-extrabold text-[#202431]">
                          {station.stationName}
                        </p>
                        {isFirstOrLast && (
                          <span className="text-[10px] text-[#16a765] font-bold uppercase">
                            Cố định
                          </span>
                        )}
                      </div>
                      {!isFirstOrLast && (
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => moveStation(index, "up")}
                            disabled={index === 1}
                            className="text-[#16a765] disabled:opacity-30"
                          >
                            <ArrowUpOutlined />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveStation(index, "down")}
                            disabled={index === reverseStations.length - 2}
                            className="text-[#16a765] disabled:opacity-30"
                          >
                            <ArrowDownOutlined />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveReverseStation(station.stationId, index)}
                            className="text-[#9abdaf] hover:text-red-500"
                          >
                            <DeleteOutlined />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
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
        okButtonProps={{ className: "bg-[#1267db]" }}
      >
        <Form form={addStationForm} layout="vertical">
          <Form.Item label="Chọn điểm dừng" name="stationId" rules={[{ required: true }]}>
            <Select showSearch options={selectOptions} optionFilterProp="label" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Thêm trạm trung gian Chiều Về"
        open={isReverseModalOpen}
        onCancel={() => setIsReverseModalOpen(false)}
        onOk={() => void handleAddReverseStation()}
        okButtonProps={{ className: "bg-[#16a765]" }}
      >
        <Form form={addStationForm} layout="vertical">
          <Form.Item
            label="Chọn điểm dừng trung gian"
            name="stationId"
            rules={[{ required: true }]}
          >
            <Select showSearch options={selectOptions} optionFilterProp="label" />
          </Form.Item>
        </Form>
      </Modal>
    </main>
  );
}
