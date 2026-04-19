// src/services/ticket.service.ts
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

// ============================================================================
// 1. CẤU HÌNH & KIỂU DỮ LIỆU
// ============================================================================

export interface TicketAddRequest {
  planId: number;
  carId: number;
  seatIds: number[];
  branchId?: number;
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

export interface TicketInfo {
  id: number;
  bookingCode: string;
  totalAmount: number;
  status: string;
  distanceKm: number;
  accountId: number;
  planId: number;
  carId: number;
  note?: string;
  bookingDate?: string;
  [key: string]: unknown;
}

// Interface cho phản hồi đặt vé thành công
export interface BookTicketResponse {
  success: boolean;
  message?: string;
  result?: TicketInfo;
  data?: TicketInfo;
}

const ticketClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

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
 * 1. Lấy khoảng cách thực tế từ OSRM
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
      return Number((distanceInMeters / 1000).toFixed(1));
    }
    return 0;
  } catch (error) {
    console.error("OSRM Error:", error);
    return 0;
  }
};

/**
 * 1.5 Lấy khoảng cách đi qua nhiều trạm
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

    const responseData = response.data as Record<string, Record<string, number> | number>;
    const data = (responseData?.result || responseData?.data || responseData) as Record<
      string,
      number
    >;

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
 * Đã thay thế Promise<any> bằng Promise<BookTicketResponse>
 */
export const bookTicket = async (payload: TicketAddRequest): Promise<BookTicketResponse> => {
  try {
    const response = await ticketClient.post<BookTicketResponse>(`/ticket`, payload);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi đặt vé:", error);
    throw error;
  }
};

/**
 * 4. Lấy danh sách lịch sử đặt vé
 * Đã thay thế Promise<any[]> bằng Promise<TicketInfo[]>
 */
export const getMyTickets = async (): Promise<TicketInfo[]> => {
  try {
    const response = await ticketClient.get(`/ticket`);
    const data = response.data;

    // Xử lý các trường hợp bọc dữ liệu khác nhau của backend
    if (Array.isArray(data)) return data;
    return data?.tickets || data?.result || data?.data || [];
  } catch (error) {
    console.error("Lỗi khi lấy danh sách vé:", error);
    return [];
  }
};
export const updateTicketStatus = async (ticketId: number, status: string) => {
  try {
    const response = await ticketClient.put(`/ticket/${ticketId}/status`, status, {
      headers: {
        "Content-Type": "text/plain",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi cập nhật status:", error);
    throw error;
  }
};
