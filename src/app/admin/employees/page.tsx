"use client";

import { useEffect, useState } from "react";
import { getEmployees, deleteEmployee } from "@/services/employee.service";

interface Employee {
  id: number;
  fullName: string;
  email: string;
  role: string;
  branchName: string;
  active: boolean;
}

interface EmployeeResponse {
  content?: Employee[];
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [page, setPage] = useState<number>(1);

  // ================= FETCH DATA =================
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const data: EmployeeResponse | Employee[] = await getEmployees(page);

        if (Array.isArray(data)) {
          setEmployees(data);
        } else {
          setEmployees(data.content ?? []);
        }
      } catch (err) {
        console.error(err);
      }
    };

    loadEmployees();
  }, [page]);

  // ================= DELETE =================
  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa nhân viên này?")) return;

    try {
      await deleteEmployee(id);

      const data: EmployeeResponse | Employee[] = await getEmployees(page);

      if (Array.isArray(data)) {
        setEmployees(data);
      } else {
        setEmployees(data.content ?? []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ================= EDIT =================
  const handleEdit = (emp: Employee) => {
    console.log("Edit employee:", emp);
  };

  return (
    <div className="grid grid-cols-[240px_1fr] min-h-screen">
      {/* SIDEBAR */}
      <div className="bg-white border-r">
        <div className="p-6 font-bold text-lg">🚍 Xe Limou</div>

        <nav className="px-4 space-y-2">
          <div className="p-3 rounded-lg bg-blue-100 text-blue-600 font-medium">Nhân viên</div>
          <div className="p-3 rounded-lg hover:bg-gray-100 cursor-pointer">Chi nhánh</div>
          <div className="p-3 rounded-lg hover:bg-gray-100 cursor-pointer">Xe</div>
        </nav>
      </div>

      {/* CONTENT */}
      <div className="bg-gray-100">
        <div className="p-8">
          {/* HEADER */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Danh sách nhân viên</h1>
              <p className="text-gray-500">Quản lý thông tin nhân viên trong hệ thống.</p>
            </div>

            <button className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700">
              + Thêm nhân viên
            </button>
          </div>

          {/* TABLE */}
          <div className="bg-white rounded-xl shadow mt-6 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-100 text-gray-600 text-sm">
                <tr>
                  <th className="p-4">Họ tên</th>
                  <th>Email</th>
                  <th>Chức vụ</th>
                  <th>Chi nhánh</th>
                  <th>Trạng thái</th>
                  <th className="text-center">Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {employees.length > 0 ? (
                  employees.map((emp) => (
                    <tr key={emp.id} className="border-t hover:bg-gray-50">
                      <td className="p-4 font-medium">{emp.fullName}</td>
                      <td>{emp.email}</td>
                      <td>{emp.role}</td>
                      <td>{emp.branchName}</td>
                      <td>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            emp.active ? "bg-green-100 text-green-600" : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {emp.active ? "Hoạt động" : "Khóa"}
                        </span>
                      </td>

                      <td className="text-center space-x-3">
                        <button
                          onClick={() => handleEdit(emp)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(emp.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center p-6 text-gray-400">
                      Không có dữ liệu
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* PAGINATION */}
            <div className="flex justify-end p-4 space-x-2">
              <button
                onClick={() => setPage((prev) => prev - 1)}
                disabled={page === 1}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
              >
                Prev
              </button>

              <button
                onClick={() => setPage((prev) => prev + 1)}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
