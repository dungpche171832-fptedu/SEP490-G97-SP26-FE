import { getToken } from "src/lib/auth/auth.service";

export interface City {
  id: number;
  name: string;
}

export const cityService = {
  async getAllCities(): Promise<City[]> {
    try {
      const token = getToken();

      if (!token) {
        console.warn("No token found, user might not be logged in.");
        return [];
      }

      const response = await fetch("http://localhost:8080/api/cities", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          console.error("Auth error or Token expired");
        }
        throw new Error("Failed to fetch cities");
      }

      const data = await response.json();

      // Nếu API trả về trực tiếp mảng thì dùng data, nếu bọc trong content thì dùng data.content
      return Array.isArray(data) ? data : data?.content || [];
    } catch (error) {
      console.error("cityService error:", error);
      return [];
    }
  },
};
