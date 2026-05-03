import { NewsPayload, NewsItem } from "@/model/news";

const API_URL = "http://localhost:8080/api/news";

const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

export const newsService = {
  uploadImage: async (file: File): Promise<string> => {
    return URL.createObjectURL(file);
  },

  getListAdmin: async (): Promise<NewsItem[]> => {
    const token = getToken();
    const response = await fetch(`${API_URL}/admin`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || "Có lỗi xảy ra khi lấy danh sách tin tức!");
    }

    return response.json();
  },

  getNewsById: async (id: number | string): Promise<NewsItem> => {
    const token = getToken();
    const response = await fetch(`${API_URL}/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || "Có lỗi xảy ra khi lấy thông tin chi tiết!");
    }

    return response.json();
  },

  createNews: async (data: NewsPayload): Promise<unknown> => {
    const token = getToken();
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || "Có lỗi xảy ra khi thêm mới tin tức!");
    }

    return response.json();
  },

  updateNews: async (id: number | string, data: NewsPayload): Promise<unknown> => {
    const token = getToken();
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || "Có lỗi xảy ra khi cập nhật tin tức!");
    }

    return response.json();
  },

  deleteNews: async (id: number | string): Promise<unknown> => {
    const token = getToken();
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || "Có lỗi xảy ra khi xóa tin tức!");
    }

    return response.json();
  },

  getActiveNews: async (): Promise<NewsItem[]> => {
    const response = await fetch(`${API_URL}/active`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || "Có lỗi xảy ra khi lấy danh sách tin tức!");
    }

    return response.json();
  },
};
