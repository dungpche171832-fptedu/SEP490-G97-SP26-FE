"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  PlusOutlined,
  RightOutlined,
  SearchOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Input, Modal, Pagination, Select, Spin, message } from "antd";
import type { AccountStatus } from "@/model/account";
import {
  getAllEmployees,
  updateEmployeeStatus,
  type EmployeeItem,
} from "@/services/employee.service";

const ACCOUNT_STATUS_OPTIONS: { value: AccountStatus; label: string }[] = [
  {
    value: "ACTIVE",
    label: "Đang hoạt động",
  },
  {
    value: "INACTIVE",
    label: "Ngưng hoạt động",
  },
];

const ACCOUNT_STATUS_VALUES: AccountStatus[] = ["ACTIVE", "INACTIVE"];

const isAccountStatus = (value: string): value is AccountStatus => {
  return ACCOUNT_STATUS_VALUES.includes(value as AccountStatus);
};

const normalizeRoleName = (roleName?: string | null): string => {
  return roleName?.replace("ROLE_", "").toLowerCase() || "";
};

const getRoleLabel = (roleName?: string | null) => {
  const normalizedRoleName = normalizeRoleName(roleName);

  switch (normalizedRoleName) {
    case "admin":
      return "Quản trị viên";
    case "manager":
      return "Quản lý";
    case "staff":
      return "Nhân viên";
    default:
      return roleName || "Chưa phân quyền";
  }
};

const getStatusLabel = (employee: EmployeeItem) => {
  if (employee.status) {
    return employee.status;
  }

  if (employee.isActive === true) {
    return "ACTIVE";
  }

  if (employee.isActive === false) {
    return "INACTIVE";
  }

  return "UNKNOWN";
};

const getAccountStatusValue = (employee: EmployeeItem): AccountStatus | undefined => {
  const status = getStatusLabel(employee).toUpperCase();

  return isAccountStatus(status) ? status : undefined;
};

const getAccountStatusText = (status?: string | null) => {
  const normalizedStatus = status?.toUpperCase() || "UNKNOWN";

  switch (normalizedStatus) {
    case "ACTIVE":
      return "Đang hoạt động";
    case "INACTIVE":
      return "Ngưng hoạt động";
    default:
      return "Chưa xác định";
  }
};

const getStatusClass = (status: string) => {
  switch (status.toUpperCase()) {
    case "ACTIVE":
      return "border-emerald-100 bg-emerald-50 text-emerald-600";
    case "INACTIVE":
      return "border-slate-200 bg-slate-100 text-slate-500";
    default:
      return "border-amber-100 bg-amber-50 text-amber-600";
  }
};

const getStatusIcon = (status: string) => {
  switch (status.toUpperCase()) {
    case "ACTIVE":
      return <CheckCircleOutlined />;
    case "INACTIVE":
      return <CloseCircleOutlined />;
    default:
      return <UserOutlined />;
  }
};

const formatDateTime = (value?: string | null) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
};

const getInitial = (fullName?: string | null) => {
  const trimmedName = fullName?.trim();

  if (!trimmedName) {
    return "U";
  }

  return trimmedName.charAt(0).toUpperCase();
};

const getCurrentUserEmail = (): string => {
  if (typeof window === "undefined") {
    return "";
  }

  return localStorage.getItem("email")?.trim().toLowerCase() || "";
};

