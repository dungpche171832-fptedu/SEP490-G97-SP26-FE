"use client";

import React, { useState, useEffect } from "react";
import { Form, Input, Button, Select, Switch, notification, Breadcrumb, InputNumber } from "antd";
import {
  CheckCircleOutlined,
  HistoryOutlined,
  SafetyCertificateOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";

// Layout components
import Sidebar from "@/components/admin/Sidebar";
import Header from "@/components/admin/Header";

// Services
import { addCar, getBranchesForSelect, Branch, CarAddRequest } from "@/services/carService";

interface CarFormValues {
  licensePlate: string;
  branchId: number | string;
  carType: string;
  totalSeat: number | string;
  status: string;
  manufactureYear?: number | string;
  description?: string;
}

export default function AddCarPage() {
  const [form] = Form.useForm();
  const router = useRouter();

  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(true);

  // Lấy danh sách chi nhánh khi vừa vào trang
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const data = await getBranchesForSelect();
        setBranches(data);
      } catch (error) {
        notification.error({ message: "Lỗi tải danh sách chi nhánh" });
      } finally {
        setLoadingBranches(false);
      }
    };
    fetchBranches();
  }, []);

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYear - 2010 + 1 }, (_, i) => {
    const year = currentYear - i;
    return { label: year.toString(), value: year };
  });

  const onFinish = async (values: CarFormValues) => {
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
      await addCar(requestData);
      notification.success({ message: "Thành công", description: "Đã thêm xe mới vào hệ thống!" });
      router.push("/admin/car");
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        notification.error({
          message: "Thêm xe thất bại",
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
    <div className="flex h-screen bg-[#F8FAFC] font-sans">
      <Sidebar />

      <main className="flex-1 flex flex-col ml-64 overflow-hidden pt-16">
        <Header />

        {/* --- BREADCRUMB --- */}
        <div className="px-8 py-4 bg-white border-b border-slate-200">
          <Breadcrumb
            items={[
              {
                title: (
                  <a href="/admin/car" className="text-slate-500 font-medium hover:text-blue-600">
                    Xe
                  </a>
                ),
              },
              { title: <span className="text-slate-800 font-bold">Thêm mới xe</span> },
            ]}
            separator="›"
            className="text-sm"
          />
        </div>

        <div className="p-8 h-full overflow-y-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-black text-[#1E293B] tracking-tight">Thêm mới xe</h2>
            <p className="text-slate-500 mt-1 text-sm">
              Quản lý đội xe limousine cao cấp của Việt Trung
            </p>
          </div>

          <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 flex flex-col gap-6">
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
                  <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                    <Form.Item
                      label={
                        <span className="font-bold text-slate-700 text-xs tracking-wide uppercase">
                          Biển số xe *
                        </span>
                      }
                      name="licensePlate"
                      rules={[{ required: true, message: "Vui lòng nhập biển số xe" }]}
                      extra={
                        <a
                          href="#"
                          className="text-blue-500 text-xs hover:underline mt-1.5 inline-flex items-center"
                        >
                          <CheckCircleOutlined className="mr-1" /> Kiểm tra tính duy nhất trên hệ
                          thống...
                        </a>
                      }
                    >
                      <Input
                        placeholder="VD: 30A-123.45"
                        size="large"
                        className="bg-[#F8FAFC] rounded-lg hover:bg-white focus:bg-white text-sm py-2.5"
                      />
                    </Form.Item>

                    <Form.Item
                      label={
                        <span className="font-bold text-slate-700 text-xs tracking-wide uppercase">
                          Chi nhánh *
                        </span>
                      }
                      name="branchId"
                      rules={[{ required: true, message: "Vui lòng chọn chi nhánh" }]}
                    >
                      <Select
                        placeholder="Chọn chi nhánh quản lý"
                        size="large"
                        className="rounded-lg"
                        loading={loadingBranches}
                        showSearch
                        optionFilterProp="children"
                      >
                        {branches.map((b) => (
                          <Select.Option key={b.id} value={b.id}>
                            {b.name}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <Form.Item
                      label={
                        <span className="font-bold text-slate-700 text-xs tracking-wide uppercase">
                          Loại xe *
                        </span>
                      }
                      name="carType"
                      rules={[{ required: true, message: "Vui lòng chọn loại xe" }]}
                    >
                      <Select placeholder="Chọn loại xe" size="large" className="rounded-lg">
                        <Select.Option value="SEAT_9">DCar Limousine 9 chỗ</Select.Option>
                        <Select.Option value="SEAT_16">Xe Limousine/Ghế ngồi 16 chỗ</Select.Option>
                        <Select.Option value="SEAT_45">Xe khách 45 chỗ</Select.Option>
                      </Select>
                    </Form.Item>

                    <Form.Item
                      label={
                        <span className="font-bold text-slate-700 text-xs tracking-wide uppercase">
                          Tổng số ghế *
                        </span>
                      }
                      name="totalSeat"
                      rules={[{ required: true, message: "Nhập tổng số ghế" }]}
                    >
                      <InputNumber
                        placeholder="VD: 9"
                        size="large"
                        className="w-full bg-[#F8FAFC] rounded-lg"
                        min={1}
                      />
                    </Form.Item>

                    <Form.Item
                      label={
                        <span className="font-bold text-slate-700 text-xs tracking-wide uppercase">
                          Tình trạng vận hành *
                        </span>
                      }
                      name="status"
                      rules={[{ required: true, message: "Chọn trạng thái" }]}
                    >
                      <Select placeholder="Tình trạng hiện tại" size="large" className="rounded-lg">
                        <Select.Option value="RUNNING">Running (Sẵn sàng)</Select.Option>
                        <Select.Option value="STOP">Stop (Đang dừng/Sửa chữa)</Select.Option>
                        <Select.Option value="MAINTENANCE">Maintenance (Bảo dưỡng)</Select.Option>
                      </Select>
                    </Form.Item>

                    <Form.Item
                      label={
                        <span className="font-bold text-slate-700 text-xs tracking-wide uppercase">
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

                    <div className="col-span-2">
                      <Form.Item
                        label={
                          <span className="font-bold text-slate-700 text-xs tracking-wide uppercase">
                            Ghi chú
                          </span>
                        }
                        name="description"
                      >
                        <Input.TextArea
                          placeholder="Nhập các đặc điểm riêng của xe hoặc lịch sử đăng kiểm..."
                          rows={4}
                          className="bg-[#F8FAFC] rounded-lg hover:bg-white focus:bg-white transition-colors p-3 text-sm"
                        />
                      </Form.Item>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl px-8 py-6 shadow-sm border border-slate-200 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-[#1677FF] text-sm">Đang hoạt động</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Cho phép xe xuất hiện trong danh sách điều hành chuyến
                    </p>
                  </div>
                  <Form.Item name="isActive" valuePropName="checked" noStyle initialValue={true}>
                    <Switch />
                  </Form.Item>
                </div>
              </div>

              <div className="lg:col-span-4 flex flex-col gap-6">
                <div className="bg-[#EFF6FF] rounded-2xl p-6 border border-blue-100">
                  <h3 className="text-[#1E3A8A] font-bold text-xs tracking-widest uppercase mb-5 flex items-center">
                    <InfoCircleOutlined className="mr-2 text-base" /> Lưu ý khi thêm xe
                  </h3>

                  <div className="space-y-5 text-sm text-slate-600 leading-relaxed">
                    <div className="flex items-start gap-3">
                      <CheckCircleOutlined className="text-[#3B82F6] mt-1 flex-shrink-0 text-base" />
                      <p>
                        <strong className="text-slate-800 font-semibold">Biển số xe:</strong> Phải
                        nhập đúng định dạng (VD: 29A-888.88). Đây là mã định danh duy nhất.
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <HistoryOutlined className="text-[#3B82F6] mt-1 flex-shrink-0 text-base" />
                      <p>
                        <strong className="text-slate-800 font-semibold">Định kỳ bảo trì:</strong>{" "}
                        Hệ thống sẽ tự động nhắc lịch dựa trên loại xe và năm sản xuất sau khi lưu.
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <SafetyCertificateOutlined className="text-[#3B82F6] mt-1 flex-shrink-0 text-base" />
                      <p>
                        <strong className="text-slate-800 font-semibold">Xác thực:</strong> Mọi xe
                        mới cần được Admin cấp cao phê duyệt trước khi đi vào vận hành thực tế.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl overflow-hidden shadow-sm border border-slate-200 relative h-[180px] bg-slate-800 flex items-end p-5">
                  <div
                    className="absolute inset-0 opacity-70 bg-cover bg-center"
                    style={{
                      backgroundImage:
                        "url('https://images.unsplash.com/photo-1549317661-bd32c8ce0be2?q=80&w=2070&auto=format&fit=crop')",
                    }}
                  ></div>
                  <div className="relative z-10 text-white w-full bg-gradient-to-t from-black/90 to-transparent p-5 -m-5 pt-12">
                    <h4 className="font-bold text-base leading-tight">DCar Limousine Premium</h4>
                    <p className="text-[10px] text-slate-300 uppercase tracking-widest mt-1.5 font-medium">
                      Tiêu chuẩn 5 sao
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* --- BOTTOM ACTIONS (Sticky) --- */}
            <div className="mt-8 py-5 flex justify-end gap-4 bg-white px-8 rounded-t-2xl shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.05)] sticky bottom-0 z-20 border-t border-slate-100">
              <Button
                size="large"
                className="rounded-lg px-8 font-semibold border-slate-200 text-slate-600 hover:text-slate-800 hover:bg-slate-50 transition-colors"
                onClick={() => router.push("/admin/car")}
              >
                Hủy bỏ
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                className="bg-[#1677FF] hover:bg-blue-600 rounded-lg px-8 font-semibold shadow-sm transition-colors border-none"
                loading={loadingSubmit}
              >
                Thêm xe mới
              </Button>
            </div>
          </Form>
        </div>
      </main>
    </div>
  );
}
