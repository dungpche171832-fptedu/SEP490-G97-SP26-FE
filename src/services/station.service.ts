// src/services/station.service.ts

// ==========================================
// 1. ĐỊNH NGHĨA CÁC INTERFACE (Khớp với DTO Backend)
// ==========================================

// Khớp với StationResponse.java
export interface Station {
  id: number;
  name: string;
  code: string;
  latitude: number;
  longitude: number;
  address: string;
  cityName: string;
}
export interface NominatimResult {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address?: Record<string, string>;
  boundingbox: string[];
}

// Khớp với StationDetailResponse.java
export interface StationDetail {
  id: number;
  name: string;
  code: string;
  latitude: number;
  longitude: number;
  address: string;
  cityId: number;
  cityName: string;
}

// Khớp với StationListResponse.java
export interface StationListResponse {
  stations: Station[];
  message: string;
  totalCount: number;
}

// Khớp với AddStationRequest.java
export interface AddStationRequest {
  name: string;
  code: string;
  latitude: number;
  longitude: number;
  address: string;
  cityId: number;
}

// Khớp với UpdateStationRequest.java
export interface UpdateStationRequest {
  name: string;
  code: string;
  latitude: number;
  longitude: number;
  address: string;
  cityId: number;
}

// ==========================================
// 2. CẤU HÌNH API BASE URL & TOKEN
// ==========================================

// Đổi cổng 8080 thành cổng thực tế Backend của bạn nếu khác
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/stations";

// Hàm hỗ trợ lấy Token (nếu các API yêu cầu đăng nhập)
const getHeaders = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// ==========================================
// 3. CÁC HÀM GỌI API (Fetch)
// ==========================================

/**
 * Lấy danh sách Điểm dừng (Có hỗ trợ filter)
 * [GET] /api/stations
 */
export const getStations = async (params?: {
  name?: string;
  code?: string;
  cityId?: number | "all";
}): Promise<StationListResponse> => {
  try {
    // Xây dựng query string từ params
    const query = new URLSearchParams();
    if (params?.name) query.append("name", params.name);
    if (params?.code) query.append("code", params.code);
    if (params?.cityId && params.cityId !== "all") query.append("cityId", params.cityId.toString());

    const response = await fetch(`${API_URL}?${query.toString()}`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) throw new Error("Lỗi khi tải danh sách điểm dừng");
    return await response.json();
  } catch (error) {
    console.error("Error in getStations:", error);
    throw error;
  }
};

/**
 * Lấy chi tiết một Điểm dừng (Dùng cho màn hình View / Edit)
 * [GET] /api/stations/{stationId}
 */
export const getStationDetail = async (stationId: number): Promise<StationDetail> => {
  try {
    const response = await fetch(`${API_URL}/${stationId}`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) throw new Error("Lỗi khi tải chi tiết điểm dừng");
    return await response.json();
  } catch (error) {
    console.error("Error in getStationDetail:", error);
    throw error;
  }
};

/**
 * Thêm mới Điểm dừng
 * [POST] /api/stations
 */
export const addStation = async (data: AddStationRequest): Promise<Station> => {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Lỗi khi thêm điểm dừng");
    }

    return await response.json();
  } catch (error) {
    console.error("Error in addStation:", error);
    throw error;
  }
};

/**
 * Cập nhật Điểm dừng
 * [PUT] /api/stations/{stationId}
 */
export const updateStation = async (
  stationId: number,
  data: UpdateStationRequest,
): Promise<Station> => {
  try {
    const response = await fetch(`${API_URL}/${stationId}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Lỗi khi cập nhật điểm dừng");
    }

    return await response.json();
  } catch (error) {
    console.error("Error in updateStation:", error);
    throw error;
  }
};