export default function EmployeePage() {
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<EmployeeItem[]>([]);
  const [currentUserEmail, setCurrentUserEmail] = useState("");

  const [keyword, setKeyword] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [editingAccountId, setEditingAccountId] = useState<number | null>(null);
  const [editingStatus, setEditingStatus] = useState<AccountStatus | undefined>();
  const [updatingStatusAccountId, setUpdatingStatusAccountId] = useState<number | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    setCurrentUserEmail(getCurrentUserEmail());
  }, []);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);

        const response = await getAllEmployees();
        setEmployees(response.accounts || []);
      } catch (error) {
        console.error("Lỗi lấy danh sách nhân viên:", error);
        message.error("Không thể tải danh sách nhân viên");
      } finally {
        setLoading(false);
      }
    };

    void fetchEmployees();
  }, []);

  const handleStartEditStatus = (employee: EmployeeItem) => {
    setEditingAccountId(employee.accountId);
    setEditingStatus(getAccountStatusValue(employee));
  };

  const handleCancelEditStatus = () => {
    setEditingAccountId(null);
    setEditingStatus(undefined);
  };

  const handleSaveEmployeeStatus = (employee: EmployeeItem) => {
    const currentStatus = getAccountStatusValue(employee);

    if (!editingStatus) {
      message.error("Vui lòng chọn trạng thái tài khoản");
      return;
    }

    if (currentStatus === editingStatus) {
      handleCancelEditStatus();
      return;
    }

    Modal.confirm({
      title: "Xác nhận đổi trạng thái nhân viên",
      content: (
        <div className="space-y-2">
          <p>
            Bạn có chắc muốn đổi trạng thái của{" "}
            <span className="font-bold text-slate-800">{employee.fullName}</span>?
          </p>

          <p className="text-sm text-slate-500">
            Từ <span className="font-bold">{getAccountStatusText(currentStatus || "UNKNOWN")}</span>{" "}
            sang{" "}
            <span className="font-bold text-blue-600">{getAccountStatusText(editingStatus)}</span>.
          </p>
        </div>
      ),
      okText: "Xác nhận",
      cancelText: "Hủy",
      centered: true,
      onOk: async () => {
        try {
          setUpdatingStatusAccountId(employee.accountId);

          const response = await updateEmployeeStatus(employee.accountId, editingStatus);

          setEmployees((currentEmployees) =>
            currentEmployees.map((item) => {
              if (item.accountId !== response.accountId) {
                return item;
              }

              return {
                ...item,
                status: response.newStatus,
                isActive: response.newStatus === "ACTIVE",
              };
            }),
          );

          message.success("Cập nhật trạng thái nhân viên thành công");
          handleCancelEditStatus();
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Không thể cập nhật trạng thái nhân viên";

          message.error(errorMessage);
        } finally {
          setUpdatingStatusAccountId(null);
        }
      },
    });
  };

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const employeeEmail = employee.email?.trim().toLowerCase() || "";
      const isCurrentLoggedInAccount = !!currentUserEmail && employeeEmail === currentUserEmail;

      if (isCurrentLoggedInAccount) {
        return false;
      }

      const normalizedKeyword = keyword.trim().toLowerCase();
      const roleName = normalizeRoleName(employee.role?.name);
      const status = getStatusLabel(employee).toLowerCase();

      const matchKeyword =
        !normalizedKeyword ||
        employee.fullName?.toLowerCase().includes(normalizedKeyword) ||
        employee.email?.toLowerCase().includes(normalizedKeyword) ||
        employee.phone?.toLowerCase().includes(normalizedKeyword);

      const matchRole = roleFilter === "all" || roleName === roleFilter;
      const matchStatus = statusFilter === "all" || status === statusFilter;

      return matchKeyword && matchRole && matchStatus;
    });
  }, [employees, keyword, roleFilter, statusFilter, currentUserEmail]);

  useEffect(() => {
    setCurrentPage(1);
  }, [keyword, roleFilter, statusFilter, currentUserEmail]);

  const paginatedEmployees = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    return filteredEmployees.slice(startIndex, endIndex);
  }, [filteredEmployees, currentPage, pageSize]);

  return (
    <main className="min-h-screen bg-[#F8FAFC] px-6 py-6 font-sans text-slate-900">
      <div className="mx-auto w-full max-w-[1480px]">
        <div className="mb-5 flex items-center gap-3 text-sm font-medium">
          <Link href="/admin" className="text-slate-400 transition-colors hover:text-blue-600">
            Dashboard
          </Link>

          <RightOutlined className="text-[10px] text-slate-300" />

          <span className="font-bold text-slate-800">Quản lý nhân viên</span>
        </div>

        <section className="mb-8 flex flex-col gap-5 rounded-[28px] border border-slate-100 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.04)] md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="m-0 text-[32px] font-black tracking-tight text-[#1E293B]">
              Quản lý nhân viên
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Theo dõi danh sách tài khoản, vai trò và trạng thái hoạt động.
            </p>
          </div>

          <Link href="/admin/employees/addEmployee">
            <button className="flex h-12 items-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-bold !text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 [&_*]:!text-white">
              <PlusOutlined />
              Thêm nhân viên
            </button>
          </Link>
        </section>

        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.04)]">
          <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/70 px-7 py-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <TeamOutlined className="text-lg" />
            </div>

            <div>
              <h2 className="m-0 text-sm font-black uppercase tracking-[0.14em] text-slate-700">
                Danh sách nhân viên
              </h2>

              <p className="m-0 mt-1 text-xs text-slate-400">
                Tổng cộng {filteredEmployees.length} nhân viên phù hợp
              </p>
            </div>
          </div>

          <div className="border-b border-slate-100 p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Input
                size="large"
                allowClear
                prefix={<SearchOutlined className="text-slate-400" />}
                placeholder="Tìm theo tên, email, số điện thoại"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                className="h-12 rounded-xl"
              />

              <Select
                size="large"
                value={roleFilter}
                onChange={setRoleFilter}
                className="h-12"
                options={[
                  {
                    value: "all",
                    label: "Tất cả vai trò",
                  },
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
                    label: "Nhân viên",
                  },
                ]}
              />

              <Select
                size="large"
                value={statusFilter}
                onChange={setStatusFilter}
                className="h-12"
                options={[
                  {
                    value: "all",
                    label: "Tất cả trạng thái",
                  },
                  {
                    value: "active",
                    label: "Đang hoạt động",
                  },
                  {
                    value: "inactive",
                    label: "Ngưng hoạt động",
                  },
                  {
                    value: "unknown",
                    label: "Chưa xác định",
                  },
                ]}
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Spin size="large" />
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="py-24 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <UserOutlined className="text-xl" />
              </div>

              <h3 className="mb-1 text-base font-bold text-slate-700">Không có dữ liệu</h3>

              <p className="text-sm text-slate-400">
                Không tìm thấy nhân viên phù hợp với bộ lọc hiện tại.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1250px] border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-left">
                      <th className="px-7 py-4 text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
                        Nhân viên
                      </th>

                      <th className="px-7 py-4 text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
                        Liên hệ
                      </th>

                      <th className="px-7 py-4 text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
                        Vai trò
                      </th>

                      <th className="px-7 py-4 text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
                        Chi nhánh
                      </th>

                      <th className="px-7 py-4 text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
                        Trạng thái
                      </th>

                      <th className="px-7 py-4 text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
                        Ngày tạo
                      </th>

                      <th className="px-7 py-4 text-right text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
                        Thao tác
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedEmployees.map((employee) => {
                      const status = getStatusLabel(employee);
                      const isEditingThisRow = editingAccountId === employee.accountId;
                      const isUpdating = updatingStatusAccountId === employee.accountId;

                      return (
                        <tr
                          key={employee.accountId}
                          className="border-t border-slate-100 transition-colors hover:bg-slate-50/70"
                        >
                          <td className="px-7 py-5">
                            <div className="flex items-center gap-4">
                              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-sm font-black text-blue-600">
                                {getInitial(employee.fullName)}
                              </div>

                              <div>
                                <p className="m-0 text-sm font-black text-slate-800">
                                  {employee.fullName || "Chưa cập nhật"}
                                </p>

                                <p className="m-0 mt-1 text-xs font-medium text-slate-400">
                                  ID: {employee.accountId}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-7 py-5">
                            <div className="space-y-1">
                              <p className="m-0 text-sm font-semibold text-slate-700">
                                {employee.email || "—"}
                              </p>

                              <p className="m-0 text-xs font-medium text-slate-400">
                                {employee.phone || "—"}
                              </p>
                            </div>
                          </td>

                          <td className="px-7 py-5">
                            <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">
                              {getRoleLabel(employee.role?.name)}
                            </span>
                          </td>

                          <td className="px-7 py-5 text-sm font-semibold text-slate-700">
                            {employee.branchId ?? "—"}
                          </td>

                          <td className="px-7 py-5">
                            {isEditingThisRow ? (
                              <Select<AccountStatus>
                                size="middle"
                                value={editingStatus}
                                options={ACCOUNT_STATUS_OPTIONS}
                                disabled={isUpdating}
                                loading={isUpdating}
                                onChange={(value) => setEditingStatus(value)}
                                className="w-[180px]"
                                placeholder="Chọn trạng thái"
                              />
                            ) : (
                              <span
                                className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${getStatusClass(
                                  status,
                                )}`}
                              >
                                {getStatusIcon(status)}
                                {getAccountStatusText(status)}
                              </span>
                            )}
                          </td>

                          <td className="px-7 py-5 text-sm font-medium text-slate-500">
                            {formatDateTime(employee.createdAt)}
                          </td>

                          <td className="px-7 py-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link href={`/admin/employee/view?id=${employee.accountId}`}>
                                <button className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold !text-white transition-all hover:bg-blue-700">
                                  Chi tiết
                                </button>
                              </Link>

                              {isEditingThisRow ? (
                                <>
                                  <button
                                    type="button"
                                    disabled={isUpdating}
                                    onClick={() => handleSaveEmployeeStatus(employee)}
                                    className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold !text-white transition-all hover:bg-emerald-700 disabled:opacity-50"
                                  >
                                    Lưu
                                  </button>

                                  <button
                                    type="button"
                                    disabled={isUpdating}
                                    onClick={handleCancelEditStatus}
                                    className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-50 disabled:opacity-50"
                                  >
                                    Hủy
                                  </button>
                                </>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleStartEditStatus(employee)}
                                  className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold !text-white transition-all hover:bg-blue-700"
                                >
                                  Sửa
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col gap-4 border-t border-slate-100 bg-slate-50/60 px-7 py-5 md:flex-row md:items-center md:justify-between">
                <p className="m-0 text-sm text-slate-500">
                  Tổng số nhân viên:{" "}
                  <span className="font-bold text-slate-700">{filteredEmployees.length}</span>
                </p>

                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={filteredEmployees.length}
                  showSizeChanger
                  pageSizeOptions={["5", "10", "20", "50"]}
                  onChange={(page, size) => {
                    setCurrentPage(page);
                    setPageSize(size);
                  }}
                  showTotal={(total, range) => `${range[0]}-${range[1]} / ${total} nhân viên`}
                />
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
