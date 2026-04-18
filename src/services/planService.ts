import { PlanResponse } from "../model/plan";

export interface PlanDetailResponse {
  id: number;
  code: string;
  carId: number;
  carLicensePlate: string;
  accountId: number;
  driverName: string;
  startTime: string;
  endTime: string;
  status: string;
  stations?: {
    stationId: number;
    stationName: string;
    stationOrder: number;
  }[];
  seats?: {
    seatId: number;
    seatNumber: string;
    status: string;
  }[];
}

export interface UpdatePlanStatusPayload {
  status: string;
}

export const planService = {
  getListPlans: async (): Promise<PlanResponse> => {
    const token = localStorage.getItem("token");

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch("http://localhost:8080/api/plans", {
      method: "GET",
      headers,
    });

    if (response.status === 401 || response.status === 403) {
      throw new Error("Phiên đăng nhập hết hạn hoặc không có quyền.");
    }

    if (!response.ok) throw new Error("Lỗi kết nối API");

    return await response.json();
  },

  getPlanDetail: async (id: string | number): Promise<PlanDetailResponse> => {
    const token = localStorage.getItem("token");

    const response = await fetch(`http://localhost:8080/api/plans/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401 || response.status === 403) {
      throw new Error("Phiên đăng nhập hết hạn hoặc không có quyền.");
    }

    if (!response.ok) throw new Error("Không lấy được chi tiết lịch trình");

    return await response.json();
  },

  updatePlanStatus: async (
    id: string | number,
    payload: UpdatePlanStatusPayload,
  ): Promise<PlanDetailResponse> => {
    const token = localStorage.getItem("token");

    const response = await fetch(`http://localhost:8080/api/plans/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (response.status === 401 || response.status === 403) {
      throw new Error("Phiên đăng nhập hết hạn hoặc không có quyền.");
    }

    if (!response.ok) throw new Error("Không cập nhật được trạng thái lịch trình");

    return await response.json();
  },
};
