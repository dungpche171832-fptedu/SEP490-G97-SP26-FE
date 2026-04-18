"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  TeamOutlined,
  RightOutlined,
  SearchOutlined,
  PlusOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Input, Select, Spin, Pagination, message } from "antd";

import Header from "@/components/admin/Header";
import Sidebar from "@/components/admin/Sidebar";
import { getAllEmployees, type EmployeeItem } from "@/services/employee.service";

const { Option } = Select;

const getRoleLabel = (roleName?: string | null) => {
  if (!roleName) return "Chưa phân quyền";

  switch (roleName.toLowerCase()) {
    case "admin":
      return "Quản trị viên";
    case "manager":
      return "Quản lý";
    case "staff":
      return "Nhân viên";
    default:
      return roleName;
  }
};

const getStatusLabel = (employee: EmployeeItem) => {
  if (employee.status) return employee.status;
  if (employee.isActive === true) return "ACTIVE";
  if (employee.isActive === false) return "INACTIVE";
  return "UNKNOWN";
};

const getStatusClass = (status: string) => {
  switch (status.toUpperCase()) {
    case "ACTIVE":
      return "bg-emerald-50 text-emerald-600";
    case "INACTIVE":
      return "bg-slate-100 text-slate-500";
    case "LOCKED":
      return "bg-red-50 text-red-600";
    default:
      return "bg-amber-50 text-amber-600";
  }
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
};

export default function EmployeePage() {
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<EmployeeItem[]>([]);
  const [keyword, setKeyword] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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

    fetchEmployees();
  }, []);

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const normalizedKeyword = keyword.trim().toLowerCase();
      const roleName = employee.role?.name?.toLowerCase() || "";
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
  }, [employees, keyword, roleFilter, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [keyword, roleFilter, statusFilter]);

  const paginatedEmployees = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredEmployees.slice(startIndex, endIndex);
  }, [filteredEmployees, currentPage, pageSize]);

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900">
      <Sidebar />

      <main className="flex-1 flex flex-col ml-64 overflow-hidden pt-16">
        <Header />

        <div className="p-8 h-full overflow-y-auto">
          <div className="flex items-center gap-3 mb-4 text-sm font-medium">
            <Link href="/admin" className="text-slate-400 hover:text-blue-600 transition-colors">
              Dashboard
            </Link>
            <RightOutlined className="text-slate-300 text-[10px]" />
            <span className="text-slate-800 font-bold">Quản lý nhân viên</span>
          </div>

          <div className="flex items-start justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-black text-slate-800 mb-1">Quản lý nhân viên</h2>
              <p className="text-slate-500 text-sm">
                Theo dõi danh sách tài khoản, vai trò và trạng thái hoạt động.
              </p>
            </div>

            <Link href="/admin/employee/add">
              <button className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-200 text-sm">
                <PlusOutlined />
                Thêm nhân viên
              </button>
            </Link>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50/70">
              <TeamOutlined className="text-blue-500" />
              <h3 className="font-bold text-slate-700 uppercase tracking-wider text-xs">
                Danh sách nhân viên
              </h3>
            </div>

            <div className="p-6 border-b border-slate-100">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  size="large"
                  allowClear
                  prefix={<SearchOutlined className="text-slate-400" />}
                  placeholder="Tìm theo tên, email, số điện thoại"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />

                <Select size="large" value={roleFilter} onChange={setRoleFilter}>
                  <Option value="all">Tất cả vai trò</Option>
                  <Option value="admin">Quản trị viên</Option>
                  <Option value="manager">Quản lý</Option>
                  <Option value="staff">Nhân viên</Option>
                </Select>

                <Select size="large" value={statusFilter} onChange={setStatusFilter}>
                  <Option value="all">Tất cả trạng thái</Option>
                  <Option value="active">Đang hoạt động</Option>
                  <Option value="inactive">Ngưng hoạt động</Option>
                  <Option value="locked">Bị khóa</Option>
                  <Option value="unknown">Chưa xác định</Option>
                </Select>
              </div>
            </div>

            {loading ? (
              <div className="py-20 flex items-center justify-center">
                <Spin size="large" />
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="py-20 text-center">
                <div className="w-14 h-14 rounded-full bg-slate-100 mx-auto mb-4 flex items-center justify-center text-slate-400">
                  <UserOutlined />
                </div>
                <h4 className="text-base font-bold text-slate-700 mb-1">Không có dữ liệu</h4>
                <p className="text-sm text-slate-400">
                  Không tìm thấy nhân viên phù hợp với bộ lọc hiện tại.
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1100px]">
                    <thead className="bg-slate-50">
                      <tr className="text-left">
                        <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          Nhân viên
                        </th>
                        <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          Liên hệ
                        </th>
                        <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          Vai trò
                        </th>
                        <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          Chi nhánh
                        </th>
                        <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          Trạng thái
                        </th>
                        <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          Ngày tạo
                        </th>
                        <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">
                          Thao tác
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {paginatedEmployees.map((employee) => {
                        const status = getStatusLabel(employee);

                        return (
                          <tr
                            key={employee.accountId}
                            className="border-t border-slate-100 hover:bg-slate-50/60 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                                  {employee.fullName?.trim()?.charAt(0)?.toUpperCase() || "U"}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-800 text-sm">
                                    {employee.fullName || "Chưa cập nhật"}
                                  </p>
                                  <p className="text-xs text-slate-400">ID: {employee.accountId}</p>
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-4">
                              <div className="space-y-1">
                                <p className="text-sm font-medium text-slate-700">
                                  {employee.email || "—"}
                                </p>
                                <p className="text-xs text-slate-400">{employee.phone || "—"}</p>
                              </div>
                            </td>

                            <td className="px-6 py-4">
                              <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600">
                                {getRoleLabel(employee.role?.name)}
                              </span>
                            </td>

                            <td className="px-6 py-4 text-sm font-medium text-slate-700">
                              {employee.branchId ?? "—"}
                            </td>

                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusClass(status)}`}
                              >
                                {status}
                              </span>
                            </td>

                            <td className="px-6 py-4 text-sm text-slate-500">
                              {formatDateTime(employee.createdAt)}
                            </td>

                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Link href={`/admin/employee/view?id=${employee.accountId}`}>
                                  <button className="px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-sm font-medium transition-all">
                                    Chi tiết
                                  </button>
                                </Link>

                                <Link href={`/admin/employee/edit?id=${employee.accountId}`}>
                                  <button className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium transition-all">
                                    Sửa
                                  </button>
                                </Link>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <p className="text-sm text-slate-500">
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
          </div>
        </div>
      </main>
    </div>
  );
}
