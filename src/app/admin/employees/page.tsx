import EmployeeTable from "@/components/listEployee/EmployeeTable";

export default function EmployeesPage() {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Danh sách nhân viên</h1>
          <p className="text-gray-500">Quản lý thông tin nhân viên trong hệ thống.</p>
        </div>

        <button className="bg-blue-600 text-white px-5 py-2 rounded-lg">+ Thêm nhân viên</button>
      </div>

      <EmployeeTable />
    </div>
  );
}
