"use client";

import React from "react";
import { Button, Input, DatePicker, Select } from "antd";
import {
  SafetyCertificateOutlined,
  ClockCircleOutlined,
  CrownOutlined,
  SearchOutlined,
} from "@ant-design/icons";

export default function HomePage() {
  return (
    <div className="flex flex-col w-full bg-white">
      {/* 1. HERO SECTION */}
      <section className="relative w-full pt-16 pb-24 overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-10 flex flex-col md:flex-row items-center justify-between gap-12">
          {/* Left Text */}
          <div className="flex-1 space-y-6 z-10">
            <h1 className="text-6xl font-extrabold text-[#0f172a] leading-tight">
              Đặt vé trong <span className="text-blue-600">10 giây</span>
            </h1>
            <p className="text-gray-500 text-lg max-w-lg leading-relaxed">
              Hệ thống vận tải cao cấp kết nối các tỉnh thành với đội ngũ xe Limousine hiện đại, an
              toàn và chuyên nghiệp nhất Việt Nam.
            </p>
            <Button
              type="primary"
              size="large"
              className="h-14 px-10 text-lg font-bold rounded-xl bg-blue-600 border-none shadow-lg shadow-blue-200 hover:scale-105 transition-transform"
            >
              Tìm Chuyến Ngay
            </Button>
          </div>

          {/* Right Image Container */}
          <div className="flex-1 relative">
            <div className="w-full h-[500px] rounded-[40px] overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-all duration-500">
              <img
                src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2069&auto=format&fit=crop"
                alt="Limousine Bus"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Trang trí phía sau ảnh */}
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
                placeholder="Chọn điểm đi"
                size="large"
                className="w-full"
                suffixIcon={<SearchOutlined />}
                options={[
                  { value: "hanoi", label: "Hà Nội" },
                  { value: "laocai", label: "Lào Cai" },
                ]}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                Điểm đến
              </label>
              <Select
                showSearch
                placeholder="Chọn điểm đến"
                size="large"
                className="w-full"
                options={[
                  { value: "quangninh", label: "Quảng Ninh" },
                  { value: "haiphong", label: "Hải Phòng" },
                ]}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                Ngày đi
              </label>
              <DatePicker size="large" className="w-full" placeholder="Chọn ngày" />
            </div>

            <Button
              type="primary"
              size="large"
              className="h-12 bg-blue-600 font-bold rounded-xl"
              icon={<SearchOutlined />}
            >
              Tìm Kiếm
            </Button>
          </div>
        </div>
      </section>

      {/* 3. POPULAR ROUTES SECTION */}
      <section className="max-w-[1440px] mx-auto px-10 py-32 w-full">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl font-bold text-slate-900">Các tuyến đường phổ biến</h2>
          <p className="text-gray-400">Gợi ý những hành trình tuyệt vời nhất dành cho bạn</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Hà Nội - Lào Cai",
              desc: "Hơn 40 chuyến mỗi ngày",
              img: "https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=2070&auto=format&fit=crop",
            },
            {
              title: "Hà Nội - Quảng Ninh",
              desc: "Phục vụ 24/7",
              img: "https://images.unsplash.com/photo-1599708153386-62bd3f02407d?q=80&w=2070&auto=format&fit=crop",
            },
            {
              title: "Hà Nội - Hải Phòng",
              desc: "Giá chỉ từ 220.000đ",
              img: "https://images.unsplash.com/photo-1555921015-5532091f6026?q=80&w=2070&auto=format&fit=crop",
            },
          ].map((route, i) => (
            <div
              key={i}
              className="group relative h-[450px] rounded-[32px] overflow-hidden cursor-pointer shadow-xl transition-all duration-500 hover:-translate-y-2"
            >
              <img
                src={route.img}
                className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                alt={route.title}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-8 flex flex-col justify-end">
                <h3 className="text-white text-2xl font-bold mb-1">{route.title}</h3>
                <p className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  {route.desc}
                </p>
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
              Đội ngũ lái xe kinh nghiệm, được đào tạo bài bản và xe luôn được bảo dưỡng định kỳ.
            </p>
          </div>

          <div className="flex flex-col items-center space-y-4">
            <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-3xl flex items-center justify-center text-3xl shadow-inner">
              <ClockCircleOutlined />
            </div>
            <h4 className="text-xl font-bold text-slate-800">Đúng giờ 100%</h4>
            <p className="text-gray-500 leading-relaxed">
              Cam kết khởi hành đúng giờ, đón trả khách đúng điểm đã đặt trước trên hệ thống.
            </p>
          </div>

          <div className="flex flex-col items-center space-y-4">
            <div className="w-20 h-20 bg-purple-100 text-purple-600 rounded-3xl flex items-center justify-center text-3xl shadow-inner">
              <CrownOutlined />
            </div>
            <h4 className="text-xl font-bold text-slate-800">Dịch vụ cao cấp</h4>
            <p className="text-gray-500 leading-relaxed">
              Nội thất Limousine sang trọng, nước uống và wifi miễn phí suốt hành trình.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
