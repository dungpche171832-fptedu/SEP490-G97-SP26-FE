"use client";
import React, { useEffect, useState, useRef } from "react";
import { Button, DatePicker, Select, message, Carousel } from "antd";
import type { CarouselRef } from "antd";
import {
  SafetyCertificateOutlined,
  ClockCircleOutlined,
  CrownOutlined,
  SearchOutlined,
  CaretDownOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { getStations, Station } from "src/services/station.service";
import { newsService } from "@/services/newsService";
import { useRouter } from "next/navigation";
import { Dayjs } from "dayjs";
import { NewsItem } from "@/model/news";

export default function HomePage() {
  const router = useRouter();
  const [stations, setStations] = useState<Station[]>([]);
  const [departureId, setDepartureId] = useState<number | undefined>(undefined);
  const [destinationId, setDestinationId] = useState<number | undefined>(undefined);
  const [travelDate, setTravelDate] = useState<string | null>(null);
  const [newsList, setNewsList] = useState<NewsItem[]>([]);

  // Khởi tạo ref với kiểu CarouselRef
  const carouselRef = useRef<CarouselRef>(null);

  useEffect(() => {
    const loadStations = async (): Promise<void> => {
      try {
        const data = await getStations();
        setStations(data.stations || []);
      } catch {
        message.error("Không thể tải danh sách điểm dừng");
      }
    };

    const loadNews = async (): Promise<void> => {
      try {
        const data = await newsService.getActiveNews();
        setNewsList(Array.isArray(data) ? data.slice(0, 8) : []);
      } catch {
        message.error("Không thể tải tin tức mới");
      }
    };

    loadStations();
    loadNews();
  }, []);

  const stationOptions = stations.map((s) => {
    const stationData = s as Station & { cityName?: string };
    return {
      value: s.id,
      label: `${s.name}${stationData.cityName ? ` - ${stationData.cityName}` : ""}`,
    };
  });

  const handleSearchClick = (): void => {
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

  const renderCustomArrow = (type: "prev" | "next") => {
    const isPrev = type === "prev";
    const onClick = isPrev ? () => carouselRef.current?.prev() : () => carouselRef.current?.next();
    const Icon = isPrev ? LeftOutlined : RightOutlined;

    return (
      <button
        onClick={onClick}
        className="flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-full bg-[#111827] text-white shadow-xl hover:bg-blue-600 transition-all duration-300 cursor-pointer hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2"
        aria-label={isPrev ? "Previous news" : "Next news"}
      >
        <Icon className="text-xl" />
      </button>
    );
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

      <section className="relative z-20 px-10">
        <div className="max-w-[1500px] mx-auto -mt-20 bg-white p-8 rounded-3xl shadow-[0_32px_64px_-15px_rgba(0,0,0,0.1)] border border-gray-50">
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
                onChange={(val: number | undefined) => setDepartureId(val)}
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
                onChange={(val: number | undefined) => setDestinationId(val)}
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
                onChange={(date: Dayjs | null) =>
                  setTravelDate(date ? date.format("YYYY-MM-DD") : null)
                }
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

      <section className="max-w-[1440px] mx-auto px-10 py-20 w-full text-center">
        <h2 className="text-4xl font-bold text-slate-900 mb-16">Các tuyến phổ biến</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Hà Nội - Lạng Sơn",
              img: "https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=2070",
            },
            {
              title: "Hà Nội - Trung Quốc",
              img: "https://images.unsplash.com/photo-1599708153386-62bd3f02407d?q=80&w=2070",
            },
            {
              title: "Hà Nội - Hà Giang",
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

      <section className="bg-white py-16 w-full">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10">
          <h2 className="text-4xl font-bold text-slate-900 mb-12 text-center">Tin tức nổi bật</h2>
          {newsList.length > 0 ? (
            <div className="flex items-center gap-6 md:gap-10">
              {renderCustomArrow("prev")}
              <div className="flex-grow bg-gray-50 px-4 md:px-8 py-8 rounded-3xl border border-gray-100 shadow-inner overflow-hidden">
                <Carousel
                  ref={carouselRef}
                  autoplay
                  arrows={false}
                  dotPosition="bottom"
                  slidesToShow={3}
                  responsive={[
                    {
                      breakpoint: 1024,
                      settings: {
                        slidesToShow: 2,
                      },
                    },
                    {
                      breakpoint: 768,
                      settings: {
                        slidesToShow: 1,
                      },
                    },
                  ]}
                  className="gap-4"
                >
                  {newsList.map((news: NewsItem) => (
                    <div key={news.id} className="px-3">
                      <div
                        className="flex flex-col bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all h-[380px] cursor-pointer"
                        onClick={() => {
                          router.push(`/news/${news.id}`);
                        }}
                      >
                        <div className="h-48 overflow-hidden relative">
                          <img
                            src={
                              news.imageUrl ||
                              "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070"
                            }
                            alt={news.title}
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                          />
                        </div>
                        <div className="p-5 flex flex-col justify-between flex-1">
                          <div>
                            <h3 className="text-lg font-bold text-slate-800 line-clamp-2 mb-2 leading-snug">
                              {news.title}
                            </h3>
                            <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed">
                              {news.content || ""}
                            </p>
                          </div>
                          <div className="mt-4 text-blue-600 text-sm font-semibold flex items-center gap-1 cursor-pointer hover:underline">
                            Xem chi tiết &rarr;
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </Carousel>
              </div>
              {renderCustomArrow("next")}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-12">Không có tin tức nào để hiển thị.</div>
          )}
        </div>
      </section>

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
