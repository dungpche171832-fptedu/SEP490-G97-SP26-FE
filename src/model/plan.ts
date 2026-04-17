export interface Station {
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
