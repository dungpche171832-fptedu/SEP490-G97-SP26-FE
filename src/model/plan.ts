export type PlanStatus = "COMPLETE" | "RUNNING" | "ACTIVE" | "INACTIVE";

export interface PlanStationResponse {
  stationId: number;
  stationName: string;
  order: number;
}

export interface PlanSeatResponse {
  seatId: number;
  seatNumber: string;
  status: string;
}

export interface Plan {
  id: number;
  code: string;

  carId: number;
  carLicensePlate: string;
  carType?: string;

  accountId: number;
  driverName: string;
  driverPhone?: string;

  branchId: number;
  branchName: string;

  routeId: number;
  routeName: string;

  startTime: string;
  status: PlanStatus;

  stations: PlanStationResponse[];
}

export interface PlanResponse {
  plans: Plan[];
  totalCount: number;
  message: string;
}

export interface PlanDetailResponse {
  id: number;
  code: string;

  routeId?: number;
  routeName?: string;

  carId: number;
  carLicensePlate: string;

  accountId: number;
  driverName: string;
  driverPhone?: string;

  branchId?: number;
  branchName?: string;

  startTime: string;
  returnStartTime?: string;
  endTime?: string;

  status: PlanStatus;

  stations?: PlanStationResponse[];
  seats?: PlanSeatResponse[];
}

export interface UpdatePlanStatusPayload {
  status: PlanStatus;
}

export interface CreatePlanPayload {
  code: string;
  routeId: number;
  carId: number;
  accountId: number;
  branchId: number;
  startTime: string;
  returnStartTime: string;
  status: PlanStatus;
}
export interface ChangeDriverPayload {
  newDriverId: number;
}

export interface ChangeCarPayload {
  newCarId: number;
}
export interface PlanSearchParams {
  departureStationId?: number;
  destinationStationId?: number;
  startTime?: string;
  status?: string;
}
