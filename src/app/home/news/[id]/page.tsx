"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { newsService } from "@/services/newsService";
import { NewsItem } from "@/model/news";
import { Button, Spin, message, Breadcrumb, Tag, Divider } from "antd";
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  HomeOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

export default function NewsDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [news, setNews] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const newsId = params.id as string;

  useEffect(() => {
    const fetchNewsDetail = async (): Promise<void> => {
      try {
        setLoading(true);
        if (newsId) {
          const data = await newsService.getNewsById(newsId);
          setNews(data);
        }
      } catch (error) {
        message.error("Không thể tải chi tiết tin tức");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchNewsDetail();
  }, [newsId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spin size="large" tip="Đang tải tin tức..." />
      </div>
    );
  }

  if (!news) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-600">Không tìm thấy bài viết này!</h2>
        <Button type="primary" className="mt-4" onClick={() => router.push("/home")}>
          Quay lại trang chủ
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* 1. BREADCRUMBS & NAVIGATION */}
      <div className="max-w-[1000px] mx-auto px-6 pt-8">
        <Breadcrumb
          items={[
            {
              title: (
                <span className="cursor-pointer" onClick={() => router.push("/home")}>
                  <HomeOutlined /> Trang chủ
                </span>
              ),
            },
            {
              title: "Tin tức",
            },
            {
              title: <span className="line-clamp-1">{news.title}</span>,
            },
          ]}
        />
        <Button
          type="primary"
          size="large"
          className="mt-6 h-12 px-8 font-bold rounded-xl bg-blue-600"
          onClick={() => router.push("/home")}
        >
          Về trang chủ đặt vé
        </Button>
      </div>

      {/* 2. MAIN CONTENT AREA */}
      <article className="max-w-[1000px] mx-auto px-6 py-10">
        {/* Title Section */}
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Tag color="blue" className="px-3 py-1 text-sm font-medium">
              Tin mới nhất
            </Tag>
            <span className="text-gray-400 flex items-center gap-1 text-sm">
              <CalendarOutlined />
              {dayjs(news.startTime).format("DD/MM/YYYY")}
            </span>
            <span className="text-gray-400 flex items-center gap-1 text-sm ml-4">
              <ClockCircleOutlined />
              {dayjs(news.startTime).format("HH:mm")}
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 leading-tight mb-6">
            {news.title}
          </h1>
        </header>

        {/* Feature Image */}
        <div className="w-full h-[300px] md:h-[500px] rounded-3xl overflow-hidden mb-10 shadow-lg border border-gray-100">
          <img
            src={
              news.imageUrl ||
              "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070"
            }
            alt={news.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content Section */}
        <div className="text-slate-700 text-lg leading-relaxed space-y-6 whitespace-pre-line">
          {/* 
            Nếu content là dạng HTML từ Editor, bạn có thể dùng:
            <div dangerouslySetInnerHTML={{ __html: news.content }} />
            Còn nếu là text thuần thì render trực tiếp:
          */}
          {news.content}
        </div>

        <Divider className="my-16" />

        {/* Footer of article */}
        <footer className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
          <h3 className="text-xl font-bold text-slate-800 mb-4">Lưu ý từ nhà xe</h3>
          <p className="text-gray-600">
            Tin tức này được cập nhật vào lúc{" "}
            {dayjs(news.startTime).format("HH:mm, [ngày] DD/MM/YYYY")}. Để biết thêm thông tin chi
            tiết và được hỗ trợ nhanh nhất, quý khách vui lòng liên hệ hotline bộ phận chăm sóc
            khách hàng.
          </p>
          <Button
            type="primary"
            size="large"
            className="mt-6 h-12 px-8 font-bold rounded-xl bg-blue-600"
            onClick={() => router.push("/home")}
          >
            Về trang chủ đặt vé
          </Button>
        </footer>
      </article>

      {/* Spacer */}
      <div className="h-20"></div>
    </div>
  );
}
