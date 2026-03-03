export default function Sidebar() {
  return (
    <div className="w-64 bg-white h-screen shadow-md p-6">
      <h2 className="text-xl font-bold text-blue-600 mb-8">Xe Limou Việt Trung</h2>

      <ul className="space-y-4">
        <li className="bg-blue-100 text-blue-600 px-4 py-2 rounded-lg">Nhân viên</li>
        <li className="text-gray-600 px-4 py-2 hover:bg-gray-100 rounded-lg cursor-pointer">
          Chi nhánh
        </li>
        <li className="text-gray-600 px-4 py-2 hover:bg-gray-100 rounded-lg cursor-pointer">Xe</li>
      </ul>
    </div>
  );
}
