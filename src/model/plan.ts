export interface Station {
  stationOrder: number;
  stationName: string;
  stations: {
    stationOrder: number;
    stationName: string;
  }[];
}

export interface Plan {
  id: number;
  code: string;
  carId: number;
  carLicensePlate: string;
  accountId: number;
  driverName: string;
  startTime: string;
  endTime: string;
  status: string;
  stations: Station[];
}

export interface PlanResponse {
  plans: Plan[];
  message: string;
  totalCount: number;
}
export interface PlanStationResponse {
  stationId: number;
  stationName: string;
  stationOrder: number;
}

export interface PlanSeatResponse {
  seatId: number;
  seatNumber: string;
  status: string;
}

export interface PlanDetailResponse {
  id: number;
  code: string;
  routeId?: number;
  carId: number;
  carLicensePlate: string;
  accountId: number;
  driverName: string;
  branchId?: number;
  startTime: string;
  returnStartTime?: string;
  endTime?: string;
  status: string;
  stations?: PlanStationResponse[];
  seats?: PlanSeatResponse[];
}

export interface UpdatePlanStatusPayload {
  status: string;
}

export interface CreatePlanPayload {
  code: string;
  routeId: number;
  carId: number;
  accountId: number;
  branchId: number;
  startTime: string;
  returnStartTime: string;
  status: string;
}
