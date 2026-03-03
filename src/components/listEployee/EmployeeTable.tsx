"use client";

import { useEffect, useState } from "react";
import { getEmployees, deleteEmployee } from "@/services/employee.service";
import { Pencil, Trash2 } from "lucide-react";

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

export default function EmployeeTable() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [page, setPage] = useState<number>(1);

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

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa nhân viên này?")) return;

    try {
      await deleteEmployee(id);

      // reload data sau khi xóa
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

  const handleEdit = (emp: Employee) => {
    console.log("Edit employee:", emp);
  };

  return (
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
          {employees.map((emp) => (
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
                  className="text-blue-500 hover:text-blue-700 transition"
                >
                  <Pencil size={18} />
                </button>

                <button
                  onClick={() => handleDelete(emp.id)}
                  className="text-red-500 hover:text-red-700 transition"
                >
                  <Trash2 size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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
  );
}
