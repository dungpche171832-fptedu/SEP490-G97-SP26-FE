import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

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

  planId: number;
  planCode?: string;

  carId: number;
  carLicensePlate?: string;
  carType?: string;

  branchId?: number;
  branchName?: string;

  accountId: number;
  accountName?: string;

  distanceKm: number;
  totalAmount: number;

  startStationId?: number;
  startStation?: string;

  endStationId?: number;
  endStation?: string;

  status: string;
  note?: string;

  startTime?: string;

  seatNumbers?: string[];
  totalSeats?: number;

  bookingDate?: string;

  [key: string]: unknown;
}

export interface TicketListResponse {
  tickets?: TicketInfo[];
  result?: TicketInfo[];
  data?: TicketInfo[];
  message?: string;
  totalCount?: number;
}

export interface TicketQueryParams {
  planId?: number;
  branchId?: number;
  accountId?: number;
}

export interface BookTicketResponse {
  success: boolean;
  message?: string;
  result?: TicketInfo;
  data?: TicketInfo;
}

export interface ChangePlanRequest {
  newPlanId: number;
  newSeatIds: number[];
}

export interface ChangePlanResponse {
  success?: boolean;
  message?: string;
  data?: unknown;
}

interface OsrmRoute {
  distance?: number;
}

interface OsrmResponse {
  routes?: OsrmRoute[];
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

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const parseNumberValue = (value: unknown): number | undefined => {
  if (typeof value === "number" && !Number.isNaN(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsedValue = Number(value);

    return Number.isNaN(parsedValue) ? undefined : parsedValue;
  }

  return undefined;
};

const getNumberFromRecord = (data: Record<string, unknown>, keys: string[]): number | undefined => {
  for (const key of keys) {
    const value = parseNumberValue(data[key]);

    if (value !== undefined) {
      return value;
    }
  }

  return undefined;
};

const decodeJwtPayload = (token: string): Record<string, unknown> | undefined => {
  try {
    const payload = token.split(".")[1];

    if (!payload || typeof window === "undefined") {
      return undefined;
    }

    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const paddedBase64 = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");

    const decodedPayload = JSON.parse(window.atob(paddedBase64)) as unknown;

    return isRecord(decodedPayload) ? decodedPayload : undefined;
  } catch (error) {
    console.error("Không đọc được payload từ token:", error);
    return undefined;
  }
};

const getAccountIdFromStoredJson = (): number | undefined => {
  if (typeof window === "undefined") {
    return undefined;
  }

  const storageKeys = ["account", "user", "auth", "authUser", "currentUser", "loginUser"];

  for (const key of storageKeys) {
    const rawValue = window.localStorage.getItem(key);

    if (!rawValue) {
      continue;
    }

    try {
      const parsedValue = JSON.parse(rawValue) as unknown;

      if (!isRecord(parsedValue)) {
        continue;
      }

      const directAccountId = getNumberFromRecord(parsedValue, [
        "accountId",
        "userId",
        "id",
        "account_id",
      ]);

      if (directAccountId !== undefined) {
        return directAccountId;
      }

      const nestedData = parsedValue.data;

      if (isRecord(nestedData)) {
        const nestedAccountId = getNumberFromRecord(nestedData, [
          "accountId",
          "userId",
          "id",
          "account_id",
        ]);

        if (nestedAccountId !== undefined) {
          return nestedAccountId;
        }
      }

      const nestedResult = parsedValue.result;

      if (isRecord(nestedResult)) {
        const nestedAccountId = getNumberFromRecord(nestedResult, [
          "accountId",
          "userId",
          "id",
          "account_id",
        ]);

        if (nestedAccountId !== undefined) {
          return nestedAccountId;
        }
      }
    } catch {
      continue;
    }
  }

  return undefined;
};

const getStoredAccountId = (): number | undefined => {
  if (typeof window === "undefined") {
    return undefined;
  }

  const directAccountId =
    window.localStorage.getItem("accountId") ||
    window.localStorage.getItem("userId") ||
    window.localStorage.getItem("id") ||
    window.localStorage.getItem("account_id");

  const parsedDirectAccountId = parseNumberValue(directAccountId);

  if (parsedDirectAccountId !== undefined) {
    return parsedDirectAccountId;
  }

  const accountIdFromStoredJson = getAccountIdFromStoredJson();

  if (accountIdFromStoredJson !== undefined) {
    return accountIdFromStoredJson;
  }

  const token = window.localStorage.getItem("token");

  if (!token) {
    return undefined;
  }

  const payload = decodeJwtPayload(token);

  if (!payload) {
    return undefined;
  }

  return getNumberFromRecord(payload, ["accountId", "userId", "id", "account_id"]);
};

const getTicketListFromResponse = (data: TicketListResponse | TicketInfo[]): TicketInfo[] => {
  if (Array.isArray(data)) {
    return data;
  }

  return data.tickets || data.result || data.data || [];
};

export const calculateDistanceOSRM = async (
  lngA: number,
  latA: number,
  lngB: number,
  latB: number,
): Promise<number> => {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${lngA},${latA};${lngB},${latB}?overview=false`;
    const response = await axios.get<OsrmResponse>(url);

    const distanceInMeters = response.data.routes?.[0]?.distance;

    if (typeof distanceInMeters === "number") {
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
    if (coordinates.length < 2) {
      return 0;
    }

    const coordsString = coordinates
      .map((coordinate) => `${coordinate.lng},${coordinate.lat}`)
      .join(";");
    const url = `https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=false`;
    const response = await axios.get<OsrmResponse>(url);

    const distanceInMeters = response.data.routes?.[0]?.distance;

    if (typeof distanceInMeters === "number") {
      return Number((distanceInMeters / 1000).toFixed(1));
    }

    return 0;
  } catch (error) {
    console.error("OSRM Error:", error);
    return 0;
  }
};

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

export const bookTicket = async (payload: TicketAddRequest): Promise<BookTicketResponse> => {
  try {
    const response = await ticketClient.post<BookTicketResponse>(`/ticket`, payload);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi đặt vé:", error);
    throw error;
  }
};

export const getMyTickets = async (params?: TicketQueryParams): Promise<TicketInfo[]> => {
  try {
    const accountId = params?.accountId ?? getStoredAccountId();

    if (!accountId) {
      console.warn("Không tìm thấy accountId. Cần lưu accountId sau khi đăng nhập.");
      return [];
    }

    const response = await ticketClient.get<TicketListResponse | TicketInfo[]>(`/ticket`, {
      params: {
        ...params,
        accountId,
      },
    });

    return getTicketListFromResponse(response.data);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách vé:", error);
    return [];
  }
};
export const getListTickets = async (): Promise<TicketInfo[]> => {
  try {
    const response = await ticketClient.get(`/ticket`);
    const data = response.data;

    // Xử lý các trường hợp bọc dữ liệu khác nhau của backend
    if (Array.isArray(data)) return data;
    return data?.tickets || data?.result || data?.data || [];
  } catch (error) {
    throw error;
  }
};

export const updateTicketStatus = async (ticketId: number, status: string) => {
  try {
    const response = await ticketClient.put(`/ticket/${ticketId}/status`, null, {
      params: {
        status,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Lỗi cập nhật status:", error);
    throw error;
  }
};

export const getTicketById = async (ticketId: string | number): Promise<TicketInfo | null> => {
  try {
    const response = await ticketClient.get(`/ticket/${ticketId}`);
    const data = response.data;

    return data?.result || data?.data || data || null;
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết vé:", error);
    return null;
  }
};

export const changePlan = async (
  ticketId: number | string,
  payload: ChangePlanRequest,
): Promise<ChangePlanResponse> => {
  try {
    const response = await ticketClient.put<ChangePlanResponse>(
      `/ticket/${ticketId}/change-plan`,
      payload,
    );

    return response.data;
  } catch (error) {
    console.error("Lỗi khi đổi chuyến:", error);
    throw error;
  }
};
