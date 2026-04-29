"use client";
import React, { useEffect, useState } from "react";
import { Button, DatePicker, Select, message } from "antd";
import {
  SafetyCertificateOutlined,
  ClockCircleOutlined,
  CrownOutlined,
  SearchOutlined,
  CaretDownOutlined,
} from "@ant-design/icons";
import { getStations, Station } from "src/services/station.service";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [stations, setStations] = useState<Station[]>([]);
  const [departureId, setDepartureId] = useState<number | undefined>(undefined);
  const [destinationId, setDestinationId] = useState<number | undefined>(undefined);
  const [travelDate, setTravelDate] = useState<string | null>(null);

  useEffect(() => {
    const loadStations = async () => {
      try {
        const data = await getStations();
        setStations(data.stations || []);
      } catch {
        message.error("Không thể tải danh sách điểm dừng");
      }
    };
    loadStations();
  }, []);

  const stationOptions = stations.map((s: Station) => ({
    value: s.id,
    label: s.name,
  }));

  const handleSearchClick = () => {
    if (!departureId || !destinationId) {
      message.warning("Vui lòng chọn đầy đủ điểm đi và điểm đến");
      return;
    }

    const query = new URLSearchParams();
    query.append("dep", departureId.toString());
    query.append("des", destinationId.toString());
    if (travelDate) query.append("date", travelDate);

    router.push(`/home/plan?${query.toString()}`);
  };

  return (
    <div className="flex flex-col w-full bg-white">
      <section className="relative w-full pt-16 pb-24 overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-10 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="flex-1 space-y-6 z-10">
            <h1 className="text-6xl font-extrabold text-[#0f172a] leading-tight">
              Đặt vé trong <span className="text-blue-600">10 giây</span>
            </h1>
            <p className="text-gray-500 text-lg max-w-lg leading-relaxed">
              Hệ thống vận tải cao cấp kết nối các tỉnh thành với đội ngũ xe Limousine hiện đại.
            </p>
          </div>

          <div className="flex-1 relative">
            <div className="w-full h-[500px] rounded-[40px] overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-all duration-500 relative">
              <img
                src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2069&auto=format&fit=crop"
                alt="Limousine Bus"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -z-10 -bottom-6 -right-6 w-full h-full bg-blue-50 rounded-[40px]"></div>
          </div>
        </div>
      </section>

      {/* 2. SEARCH BOX SECTION */}
      <section className="relative z-20 px-10">
        <div className="max-w-[1100px] mx-auto -mt-20 bg-white p-8 rounded-3xl shadow-[0_32px_64px_-15px_rgba(0,0,0,0.1)] border border-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                Điểm đi
              </label>
              <Select
                showSearch
                allowClear
                placeholder="Chọn điểm đi"
                size="large"
                className="w-full"
                options={stationOptions}
                value={departureId}
                onChange={(val) => setDepartureId(val)}
                optionFilterProp="label"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                Điểm đến
              </label>
              <Select
                showSearch
                allowClear
                placeholder="Chọn điểm đến"
                size="large"
                className="w-full"
                options={stationOptions}
                value={destinationId}
                onChange={(val) => setDestinationId(val)}
                optionFilterProp="label"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                Ngày đi
              </label>
              <DatePicker
                size="large"
                className="w-full"
                placeholder="Chọn ngày"
                suffixIcon={<CaretDownOutlined />}
                onChange={(date) => setTravelDate(date ? date.format("YYYY-MM-DD") : null)}
              />
            </div>

            <Button
              type="primary"
              size="large"
              className="h-12 bg-blue-600 font-bold rounded-xl"
              onClick={handleSearchClick}
              icon={<SearchOutlined />}
            >
              Tìm Kiếm
            </Button>
          </div>
        </div>
      </section>

      {/* 3. POPULAR ROUTES SECTION */}
      <section className="max-w-[1440px] mx-auto px-10 py-32 w-full text-center">
        <h2 className="text-4xl font-bold text-slate-900 mb-16">Tin Tức Mới</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Hà Nội - Lào Cai",
              img: "https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=2070",
            },
            {
              title: "Hà Nội - Quảng Ninh",
              img: "https://images.unsplash.com/photo-1599708153386-62bd3f02407d?q=80&w=2070",
            },
            {
              title: "Hà Nội - Hải Phòng",
              img: "https://images.unsplash.com/photo-1555921015-5532091f6026?q=80&w=2070",
            },
          ].map((route, i) => (
            <div
              key={i}
              className="group relative h-[450px] rounded-[32px] overflow-hidden cursor-pointer shadow-xl transition-all duration-500 hover:-translate-y-2"
            >
              <img
                src={route.img}
                alt={route.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-8 flex flex-col justify-end text-left">
                <h3 className="text-white text-2xl font-bold">{route.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. FEATURES SECTION */}
      <section className="bg-slate-50 py-24 border-y border-gray-100">
        <div className="max-w-[1440px] mx-auto px-10 grid grid-cols-1 md:grid-cols-3 gap-16 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center text-3xl shadow-inner">
              <SafetyCertificateOutlined />
            </div>
            <h4 className="text-xl font-bold text-slate-800">An toàn là số 1</h4>
            <p className="text-gray-500 leading-relaxed">
              Đội ngũ lái xe kinh nghiệm và xe luôn được bảo dưỡng định kỳ.
            </p>
          </div>

          <div className="flex flex-col items-center space-y-4">
            <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-3xl flex items-center justify-center text-3xl shadow-inner">
              <ClockCircleOutlined />
            </div>
            <h4 className="text-xl font-bold text-slate-800">Đúng giờ 100%</h4>
            <p className="text-gray-500 leading-relaxed">
              Cam kết khởi hành đúng giờ, đón trả khách đúng điểm.
            </p>
          </div>

          <div className="flex flex-col items-center space-y-4">
            <div className="w-20 h-20 bg-purple-100 text-purple-600 rounded-3xl flex items-center justify-center text-3xl shadow-inner">
              <CrownOutlined />
            </div>
            <h4 className="text-xl font-bold text-slate-800">Dịch vụ cao cấp</h4>
            <p className="text-gray-500 leading-relaxed">
              Nội thất Limousine sang trọng, nước uống và wifi miễn phí.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
