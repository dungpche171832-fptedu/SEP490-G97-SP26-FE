"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button, Carousel, DatePicker, Select, message } from "antd";
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
  const [messageApi, contextHolder] = message.useMessage();

  const [stations, setStations] = useState<Station[]>([]);
  const [departureId, setDepartureId] = useState<number | undefined>(undefined);
  const [destinationId, setDestinationId] = useState<number | undefined>(undefined);
  const [travelDate, setTravelDate] = useState<string | null>(null);
  const [newsList, setNewsList] = useState<NewsItem[]>([]);

  const carouselRef = useRef<React.ElementRef<typeof Carousel>>(null);

  useEffect(() => {
    const loadStations = async (): Promise<void> => {
      try {
        const data = await getStations();
        setStations(data.stations || []);
      } catch {
        messageApi.error("Không thể tải danh sách điểm dừng");
      }
    };

    const loadNews = async (): Promise<void> => {
      try {
        const data = await newsService.getActiveNews();
        setNewsList(Array.isArray(data) ? data.slice(0, 8) : []);
      } catch {
        messageApi.error("Không thể tải tin tức mới");
      }
    };

    loadStations();
    loadNews();
  }, [messageApi]);

  const stationOptions = stations.map((s) => {
    const stationData = s as Station & { cityName?: string };

    return {
      value: s.id,
      label: `${s.name}${stationData.cityName ? ` - ${stationData.cityName}` : ""}`,
    };
  });

  const handleSearchClick = (): void => {
    if (!departureId || !destinationId) {
      messageApi.warning("Vui lòng chọn đầy đủ điểm đi và điểm đến");
      return;
    }

    const query = new URLSearchParams();
    query.append("dep", departureId.toString());
    query.append("des", destinationId.toString());

    if (travelDate) {
      query.append("date", travelDate);
    }

    router.push(`/home/plan?${query.toString()}`);
  };

  const renderCustomArrow = (type: "prev" | "next") => {
    const isPrev = type === "prev";
    const onClick = isPrev ? () => carouselRef.current?.prev() : () => carouselRef.current?.next();
    const Icon = isPrev ? LeftOutlined : RightOutlined;

    return (
      <button
        type="button"
        onClick={onClick}
        className="flex h-14 w-14 flex-shrink-0 cursor-pointer items-center justify-center rounded-full bg-slate-100 text-white shadow-xl transition-all duration-300 hover:bg-blue-600 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2"
        aria-label={isPrev ? "Previous news" : "Next news"}
      >
        <Icon className="text-xl" />
      </button>
    );
  };

  return (
    <>
      {contextHolder}

      <div className="flex w-full flex-col bg-white">
        <section className="relative w-full overflow-hidden pb-24 pt-16">
          <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-12 px-10 md:flex-row">
            <div className="z-10 flex-1 space-y-6">
              <h1 className="text-6xl font-extrabold leading-tight text-[#0f172a]">
                Đặt vé trong <span className="text-blue-600">10 giây</span>
              </h1>

              <p className="max-w-lg text-lg leading-relaxed text-gray-500">
                Hệ thống vận tải cao cấp kết nối các tỉnh thành với đội ngũ xe Limousine hiện đại.
              </p>
            </div>

            <div className="relative flex-1">
              <div className="relative h-[500px] w-full rotate-2 overflow-hidden rounded-[40px] shadow-2xl transition-all duration-500 hover:rotate-0">
                <img
                  src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2069&auto=format&fit=crop"
                  alt="Limousine Bus"
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="absolute -bottom-6 -right-6 -z-10 h-full w-full rounded-[40px] bg-blue-50" />
            </div>
          </div>
        </section>

        <section className="relative z-20 px-10">
          <div className="mx-auto -mt-20 max-w-[1500px] rounded-3xl border border-gray-50 bg-white p-8 shadow-[0_32px_64px_-15px_rgba(0,0,0,0.1)]">
            <div className="grid grid-cols-1 items-end gap-6 md:grid-cols-4">
              <div className="flex flex-col gap-2">
                <label className="ml-1 text-xs font-bold uppercase tracking-widest text-gray-400">
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
                <label className="ml-1 text-xs font-bold uppercase tracking-widest text-gray-400">
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
                <label className="ml-1 text-xs font-bold uppercase tracking-widest text-gray-400">
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
                className="h-12 rounded-xl bg-blue-600 font-bold"
                onClick={handleSearchClick}
                icon={<SearchOutlined />}
              >
                Tìm Kiếm
              </Button>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[1440px] px-10 py-20 text-center">
          <h2 className="mb-16 text-4xl font-bold text-slate-900">Các tuyến phổ biến</h2>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                title: "Hà Nội - Tuyên Quang",
                img: "https://images.unsplash.com/photo-1623226077719-eff0d99566c6?q=80&w=1229&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
              },
              {
                title: "Hà Giang - Hà Nội",
                img: "https://images.unsplash.com/photo-1702118937156-d8f4d86076ac?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
              },
              {
                title: "Hà Nội - Hà Giang",
                img: "https://images.unsplash.com/photo-1591815595153-ace4f4f5464c?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
              },
            ].map((route) => (
              <div
                key={route.title}
                className="group relative h-[450px] cursor-pointer overflow-hidden rounded-[32px] shadow-xl transition-all duration-500 hover:-translate-y-2"
              >
                <img
                  src={route.img}
                  alt={route.title}
                  className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-110"
                />

                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/20 to-transparent p-8 text-left">
                  <h3 className="text-2xl font-bold text-white">{route.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="w-full bg-white py-16">
          <div className="mx-auto max-w-[1440px] px-6 md:px-10">
            <h2 className="mb-12 text-center text-4xl font-bold text-slate-900">Tin tức mới</h2>

            {newsList.length > 0 ? (
              <div className="flex items-center gap-6 md:gap-10">
                {renderCustomArrow("prev")}

                <div className="flex-grow overflow-hidden rounded-3xl border border-gray-100 bg-gray-50 px-4 py-8 shadow-inner md:px-8">
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
                          className="flex h-[380px] cursor-pointer flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-md"
                          onClick={() => {
                            router.push(`/news/${news.id}`);
                          }}
                        >
                          <div className="relative h-48 overflow-hidden">
                            <img
                              src={
                                news.imageUrl ||
                                "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070"
                              }
                              alt={news.title}
                              className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                            />
                          </div>

                          <div className="flex flex-1 flex-col justify-between p-5">
                            <div>
                              <h3 className="mb-2 line-clamp-2 text-lg font-bold leading-snug text-slate-800">
                                {news.title}
                              </h3>

                              <p className="line-clamp-3 text-sm leading-relaxed text-gray-500">
                                {news.content || ""}
                              </p>
                            </div>

                            <div className="mt-4 flex cursor-pointer items-center gap-1 text-sm font-semibold text-blue-600 hover:underline">
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
              <div className="py-12 text-center text-gray-400">
                Không có tin tức nào để hiển thị.
              </div>
            )}
          </div>
        </section>

        <section className="border-y border-gray-100 bg-slate-50 py-24">
          <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-16 px-10 text-center md:grid-cols-3">
            <div className="flex flex-col items-center space-y-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-100 text-3xl text-blue-600 shadow-inner">
                <SafetyCertificateOutlined />
              </div>

              <h4 className="text-xl font-bold text-slate-800">An toàn là số 1</h4>

              <p className="leading-relaxed text-gray-500">
                Đội ngũ lái xe kinh nghiệm và xe luôn được bảo dưỡng định kỳ.
              </p>
            </div>

            <div className="flex flex-col items-center space-y-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-orange-100 text-3xl text-orange-600 shadow-inner">
                <ClockCircleOutlined />
              </div>

              <h4 className="text-xl font-bold text-slate-800">Đúng giờ 100%</h4>

              <p className="leading-relaxed text-gray-500">
                Cam kết khởi hành đúng giờ, đón trả khách đúng điểm.
              </p>
            </div>

            <div className="flex flex-col items-center space-y-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-purple-100 text-3xl text-purple-600 shadow-inner">
                <CrownOutlined />
              </div>

              <h4 className="text-xl font-bold text-slate-800">Dịch vụ cao cấp</h4>

              <p className="leading-relaxed text-gray-500">
                Nội thất Limousine sang trọng, nước uống và wifi miễn phí.
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
