import { DashboardData } from "@/model/dashboard";

const BACKEND_URL = "http://localhost:8080";

// Hàm lấy token (tùy mày lưu key gì thì sửa lại)
const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

export const getDashboardData = async (
  startDate: string,
  endDate: string,
): Promise<DashboardData> => {
  const token = getToken();

  const startParam = `${startDate}T00:00:00`;
  const endParam = `${endDate}T23:59:59`; // fix mất data cuối ngày

  const queryParams = new URLSearchParams({
    start: startParam,
    end: endParam,
  }).toString();

  const response = await fetch(`${BACKEND_URL}/api/dashboard?${queryParams}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  // debug rõ lỗi backend trả về
  if (!response.ok) {
    const errorText = await response.text();
    console.error("API ERROR:", errorText);
    throw new Error(`Failed to fetch dashboard data: ${response.status}`);
  }

  return response.json();
};
