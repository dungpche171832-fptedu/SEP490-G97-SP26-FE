import type {
  PlanResponse,
  PlanDetailResponse,
  UpdatePlanStatusPayload,
  CreatePlanPayload,
} from "../model/plan";

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
  createPlan: async (payload: CreatePlanPayload): Promise<PlanDetailResponse> => {
    const token = localStorage.getItem("token");

    const response = await fetch("http://localhost:8080/api/plans", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (response.status === 401 || response.status === 403) {
      throw new Error("Phiên đăng nhập hết hạn hoặc không có quyền.");
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Không thêm được lịch trình");
    }

    return await response.json();
  },

  getPlanByIdForTicket: async (id: number | string): Promise<PlanDetailResponse> => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const response = await fetch(`http://localhost:8080/api/plans/${id}`, {
      method: "GET",

      headers: {
        "Content-Type": "application/json",

        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Lỗi lấy thông tin chi tiết");

    const data = await response.json();

    const planDetail = data.result || data.data || data;

    try {
      const stRes = await fetch(`http://localhost:8080/api/plans/${id}/stations`, {
        method: "GET",

        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${token}`,
        },
      });

      if (stRes.ok) {
        const stData = await stRes.json();

        const stationsList = stData.result || stData.data || stData;

        if (Array.isArray(stationsList) && stationsList.length > 0) {
          planDetail.startStation = stationsList[0];

          planDetail.endStations = stationsList.slice(1);

          planDetail.allStations = stationsList;
        }
      }
    } catch (err) {
      console.warn("Could not fetch stations for plan", err);
    }

    try {
      if (planDetail && planDetail.carId) {
        const carRes = await fetch(`http://localhost:8080/api/cars/cars/${planDetail.carId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (carRes.ok) {
          const carData = await carRes.json();
          planDetail.carInfo = carData.result || carData.data || carData;
        }
      }
    } catch (err) {
      console.warn("Could not fetch car details", err);
    }

    return planDetail;
  },
};
