"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeftOutlined,
  IdcardOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  SaveOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Alert, Button, Form, Input, InputNumber, Select, Spin, message } from "antd";
import type { CreateEmployeePayload, CreateEmployeeRoleName } from "@/model/account";
import { createEmployeeByAdmin } from "@/services/employee.service";

interface CreateEmployeeFormValues {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  roleName: CreateEmployeeRoleName;
  branchId: number;
}

const normalizeRole = (role?: string | null): string => {
  return role?.replace("ROLE_", "").toLowerCase() || "";
};

const getCurrentRole = (): string => {
  if (typeof window === "undefined") {
    return "";
  }

  return normalizeRole(localStorage.getItem("role"));
};

export default function AddEmployeePage() {
  const router = useRouter();
  const [form] = Form.useForm<CreateEmployeeFormValues>();

  const [checkingRole, setCheckingRole] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const role = getCurrentRole();

    if (role !== "admin") {
      setIsAdmin(false);
      setCheckingRole(false);
      message.error("Bạn không có quyền tạo nhân viên");
      router.replace("/admin/employees");
      return;
    }

    setIsAdmin(true);
    setCheckingRole(false);
  }, [router]);

  const handleSubmit = async () => {
    let values: CreateEmployeeFormValues;

    try {
      values = await form.validateFields();
    } catch {
      message.error("Vui lòng nhập đầy đủ thông tin bắt buộc");
      return;
    }

    const payload: CreateEmployeePayload = {
      fullName: values.fullName.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      password: values.password,
      roleName: values.roleName,
      branchId: values.branchId,
    };

    try {
      setSubmitting(true);

      await createEmployeeByAdmin(payload);

      message.success("Tạo nhân viên thành công");
      router.push("/admin/employees");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Không thể tạo nhân viên mới";

      message.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (checkingRole) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        <Spin size="large" />
      </main>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] px-6 py-6 font-sans text-slate-900">
      <div className="mx-auto w-full max-w-[980px]">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push("/admin/employees")}
          style={{
            borderColor: "#1267db",
            color: "#1267db",
          }}
          className="mb-6 h-11 rounded-xl border-2 bg-white px-6 text-sm font-bold shadow-none hover:!border-[#1267db] hover:!text-[#1267db]"
        >
          Quay lại
        </Button>

        <section className="mb-8 rounded-[28px] border border-slate-100 bg-white p-7 shadow-[0_18px_45px_rgba(15,23,42,0.04)]">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <TeamOutlined className="text-2xl" />
            </div>

            <div>
              <h1 className="m-0 text-[30px] font-black tracking-tight text-[#1E293B]">
                Thêm nhân viên mới
              </h1>

              <p className="m-0 mt-2 text-sm text-slate-500">
                Tạo tài khoản nhân viên. Tài khoản mới sẽ ở trạng thái hoạt động.
              </p>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.04)]">
          <div className="border-b border-slate-100 bg-slate-50/70 px-8 py-5">
            <h2 className="m-0 text-sm font-black uppercase tracking-[0.14em] text-slate-700">
              Thông tin tài khoản
            </h2>
          </div>

          <div className="p-8">
            <Alert
              type="info"
              showIcon
              className="mb-7 rounded-xl"
              message="Chỉ quản trị viên mới được tạo tài khoản nhân viên."
            />

            <Form form={form} layout="vertical" requiredMark={false}>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Form.Item
                  label="Họ tên"
                  name="fullName"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập họ tên",
                    },
                  ]}
                >
                  <Input
                    size="large"
                    prefix={<UserOutlined className="text-slate-400" />}
                    placeholder="Nhập họ tên nhân viên"
                    className="h-12 rounded-xl"
                  />
                </Form.Item>

                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập email",
                    },
                    {
                      type: "email",
                      message: "Email không hợp lệ",
                    },
                  ]}
                >
                  <Input
                    size="large"
                    prefix={<MailOutlined className="text-slate-400" />}
                    placeholder="example@gmail.com"
                    className="h-12 rounded-xl"
                  />
                </Form.Item>

                <Form.Item
                  label="Số điện thoại"
                  name="phone"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập số điện thoại",
                    },
                    {
                      pattern: /^[0-9]{9,11}$/,
                      message: "Số điện thoại phải gồm 9-11 chữ số",
                    },
                  ]}
                >
                  <Input
                    size="large"
                    prefix={<PhoneOutlined className="text-slate-400" />}
                    placeholder="Nhập số điện thoại"
                    className="h-12 rounded-xl"
                  />
                </Form.Item>

                <Form.Item
                  label="Mật khẩu"
                  name="password"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập mật khẩu",
                    },
                    {
                      pattern: /^(?=.*[A-Z]).{8,}$/,
                      message: "Mật khẩu tối thiểu 8 ký tự và có ít nhất 1 chữ hoa",
                    },
                  ]}
                >
                  <Input.Password
                    size="large"
                    prefix={<LockOutlined className="text-slate-400" />}
                    placeholder="Nhập mật khẩu"
                    className="h-12 rounded-xl"
                  />
                </Form.Item>

                <Form.Item
                  label="Vai trò"
                  name="roleName"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng chọn vai trò",
                    },
                  ]}
                >
                  <Select<CreateEmployeeRoleName>
                    size="large"
                    placeholder="Chọn vai trò"
                    className="h-12"
                    options={[
                      {
                        value: "admin",
                        label: "Quản trị viên",
                      },
                      {
                        value: "manager",
                        label: "Quản lý",
                      },
                      {
                        value: "staff",
                        label: "Tài Xế",
                      },
                    ]}
                  />
                </Form.Item>

                <Form.Item
                  label="Chi nhánh ID"
                  name="branchId"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập chi nhánh",
                    },
                  ]}
                >
                  <InputNumber
                    min={1}
                    size="large"
                    prefix={<IdcardOutlined className="text-slate-400" />}
                    placeholder="Nhập branchId"
                    className="h-12 w-full rounded-xl"
                  />
                </Form.Item>
              </div>

              <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
                <Button
                  size="large"
                  onClick={() => router.push("/admin/employees")}
                  disabled={submitting}
                  className="h-12 rounded-xl px-8 font-bold"
                >
                  Hủy
                </Button>

                <Button
                  type="primary"
                  size="large"
                  icon={<SaveOutlined />}
                  loading={submitting}
                  onClick={() => void handleSubmit()}
                  className="h-12 rounded-xl bg-blue-600 px-8 font-bold hover:!bg-blue-700"
                >
                  Tạo nhân viên
                </Button>
              </div>
            </Form>
          </div>
        </section>
      </div>
    </main>
  );
}
