import { NewsPayload } from "../model/news";

const API_URL = "http://localhost:8080/api/news";

export const newsService = {
  uploadImage: async (file: File): Promise<string> => {
    return URL.createObjectURL(file);
  },

  createNews: async (data: NewsPayload): Promise<unknown> => {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || "Có lỗi xảy ra khi thêm mới tin tức!");
    }

    return response.json();
  },
};
