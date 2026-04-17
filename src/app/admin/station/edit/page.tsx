"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeftOutlined,
  SaveOutlined,
  SearchOutlined,
  EnvironmentOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import dynamic from "next/dynamic";
import axios from "axios";

import Sidebar from "@/components/admin/Sidebar";
import Header from "@/components/admin/Header";
// ✅ Import thêm getCities và City từ service giống màn Add
import {
  getStationDetail,
  updateStation,
  getCities,
  City,
  NominatimResult,
} from "@/services/station.service";

const MapComponent = dynamic(() => import("@/components/MapPicker"), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center bg-slate-100 font-bold text-slate-900">
      ĐANG TẢI BẢN ĐỒ...
    </div>
  ),
});

function EditStationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<NominatimResult[]>([]);

  // ✅ ĐỒNG BỘ MÀN ADD: State danh sách cities từ DB
  const [cities, setCities] = useState<City[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    cityId: "",
    address: "",
    latitude: 21.028511,
    longitude: 105.804817,
  });

  // ✅ ĐỒNG BỘ MÀN ADD: Load danh sách thành phố và chi tiết trạm dừng
  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setMessage({ type: "error", text: "Thiếu ID trạm dừng trên đường dẫn!" });
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        // Chạy song song cả 2 API để tối ưu tốc độ
        const [stationData, citiesData] = await Promise.all([
          getStationDetail(Number(id)),
          getCities(),
        ]);

        setCities(citiesData || []);

        setFormData({
          name: stationData.name,
          code: stationData.code,
          cityId: stationData.cityId.toString(),
          address: stationData.address || "",
          latitude: stationData.latitude,
          longitude: stationData.longitude,
        });

        // Hiển thị địa chỉ hiện tại lên thanh search để đồng bộ
        setSearchQuery(stationData.address || "");
      } catch (error: unknown) {
        console.error("Fetch error:", error);
        setMessage({ type: "error", text: "Lỗi: Không thể tải dữ liệu từ hệ thống." });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleAddressSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const res = await axios.get<NominatimResult[]>(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&countrycodes=vn,cn`,
      );
      setSearchResults(res.data);
    } catch (error) {
      console.error("Lỗi tìm kiếm:", error);
    }
  };

  const handleSelectPlace = (place: NominatimResult) => {
    const lat = parseFloat(place.lat);
    const lon = parseFloat(place.lon);
    setFormData((prev) => ({
      ...prev,
      address: place.display_name,
      latitude: lat,
      longitude: lon,
    }));
    setSearchResults([]);
    setSearchQuery(place.display_name);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setIsSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      const payload = {
        name: formData.name,
        code: formData.code,
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
        address: formData.address,
        cityId: Number(formData.cityId),
      };

      await updateStation(Number(id), payload);
      setMessage({ type: "success", text: "Cập nhật trạm dừng thành công!" });
      setTimeout(() => router.push("/admin/station"), 1500);
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : "Lỗi cập nhật dữ liệu.";
      setMessage({ type: "error", text: errorMsg });
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-[15px] font-bold !text-slate-950 !opacity-100 outline-none focus:border-blue-500 transition-all shadow-sm";

  if (isLoading)
    return (
      <div className="flex h-screen items-center justify-center bg-white ml-64 text-slate-900 font-bold">
        <div className="text-center">
          <LoadingOutlined className="text-4xl text-blue-600 mb-4" />
          <p className="tracking-widest uppercase text-xs">Đang lấy dữ liệu trạm dừng...</p>
        </div>
      </div>
    );

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      <Sidebar />
      <main className="flex-1 flex flex-col ml-64 overflow-hidden pt-16">
        <Header />
        <div className="p-8 h-full overflow-y-auto font-bold">
          {message.text && (
            <div
              className={`mb-6 p-4 rounded-xl border-2 font-bold ${
                message.type === "error"
                  ? "bg-red-50 text-red-600 border-red-100"
                  : "bg-green-50 text-green-600 border-green-100"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="mb-8 text-slate-900">
            <button
              onClick={() => router.push("/admin/station")}
              className="flex items-center gap-2 text-slate-600 hover:text-blue-600 font-black mb-2 transition-colors text-xs uppercase tracking-wider"
            >
              <ArrowLeftOutlined /> Quay lại danh sách
            </button>
            <h2 className="text-3xl font-black tracking-tight">Chỉnh sửa Điểm dừng</h2>
            <p className="text-slate-500 text-sm">
              Cập nhật thông tin chi tiết và vị trí của trạm.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-slate-900"
          >
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                <div className="space-y-6">
                  <div>
                    <label className="block text-[11px] font-black text-slate-700 uppercase tracking-widest mb-2">
                      Tên điểm dừng *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={inputClass}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-700 uppercase tracking-widest mb-2">
                      Mã điểm dừng *
                    </label>
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleChange}
                      className={`${inputClass} font-mono uppercase text-blue-700`}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-700 uppercase tracking-widest mb-2">
                      Tỉnh/Thành phố *
                    </label>
                    <select
                      name="cityId"
                      value={formData.cityId}
                      onChange={handleChange}
                      className={inputClass}
                      required
                    >
                      <option value="">-- Chọn khu vực --</option>
                      {cities.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">
                        Latitude
                      </label>
                      <input
                        type="text"
                        value={formData.latitude}
                        readOnly
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">
                        Longitude
                      </label>
                      <input
                        type="text"
                        value={formData.longitude}
                        readOnly
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900"
                      />
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-10 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-black text-sm flex items-center justify-center gap-3 shadow-lg shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-50"
                >
                  <SaveOutlined className="text-lg" />{" "}
                  {isSubmitting ? "ĐANG CẬP NHẬT..." : "CẬP NHẬT TRẠM DỪNG"}
                </button>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="w-full h-[620px] bg-white rounded-2xl border border-slate-200 relative overflow-hidden shadow-sm">
                <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[90%] z-[1000]">
                  <div className="bg-white shadow-2xl rounded-2xl flex items-center p-2 border border-slate-100">
                    <SearchOutlined className="mx-3 text-blue-500 text-xl" />
                    <input
                      type="text"
                      placeholder="Tìm địa chỉ mới trên bản đồ..."
                      className="flex-1 outline-none text-[15px] font-bold py-2 text-slate-950"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddressSearch()}
                    />
                    <button
                      type="button"
                      onClick={handleAddressSearch}
                      className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold text-xs hover:bg-blue-600 transition-colors"
                    >
                      TÌM
                    </button>
                  </div>
                  {searchResults.length > 0 && (
                    <div className="mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 max-h-64 overflow-y-auto">
                      {searchResults.map((result, index) => (
                        <div
                          key={index}
                          className="p-4 hover:bg-blue-50 cursor-pointer border-b border-slate-50 flex items-start gap-3 transition-colors group"
                          onClick={() => handleSelectPlace(result)}
                        >
                          <EnvironmentOutlined className="mt-1 text-slate-400 group-hover:text-blue-500" />
                          <span className="text-[13px] font-bold text-slate-700 group-hover:text-slate-950 leading-tight">
                            {result.display_name}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="w-full h-full p-2">
                  <MapComponent
                    latitude={formData.latitude}
                    longitude={formData.longitude}
                    onLocationSelect={(lat: number, lng: number) =>
                      setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }))
                    }
                  />
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default function EditStationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center font-bold text-slate-900">
          <LoadingOutlined className="mr-2" /> ĐANG TẢI ỨNG DỤNG...
        </div>
      }
    >
      <EditStationContent />
    </Suspense>
  );
}
