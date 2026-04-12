"use client";

import { useState } from "react";
import { createEmployee } from "@/services/employee.service";
import { useRouter } from "next/navigation";

export default function AddEmployeePage() {
  const router = useRouter();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    role: "",
    branchId: 0,
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: name === "branchId" ? Number(value) : value,
    });
  };

  const handleSubmit = async () => {
    try {
      await createEmployee(form);
      alert("Thêm nhân viên thành công!");
      router.push("/admin/employees");
    } catch (err) {
      console.error(err);
      alert("Thêm thất bại!");
    }
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
        <div className="p-8 max-w-3xl">
          <h1 className="text-2xl font-bold mb-2">Thêm nhân viên</h1>
          <p className="text-gray-500 mb-6">Nhập thông tin nhân viên mới</p>

          <div className="bg-white p-6 rounded-xl shadow space-y-4">
            {/* Full Name */}
            <input
              type="text"
              name="fullName"
              placeholder="Họ tên"
              className="w-full border p-3 rounded-lg"
              onChange={handleChange}
            />

            {/* Email */}
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="w-full border p-3 rounded-lg"
              onChange={handleChange}
            />

            {/* Password */}
            <input
              type="password"
              name="password"
              placeholder="Mật khẩu"
              className="w-full border p-3 rounded-lg"
              onChange={handleChange}
            />

            {/* Role */}
            <select name="role" className="w-full border p-3 rounded-lg" onChange={handleChange}>
              <option value="">Chọn chức vụ</option>
              <option value="ADMIN">Admin</option>
              <option value="MANAGER">Manager</option>
              <option value="STAFF">Staff</option>
            </select>

            {/* Branch */}
            <input
              type="number"
              name="branchId"
              placeholder="Branch ID"
              className="w-full border p-3 rounded-lg"
              onChange={handleChange}
            />

            {/* ACTION */}
            <div className="flex justify-end space-x-3">
              <button onClick={() => router.back()} className="px-4 py-2 bg-gray-200 rounded-lg">
                Hủy
              </button>

              <button
                onClick={handleSubmit}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
