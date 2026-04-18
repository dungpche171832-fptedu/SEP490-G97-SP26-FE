import axios from "axios";

// ============================================================================
// 1. CẤU HÌNH CHUNG & KIỂU DỮ LIỆU
// ============================================================================
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export interface TicketAddRequest {
  planId: number;
  seatIds: number[];
  startStationId: number;
  endStationId: number;
  distanceKm: number;
  totalAmount?: number;
  note?: string;
  status?: string;
  carId?: number | string;
}

export interface PriceResponse {
  price: number;
  totalSeat: number;
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

export const previewTicketPrice = async (payload: TicketAddRequest): Promise<PriceResponse> => {
  try {
    const response = await ticketClient.post(`/ticket/preview-price`, payload);
    const responseData = response.data;

    const data = responseData?.result || responseData?.data || responseData;

    return {
      price: data.price || data.totalAmount || 0,
      totalSeat: data.totalSeat || payload.seatIds.length,
    };
  } catch (error) {
    console.error("Lỗi khi tính giá vé:", error);
    throw error;
  }
};

export const bookTicket = async (payload: TicketAddRequest): Promise<Record<string, unknown>> => {
  try {
    const response = await ticketClient.post(`/ticket`, payload);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi đặt vé:", error);
    throw error;
  }
};