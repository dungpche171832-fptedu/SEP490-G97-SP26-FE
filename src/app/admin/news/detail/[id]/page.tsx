"use client";
import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Save, X, Trash2, Upload } from "lucide-react";
import { NewsPayload } from "@/model/news";
import { newsService } from "@/services/newsService";
import { useRouter, useParams } from "next/navigation";

export default function NewsDetailPage() {
  const params = useParams();
  const newsId = Number(params.id);
  const router = useRouter();

  const [formData, setFormData] = useState<NewsPayload>({
    title: "",
    content: "",
    imageUrl: "",
    isActive: true,
    displayOrder: 0,
    startTime: "",
    endTime: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!newsId || isNaN(newsId)) return;
    const fetchDetail = async () => {
      try {
        const data = await newsService.getNewsById(newsId);
        setFormData({
          title: data.title,
          content: data.content,
          imageUrl: data.imageUrl,
          isActive: data.isActive,
          displayOrder: data.displayOrder,
          startTime: data.startTime ? data.startTime.slice(0, 16) : "",
          endTime: data.endTime ? data.endTime.slice(0, 16) : "",
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Không thể tải thông tin chi tiết tin tức.";
        setError(errorMessage);
      }
    };
    fetchDetail();
  }, [newsId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggle = () => {
    setFormData((prev) => ({ ...prev, isActive: !prev.isActive }));
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      try {
        const base64String = await convertToBase64(files[0]);
        setFormData((prev) => ({ ...prev, imageUrl: base64String }));
        setError(null);
      } catch (err) {
        setError("Lỗi khi chuyển đổi ảnh");
      }
    }
  };

  const getFormattedTimestamp = (value?: string): string => {
    if (!value) {
      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, "0");
      const d = String(now.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}T00:00:00.000`;
    }
    const [datePart] = value.split("T");
    return `${datePart}T00:00:00.000`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsId || isNaN(newsId)) return;
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    const payload: NewsPayload = {
      ...formData,
      displayOrder: Number(formData.displayOrder),
      startTime: getFormattedTimestamp(formData.startTime),
      endTime: getFormattedTimestamp(formData.endTime),
    };

    try {
      await newsService.updateNews(newsId, payload);
      setSuccess("Cập nhật tin tức thành công!");

      setTimeout(() => {
        router.push("/admin/news");
      }, 1200);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Không thể kết nối tới server";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!newsId || isNaN(newsId)) return;
    const isConfirmed = window.confirm("Bạn có chắc chắn muốn xóa tin tức này không?");
    if (!isConfirmed) return;

    setIsDeleting(true);
    setError(null);

    try {
      await newsService.deleteNews(newsId);
      setSuccess("Xóa tin tức thành công!");
      setTimeout(() => {
        router.push("/admin/news");
      }, 1200);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Không thể xóa tin tức";
      setError(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/80 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Chi tiết & Chỉnh sửa tin tức
          </h1>
          <button
            onClick={() => router.push("/admin/news")}
            className="flex items-center gap-2 text-sm !text-black hover:text-gray-900 bg-white px-4 py-2 rounded-xl border border-gray-300 shadow-sm hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <ArrowLeft size={16} />
            Quay lại
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex justify-between items-center shadow-sm">
            <span>{error}</span>
            <button onClick={() => setError(null)}>
              <X size={16} />
            </button>
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 shadow-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Tiêu đề tin tức <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="Nhập tiêu đề..."
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm !text-black focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 placeholder-gray-400"
              />
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Nội dung chi tiết <span className="text-red-500">*</span>
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                required
                rows={14}
                placeholder="Nhập nội dung bài viết..."
                className="w-full p-4 bg-white border border-gray-300 rounded-xl text-sm !text-black focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 resize-none placeholder-gray-400"
              ></textarea>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <label className="block text-sm font-semibold text-gray-900 mb-2">Ảnh đại diện</label>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 bg-gray-50/30 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50/80 mb-4"
              >
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl mb-4">
                  <Upload size={24} />
                </div>
                <span className="text-sm font-medium text-gray-900">Click để tải ảnh lên</span>
                <span className="text-xs text-gray-400 mt-1">PNG, JPG hoặc GIF (tối đa 5MB)</span>
              </div>

              {formData.imageUrl && (
                <div className="mt-3">
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-xl border border-gray-300 shadow-sm"
                  />
                </div>
              )}

              <div className="mt-4">
                <label className="text-xs text-gray-500">Hoặc nhập URL hình ảnh:</label>
                <input
                  type="text"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Thứ tự hiển thị
                </label>
                <input
                  type="number"
                  name="displayOrder"
                  value={formData.displayOrder}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm !text-black focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div>
                  <span className="block text-sm font-semibold text-gray-900">
                    Trạng thái Active
                  </span>
                  <span className="text-xs text-gray-500 block mt-0.5">
                    Bật để hiển thị bài viết
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleToggle}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Thời gian bắt đầu
                </label>
                <input
                  type="datetime-local"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 !text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Thời gian kết thúc
                </label>
                <input
                  type="datetime-local"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 !text-black"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => router.push("/admin/news")}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm font-semibold !text-black bg-yellow-200 hover:bg-gray-50 transition-colors shadow-sm"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
                >
                  <Save size={16} />
                  <span>{isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
              >
                <Trash2 size={16} />
                <span>{isDeleting ? "Đang xóa..." : "Xóa tin tức"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
