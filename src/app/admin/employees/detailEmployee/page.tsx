"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getEmployeeById } from "@/services/employee.service";

interface Employee {
  id: number;
  fullName: string;
  email: string;
  role: string;
  branchName: string;
  active: boolean;
}

export default function EmployeeDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [employee, setEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getEmployeeById(Number(id));
        setEmployee(data);
      } catch (err) {
        console.error(err);
      }
    };

    if (id) fetchData();
  }, [id]);

  if (!employee) {
    return <div className="p-8">Loading...</div>;
  }

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
        <div className="p-8 max-w-3xl">
          <h1 className="text-2xl font-bold mb-6">Chi tiết nhân viên</h1>

          <div className="bg-white p-6 rounded-xl shadow space-y-4">
            <div>
              <p className="text-gray-500">Họ tên</p>
              <p className="font-medium">{employee.fullName}</p>
            </div>

            <div>
              <p className="text-gray-500">Email</p>
              <p className="font-medium">{employee.email}</p>
            </div>

            <div>
              <p className="text-gray-500">Chức vụ</p>
              <p className="font-medium">{employee.role}</p>
            </div>

            <div>
              <p className="text-gray-500">Chi nhánh</p>
              <p className="font-medium">{employee.branchName}</p>
            </div>

            <div>
              <p className="text-gray-500">Trạng thái</p>
              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  employee.active ? "bg-green-100 text-green-600" : "bg-gray-200 text-gray-600"
                }`}
              >
                {employee.active ? "Hoạt động" : "Khóa"}
              </span>
            </div>

            {/* ACTION */}
            <div className="flex justify-end">
              <button onClick={() => router.back()} className="px-4 py-2 bg-gray-200 rounded-lg">
                Quay lại
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
