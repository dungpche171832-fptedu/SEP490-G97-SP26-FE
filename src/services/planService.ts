import type {
  PlanResponse,
  PlanDetailResponse,
  UpdatePlanStatusPayload,
  CreatePlanPayload,
  PlanStatus,
  ChangeDriverPayload,
  ChangeCarPayload,
  PlanSearchParams,
} from "../model/plan";

interface PlanDetailForTicket extends PlanDetailResponse {
  startStation?: unknown;
  endStations?: unknown[];
  allStations?: unknown[];
  carInfo?: unknown;
}

function getAuthHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function unwrapApiResponse<T>(data: unknown): T {
  if (isRecord(data)) {
    if (data.result !== undefined) {
      return data.result as T;
    }

    if (data.data !== undefined) {
      return data.data as T;
    }
  }

  return data as T;
}

async function getErrorMessage(response: Response, fallbackMessage: string): Promise<string> {
  const errorText = await response.text();

  if (errorText) {
    return errorText;
  }

  return `${fallbackMessage}: ${response.status}`;
}

function parseResponseBody(text: string): unknown {
  if (!text.trim()) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function getStringValue(record: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

function isBusinessErrorText(message: string): boolean {
  return (
    message.includes("Tài xế đã có lịch") ||
    message.includes("Xe đã có lịch") ||
    message.includes("Mã lịch trình đã tồn tại") ||
    message.includes("không tồn tại") ||
    message.includes("không hợp lệ") ||
    message.includes("bắt buộc") ||
    message.includes("không đủ") ||
    message.includes("bị trùng")
  );
}

function getBusinessErrorMessage(data: unknown): string | null {
  if (typeof data === "string") {
    const text = data.trim();

    if (isBusinessErrorText(text)) {
      return text;
    }

    return null;
  }

  if (!isRecord(data)) {
    return null;
  }

  const code = getStringValue(data, ["code", "errorCode"]);
  const message = getStringValue(data, ["message", "errorMessage", "detail"]);

  if (/^[A-Z]+-\d+$/.test(code)) {
    return message || code;
  }

  if (isBusinessErrorText(message)) {
    return message;
  }

  const resultError = getBusinessErrorMessage(data.result);
  if (resultError) {
    return resultError;
  }

  const dataError = getBusinessErrorMessage(data.data);
  if (dataError) {
    return dataError;
  }

  const errorError = getBusinessErrorMessage(data.error);
  if (errorError) {
    return errorError;
  }

  return null;
}

export const planService = {
  getListPlans: async (): Promise<PlanResponse> => {
    const headers = getAuthHeaders();

    const statuses: PlanStatus[] = ["ACTIVE", "RUNNING", "COMPLETE", "INACTIVE"];

    const fetchByStatus = async (status: PlanStatus): Promise<PlanResponse> => {
      const response = await fetch(`http://localhost:8080/api/plans?status=${status}`, {
        method: "GET",
        headers,
      });

      if (response.status === 401 || response.status === 403) {
        throw new Error("Phiên đăng nhập hết hạn hoặc không có quyền.");
      }

      if (!response.ok) {
        const errorText = await response.text();

        console.error(`GET /api/plans?status=${status} failed:`, response.status, errorText);

        if (
          response.status === 404 ||
          errorText.includes("PLAN_NOT_FOUND") ||
          errorText.toLowerCase().includes("not found")
        ) {
          return {
            plans: [],
            totalCount: 0,
            message: "Không có lịch trình",
          };
        }

        throw new Error(errorText || `Lỗi API: ${response.status}`);
      }

      const data = await response.json();

      return unwrapApiResponse<PlanResponse>(data);
    };

    const responses = await Promise.all(statuses.map((status) => fetchByStatus(status)));

    const plans = responses.flatMap((response) => response.plans || []);

    const uniquePlans = Array.from(new Map(plans.map((plan) => [plan.id, plan])).values());

    return {
      plans: uniquePlans,
      totalCount: uniquePlans.length,
      message: "Danh sách lịch trình theo trạng thái",
    };
  },

  searchPlans: async (params: PlanSearchParams): Promise<PlanResponse> => {
    const headers = getAuthHeaders();

    const url = new URL("http://localhost:8080/api/plans");

    if (params.departureStationId)
      url.searchParams.append("departureStationId", params.departureStationId.toString());

    if (params.destinationStationId)
      url.searchParams.append("destinationStationId", params.destinationStationId.toString());

    if (params.startTime) url.searchParams.append("startTime", params.startTime);

    url.searchParams.append("status", params.status || "ACTIVE");

    const response = await fetch(url.toString(), {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();

      if (response.status === 404) return { plans: [], totalCount: 0, message: "Không tìm thấy" };

      throw new Error(errorText || "Lỗi khi tìm kiếm lịch trình");
    }

    const data = await response.json();

    return unwrapApiResponse<PlanResponse>(data);
  },

  getPlanDetail: async (id: string | number): Promise<PlanDetailResponse> => {
    const response = await fetch(`http://localhost:8080/api/plans/${id}?t=${Date.now()}`, {
      method: "GET",
      headers: getAuthHeaders(),
      cache: "no-store",
    });

    if (response.status === 401 || response.status === 403) {
      throw new Error("Phiên đăng nhập hết hạn hoặc không có quyền.");
    }

    if (!response.ok) {
      const errorMessage = await getErrorMessage(response, "Không lấy được chi tiết lịch trình");

      console.error(`GET /api/plans/${id} failed:`, response.status, errorMessage);

      throw new Error(errorMessage);
    }

    const data = await response.json();

    return unwrapApiResponse<PlanDetailResponse>(data);
  },

  updatePlanStatus: async (
    id: string | number,
    payload: UpdatePlanStatusPayload,
  ): Promise<PlanDetailResponse> => {
    const response = await fetch(`http://localhost:8080/api/plans/${id}/status`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (response.status === 401 || response.status === 403) {
      throw new Error("Phiên đăng nhập hết hạn hoặc không có quyền.");
    }

    if (!response.ok) {
      const errorMessage = await getErrorMessage(
        response,
        "Không cập nhật được trạng thái lịch trình",
      );

      console.error(`PATCH /api/plans/${id}/status failed:`, response.status, errorMessage);

      throw new Error(errorMessage);
    }

    const data = await response.json();

    return unwrapApiResponse<PlanDetailResponse>(data);
  },

  createPlan: async (payload: CreatePlanPayload): Promise<PlanDetailResponse> => {
    const response = await fetch("http://localhost:8080/api/plans", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (response.status === 401 || response.status === 403) {
      throw new Error("Phiên đăng nhập hết hạn hoặc không có quyền.");
    }

    const responseText = await response.text();
    const data = parseResponseBody(responseText);

    const businessErrorMessage = getBusinessErrorMessage(data);

    if (businessErrorMessage) {
      throw new Error(businessErrorMessage);
    }

    if (!response.ok) {
      throw new Error(responseText || `Không thêm được lịch trình: ${response.status}`);
    }

    return unwrapApiResponse<PlanDetailResponse>(data);
  },

  changeDriver: async (planId: string | number, payload: ChangeDriverPayload): Promise<string> => {
    const response = await fetch(`http://localhost:8080/api/plans/${planId}/change-driver`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (response.status === 401 || response.status === 403) {
      throw new Error("Phiên đăng nhập hết hạn hoặc không có quyền.");
    }

    if (!response.ok) {
      const errorMessage = await getErrorMessage(response, "Không đổi được tài xế");

      console.error(
        `PUT /api/plans/${planId}/change-driver failed:`,
        response.status,
        errorMessage,
      );

      throw new Error(errorMessage);
    }

    return await response.text();
  },

  changeCar: async (planId: string | number, payload: ChangeCarPayload): Promise<string> => {
    const response = await fetch(`http://localhost:8080/api/plans/${planId}/change-car`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (response.status === 401 || response.status === 403) {
      throw new Error("Phiên đăng nhập hết hạn hoặc không có quyền.");
    }

    if (!response.ok) {
      const errorMessage = await getErrorMessage(response, "Không đổi được xe");

      console.error(`PUT /api/plans/${planId}/change-car failed:`, response.status, errorMessage);

      throw new Error(errorMessage);
    }

    return await response.text();
  },

  getPlanByIdForTicket: async (id: number | string): Promise<PlanDetailResponse> => {
    const response = await fetch(`http://localhost:8080/api/plans/${id}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorMessage = await getErrorMessage(response, "Lỗi lấy thông tin chi tiết");

      throw new Error(errorMessage);
    }

    const data = await response.json();

    const planDetail = unwrapApiResponse<PlanDetailForTicket>(data);

    try {
      const stRes = await fetch(`http://localhost:8080/api/plans/${id}/stations`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (stRes.ok) {
        const stData = await stRes.json();

        const stationsList = unwrapApiResponse<unknown[]>(stData);

        if (Array.isArray(stationsList) && stationsList.length > 0) {
          planDetail.startStation = stationsList[0];
          planDetail.endStations = stationsList.slice(1);
          planDetail.allStations = stationsList;
        }
      }
    } catch (err: unknown) {
      console.warn("Could not fetch stations for plan", err);
    }

    try {
      if (planDetail.carId) {
        const carRes = await fetch(`http://localhost:8080/api/cars/cars/${planDetail.carId}`, {
          method: "GET",
          headers: getAuthHeaders(),
        });

        if (carRes.ok) {
          const carData = await carRes.json();

          planDetail.carInfo = unwrapApiResponse<unknown>(carData);
        }
      }
    } catch (err: unknown) {
      console.warn("Could not fetch car details", err);
    }

    return planDetail;
  },

  getPlansForExchange: async (params: {
    totalSeat: number;
    departureStationId: number;
    destinationStationId: number;
    startTime: string;
    branchId: number;
    carType: string;
  }): Promise<PlanResponse> => {
    const url = new URL("http://localhost:8080/api/plans/plans/change-plans");

    url.searchParams.append("totalSeat", String(params.totalSeat));
    url.searchParams.append("departureStationId", String(params.departureStationId));
    url.searchParams.append("destinationStationId", String(params.destinationStationId));
    url.searchParams.append("status", "ACTIVE");
    url.searchParams.append("startTime", params.startTime);
    url.searchParams.append("branchId", String(params.branchId));
    url.searchParams.append("carType", params.carType);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(errorText || "Không lấy được danh sách chuyến đổi");
    }

    const data = await response.json();

    return unwrapApiResponse<PlanResponse>(data);
  },
};
