export interface RouteStation {
  stationId: number;
  stationName: string;
  order: number;
}

export interface RouteResponse {
  id: number;
  code: string;
  name: string;
  routeRevertId: number | null;
  stations: RouteStation[];
}
