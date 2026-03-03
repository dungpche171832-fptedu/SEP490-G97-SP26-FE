export default function Header() {
  return (
    <div className="bg-white px-8 py-4 flex justify-between items-center shadow-sm">
      <input
        className="bg-gray-100 px-4 py-2 rounded-lg w-96"
        placeholder="Tìm kiếm nhân viên..."
      />

      <div className="font-semibold">Admin Việt Trung</div>
    </div>
  );
}
