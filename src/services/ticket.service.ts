// src/services/ticket.service.ts
import axios from "axios";

// ============================================================================
// 1. CẤU HÌNH CHUNG & KIỂU DỮ LIỆU
// ============================================================================
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export interface TicketAddRequest {
  planId: number;
  carId: number;
  seatIds: number[];
  startStationId: number;
  endStationId: number;
  distanceKm: number;
  totalAmount: number;
  note?: string;
  status?: string;
}

export interface PriceResponse {
  price: number;
  totalSeat: number;
}

// Tạo Instance riêng cho Ticket để xử lý Token tự động
const ticketClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor: Tự động lấy Token từ LocalStorage gắn vào mỗi lần gọi API
ticketClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ============================================================================
// 2. CÁC HÀM XỬ LÝ API
// ============================================================================

/**
 * 1. Lấy khoảng cách thực tế từ OSRM (Dùng server cộng đồng)
 */
export const calculateDistanceOSRM = async (
  lngA: number,
  latA: number,
  lngB: number,
  latB: number,
): Promise<number> => {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${lngA},${latA};${lngB},${latB}?overview=false`;
    const response = await axios.get(url);

    if (response.data && response.data.routes && response.data.routes.length > 0) {
      const distanceInMeters = response.data.routes[0].distance;
      // Trình bày đẹp: 155.543m -> 155.5 km
      return Number((distanceInMeters / 1000).toFixed(1));
    }
    return 0;
  } catch (error) {
    console.error("OSRM Error:", error);
    return 0; // Trả về 0 thay vì throw error để giao diện không bị crash trắng trang
  }
};

/**
 * 1.5 Lấy khoảng cách đi qua nhiều trạm từ OSRM
 */
export const calculateDistanceOSRMList = async (
  coordinates: { lng: number; lat: number }[],
): Promise<number> => {
  try {
    if (coordinates.length < 2) return 0;
    const coordsString = coordinates.map((c) => `${c.lng},${c.lat}`).join(";");
    const url = `https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=false`;
    const response = await axios.get(url);

    if (response.data && response.data.routes && response.data.routes.length > 0) {
      const distanceInMeters = response.data.routes[0].distance;
      return Number((distanceInMeters / 1000).toFixed(1));
    }
    return 0;
  } catch (error) {
    console.error("OSRM Error:", error);
    return 0;
  }
};

/**
 * 2. Xem trước giá vé (Preview)
 */
export const previewTicketPrice = async (payload: {
  carType: string;
  distanceKm: number;
  seatCount: number;
}): Promise<PriceResponse> => {
  try {
    const response = await ticketClient.get(`/rules/price`, {
      params: {
        carType: payload.carType,
        distance: payload.distanceKm,
        totalSeat: payload.seatCount,
      },
    });
    const responseData = response.data;

    // Logic bóc tách: Nếu Backend bọc trong result thì lấy result, không thì lấy cả data
    const data = responseData?.result || responseData?.data || responseData;

    return {
      price: data?.price || data?.totalAmount || data?.totalPrice || 0,
      totalSeat: data?.totalSeat || data?.totalSeats || payload.seatCount,
    };
  } catch (error) {
    console.error("Lỗi khi tính giá vé:", error);
    throw error;
  }
};

/**
 * 3. Xác nhận đặt vé chính thức (Book)
 * ĐÃ FIX LỖI ANY -> Record<string, unknown>
 */
export const bookTicket = async (payload: TicketAddRequest): Promise<Record<string, unknown>> => {
  try {
    const response = await ticketClient.post(`/ticket`, payload);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi đặt vé:", error);
    throw error;
  }
};

/**
 * 4. Lấy danh sách lịch sử đặt vé
 * ĐÃ FIX LỖI ANY -> Record<string, unknown>[]
 */
export const getMyTickets = async (): Promise<Record<string, unknown>[]> => {
  try {
    const response = await ticketClient.get(`/ticket`);
    const data = response.data;
    // Tùy theo cấu trúc TicketListResponse (có thể bọc trong tickets hoặc result)
    return data?.tickets || data?.result || data || [];
  } catch (error) {
    console.error("Lỗi khi lấy danh sách vé:", error);
    return [];
  }
};
