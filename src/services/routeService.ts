import axios from "axios";
import type { AxiosError } from "axios";
import type {
  CreateRoutePayload,
  RouteResponse,
  RouteTableItem,
  UpdateRoutePayload,
} from "@/model/route";

const API_BASE = "http://localhost:8080";

const routeClient = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

routeClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error: unknown) => Promise.reject(error),
);

routeClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        console.error("Unauthorized - Token hết hạn");
      }

      if (error.response?.status === 403) {
        console.error("Forbidden - Không có quyền");
      }

      if (error.response?.status === 404) {
        console.error("API route không tồn tại:", error.config?.url);
      }
    }

    return Promise.reject(error);
  },
);

export const getRoutes = async (): Promise<RouteResponse[]> => {
  const response = await routeClient.get<RouteResponse[]>("/api/routes");
  return response.data;
};

export const getRouteDetail = async (routeId: number): Promise<RouteResponse> => {
  const response = await routeClient.get<RouteResponse>(`/api/routes/${routeId}`);

  return {
    ...response.data,
    routeRevertId: response.data.routeRevertId ?? null,
    stations: [...response.data.stations].sort(
      (firstStation, secondStation) => firstStation.order - secondStation.order,
    ),
  };
};

const mapRoutesToTableItems = (routes: RouteResponse[]): RouteTableItem[] => {
  return routes.map((route) => {
    const revertRoute = routes.find((item) => item.id === route.routeRevertId);

    return {
      ...route,
      routeRevertCode: revertRoute?.code || "Chưa có",
      stationCount: route.stations.length,
    };
  });
};

export const getRouteTableItems = async (): Promise<RouteTableItem[]> => {
  const routes = await getRoutes();

  return mapRoutesToTableItems(routes);
};
export const updateRouteName = async (
  routeId: number,
  currentRoute: RouteResponse,
  newName: string,
): Promise<RouteResponse> => {
  const payload: UpdateRoutePayload = {
    code: currentRoute.code,
    name: newName.trim(),
    stations: [...currentRoute.stations]
      .sort((firstStation, secondStation) => firstStation.order - secondStation.order)
      .map((station) => ({
        stationId: station.stationId,
        order: station.order,
      })),
  };

  const response = await routeClient.put<RouteResponse>(`/api/routes/${routeId}`, payload);

  return {
    ...response.data,
    routeRevertId: response.data.routeRevertId ?? null,
    stations: [...response.data.stations].sort(
      (firstStation, secondStation) => firstStation.order - secondStation.order,
    ),
  };
};

export const createRoute = async (payload: CreateRoutePayload): Promise<RouteResponse> => {
  try {
    const response = await routeClient.post<RouteResponse>("/api/routes", payload);

    if (!response.data || typeof response.data.id !== "number") {
      throw new Error("Backend chưa trả về dữ liệu tuyến đường sau khi tạo");
    }

    return {
      ...response.data,
      routeRevertId: response.data.routeRevertId ?? null,
      stations: [...response.data.stations].sort(
        (firstStation, secondStation) => firstStation.order - secondStation.order,
      ),
    };
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Không thể tạo tuyến đường"));
  }
};

interface ApiErrorResponse {
  message?: string;
  error?: string;
  details?: string | string[];
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const getApiErrorMessage = (error: unknown, fallbackMessage: string): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse | string>;
    const responseData = axiosError.response?.data;

    if (typeof responseData === "string" && responseData.trim()) {
      return responseData;
    }

    if (isRecord(responseData)) {
      const message = responseData.message;
      const errorText = responseData.error;
      const details = responseData.details;

      if (typeof message === "string" && message.trim()) {
        return message;
      }

      if (typeof errorText === "string" && errorText.trim()) {
        return errorText;
      }

      if (Array.isArray(details)) {
        return details.join(", ");
      }

      if (typeof details === "string" && details.trim()) {
        return details;
      }
    }

    if (axiosError.response?.status === 401) {
      return "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại";
    }

    if (axiosError.response?.status === 403) {
      return "Bạn không có quyền thực hiện chức năng này";
    }

    if (axiosError.response?.status === 404) {
      return "API tuyến đường không tồn tại";
    }

    return axiosError.message || fallbackMessage;
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallbackMessage;
};
