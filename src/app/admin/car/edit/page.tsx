"use client";

import { useEffect, useState } from "react";
import {
  Breadcrumb,
  Button,
  Form,
  Input,
  InputNumber,
  Select,
  Spin,
  Switch,
  notification,
} from "antd";
import {
  CheckCircleOutlined,
  HistoryOutlined,
  InfoCircleOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import { useRouter, useSearchParams } from "next/navigation";
import { isAxiosError } from "axios";
import { getBranchesForSelect, getCarById, updateCar } from "@/services/carService";
import type { Branch, CarAddRequest } from "@/services/carService";

interface CarFormValues {
  licensePlate: string;
  branchId: number | string;
  carType: string;
  totalSeat: number | string;
  status: string;
  manufactureYear?: number | string;
  description?: string;
  isActive?: boolean;
}

export default function EditCarPage() {
  const [form] = Form.useForm<CarFormValues>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const carId = searchParams.get("id");

  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(true);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const data = await getBranchesForSelect();
        setBranches(data);
      } catch {
        notification.error({
          message: "Lỗi tải danh sách chi nhánh",
        });
      } finally {
        setLoadingBranches(false);
      }
    };

    void fetchBranches();
  }, []);

  useEffect(() => {
    if (!carId) {
      notification.error({
        message: "Không tìm thấy mã xe hợp lệ!",
      });
      router.push("/admin/car");
      return;
    }

    const fetchCarData = async () => {
      try {
        setLoadingData(true);

        const carData = await getCarById(Number(carId));
        form.setFieldsValue({
          licensePlate: carData.licensePlate,
          branchId: carData.branch?.id,
          carType: carData.carType,
          totalSeat: carData.totalSeat,
          status: carData.status,
          manufactureYear: carData.manufactureYear,
          description: carData.description,
          isActive: carData.isActive ?? true,
        });
      } catch {
        notification.error({
          message: "Lỗi tải thông tin chi tiết xe",
        });
        router.push("/admin/car");
      } finally {
        setLoadingData(false);
      }
    };

    void fetchCarData();
  }, [carId, form, router]);

  const currentYear = new Date().getFullYear();

  const yearOptions = Array.from({ length: currentYear - 2010 + 1 }, (_, index) => {
    const year = currentYear - index;

    return {
      label: year.toString(),
      value: year,
    };
  });

  const onFinish = async (values: CarFormValues) => {
    if (!carId) {
      return;
    }

    const requestData: CarAddRequest = {
      licensePlate: values.licensePlate,
      branchId: Number(values.branchId),
      carType: values.carType,
      totalSeat: Number(values.totalSeat),
      status: values.status,
      manufactureYear: values.manufactureYear ? Number(values.manufactureYear) : undefined,
      description: values.description,
    };

    setLoadingSubmit(true);

    try {
      await updateCar(Number(carId), requestData);

      notification.success({
        message: "Thành công",
        description: "Đã cập nhật thông tin xe!",
      });

      router.push("/admin/car");
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        notification.error({
          message: "Cập nhật thất bại",
          description: error.response?.data?.message || "Vui lòng kiểm tra lại thông tin.",
        });
      } else {
        notification.error({
          message: "Lỗi hệ thống",
          description: "Đã xảy ra lỗi không xác định. Vui lòng thử lại sau.",
        });
      }
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] px-6 py-6 font-sans text-slate-900">
      <div className="mx-auto w-full max-w-[1280px]">
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white px-8 py-4 shadow-sm">
          <Breadcrumb
            items={[
              {
                title: (
                  <button
                    type="button"
                    onClick={() => router.push("/admin/car")}
                    className="font-medium text-slate-500 transition-colors hover:text-blue-600"
                  >
                    Xe
                  </button>
                ),
              },
              {
                title: <span className="font-bold text-slate-800">Cập nhật xe</span>,
              },
            ]}
            separator="›"
            className="text-sm"
          />
        </div>

        <div className="mb-8">
          <h2 className="m-0 text-3xl font-black tracking-tight text-[#1E293B]">Cập nhật xe</h2>

          <p className="mt-1 text-sm text-slate-500">Chỉnh sửa thông tin xe trong hệ thống</p>
        </div>

        {loadingData ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white">
            <Spin size="large" />
            <p className="mt-4 font-medium text-slate-500">Đang tải thông tin xe...</p>
          </div>
        ) : (
          <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false}>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              <div className="flex flex-col gap-6 lg:col-span-8">
                <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                  <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
                    <Form.Item
                      label={
                        <span className="text-xs font-bold uppercase tracking-wide text-slate-700">
                          Biển số xe *
                        </span>
                      }
                      name="licensePlate"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập biển số xe",
                        },
                      ]}
                    >
                      <Input
                        placeholder="VD: 30A-123.45"
                        size="large"
                        className="rounded-lg bg-[#F8FAFC] py-2.5 text-sm font-semibold hover:bg-white focus:bg-white"
                        disabled
                      />
                    </Form.Item>

                    <Form.Item
                      label={
                        <span className="text-xs font-bold uppercase tracking-wide text-slate-700">
                          Chi nhánh *
                        </span>
                      }
                      name="branchId"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng chọn chi nhánh",
                        },
                      ]}
                    >
                      <Select
                        placeholder="Chọn chi nhánh quản lý"
                        size="large"
                        className="rounded-lg"
                        loading={loadingBranches}
                        showSearch
                        optionFilterProp="children"
                      >
                        {branches.map((branch) => (
                          <Select.Option key={branch.id} value={branch.id}>
                            {branch.name}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <Form.Item
                      label={
                        <span className="text-xs font-bold uppercase tracking-wide text-slate-700">
                          Loại xe *
                        </span>
                      }
                      name="carType"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng chọn loại xe",
                        },
                      ]}
                    >
                      <Select placeholder="Chọn loại xe" size="large" className="rounded-lg">
                        <Select.Option value="SEAT_9">DCar Limousine 9 chỗ</Select.Option>
                        <Select.Option value="SEAT_16">Xe Limousine/Ghế ngồi 16 chỗ</Select.Option>
                        <Select.Option value="SEAT_45">Xe khách 45 chỗ</Select.Option>
                      </Select>
                    </Form.Item>

                    <Form.Item
                      label={
                        <span className="text-xs font-bold uppercase tracking-wide text-slate-700">
                          Tổng số ghế *
                        </span>
                      }
                      name="totalSeat"
                      rules={[
                        {
                          required: true,
                          message: "Nhập tổng số ghế",
                        },
                      ]}
                    >
                      <InputNumber
                        placeholder="VD: 9"
                        size="large"
                        className="w-full rounded-lg bg-[#F8FAFC]"
                        min={1}
                      />
                    </Form.Item>

                    <Form.Item
                      label={
                        <span className="text-xs font-bold uppercase tracking-wide text-slate-700">
                          Tình trạng vận hành *
                        </span>
                      }
                      name="status"
                      rules={[
                        {
                          required: true,
                          message: "Chọn trạng thái",
                        },
                      ]}
                    >
                      <Select placeholder="Tình trạng hiện tại" size="large" className="rounded-lg">
                        <Select.Option value="RUNNING">Running (Sẵn sàng)</Select.Option>
                        <Select.Option value="STOP">Stop (Đang dừng/Sửa chữa)</Select.Option>
                        <Select.Option value="MAINTENANCE">Maintenance (Bảo dưỡng)</Select.Option>
                      </Select>
                    </Form.Item>

                    <Form.Item
                      label={
                        <span className="text-xs font-bold uppercase tracking-wide text-slate-700">
                          Năm sản xuất
                        </span>
                      }
                      name="manufactureYear"
                    >
                      <Select
                        placeholder="Năm sản xuất"
                        size="large"
                        className="rounded-lg"
                        options={yearOptions}
                        showSearch
                      />
                    </Form.Item>

                    <div className="md:col-span-2">
                      <Form.Item
                        label={
                          <span className="text-xs font-bold uppercase tracking-wide text-slate-700">
                            Ghi chú
                          </span>
                        }
                        name="description"
                      >
                        <Input.TextArea
                          placeholder="Nhập các đặc điểm riêng của xe hoặc lịch sử đăng kiểm..."
                          rows={4}
                          className="rounded-lg bg-[#F8FAFC] p-3 text-sm transition-colors hover:bg-white focus:bg-white"
                        />
                      </Form.Item>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-8 py-6 shadow-sm">
                  <div>
                    <p className="m-0 text-sm font-bold text-[#1677FF]">Đang hoạt động</p>

                    <p className="mt-1 text-xs text-slate-500">
                      Cho phép xe xuất hiện trong danh sách điều hành chuyến
                    </p>
                  </div>

                  <Form.Item name="isActive" valuePropName="checked" noStyle>
                    <Switch />
                  </Form.Item>
                </div>
              </div>

              <div className="flex flex-col gap-6 lg:col-span-4">
                <div className="rounded-2xl border border-blue-100 bg-[#EFF6FF] p-6">
                  <h3 className="mb-5 flex items-center text-xs font-bold uppercase tracking-widest text-[#1E3A8A]">
                    <InfoCircleOutlined className="mr-2 text-base" />
                    Lưu ý khi cập nhật
                  </h3>

                  <div className="space-y-5 text-sm leading-relaxed text-slate-600">
                    <div className="flex items-start gap-3">
                      <CheckCircleOutlined className="mt-1 flex-shrink-0 text-base text-[#3B82F6]" />
                      <p className="m-0">
                        <strong className="font-semibold text-slate-800">Biển số xe:</strong> Thông
                        thường không nên thay đổi để tránh ảnh hưởng đến các chuyến xe đang chạy.
                      </p>
                    </div>

                    <div className="flex items-start gap-3">
                      <HistoryOutlined className="mt-1 flex-shrink-0 text-base text-[#3B82F6]" />
                      <p className="m-0">
                        <strong className="font-semibold text-slate-800">
                          Cập nhật trạng thái:
                        </strong>{" "}
                        Nếu đổi sang &quot;Stop&quot; hoặc &quot;Maintenance&quot;, hệ thống sẽ cảnh
                        báo nếu xe đang được phân công lịch trình.
                      </p>
                    </div>

                    <div className="flex items-start gap-3">
                      <SafetyCertificateOutlined className="mt-1 flex-shrink-0 text-base text-[#3B82F6]" />
                      <p className="m-0">
                        <strong className="font-semibold text-slate-800">Bảo lưu lịch sử:</strong>{" "}
                        Mọi thay đổi quan trọng đều được ghi nhận lại trong lịch sử hệ thống.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative flex h-[180px] items-end overflow-hidden rounded-2xl border border-slate-200 bg-slate-800 p-5 shadow-sm">
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-70"
                    style={{
                      backgroundImage:
                        "url('https://images.unsplash.com/photo-1549317661-bd32c8ce0be2?q=80&w=2070&auto=format&fit=crop')",
                    }}
                  />

                  <div className="relative z-10 -m-5 w-full bg-gradient-to-t from-black/90 to-transparent p-5 pt-12 text-white">
                    <h4 className="text-base font-bold leading-tight">DCar Limousine Premium</h4>

                    <p className="mt-1.5 text-[10px] font-medium uppercase tracking-widest text-slate-300">
                      Tiêu chuẩn 5 sao
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 z-20 mt-8 flex justify-end gap-4 rounded-t-2xl border-t border-slate-100 bg-white px-8 py-5 shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.05)]">
              <Button
                size="large"
                className="rounded-lg border-slate-200 px-8 font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-800"
                onClick={() => router.push("/admin/car")}
              >
                Hủy bỏ
              </Button>

              <Button
                type="primary"
                htmlType="submit"
                size="large"
                className="rounded-lg border-none bg-[#1677FF] px-8 font-semibold shadow-sm transition-colors hover:bg-blue-600"
                loading={loadingSubmit}
              >
                Cập nhật thông tin
              </Button>
            </div>
          </Form>
        )}
      </div>
    </main>
  );
}
