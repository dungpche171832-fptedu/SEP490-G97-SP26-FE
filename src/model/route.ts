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

export interface RouteTableItem extends RouteResponse {
  routeRevertCode: string;
  stationCount: number;
}

export interface UpdateRouteStationPayload {
  stationId: number;
  order: number;
}

export interface UpdateRoutePayload {
  code: string;
  name: string;
  stations: UpdateRouteStationPayload[];
}

export interface CreateRouteStationPayload {
  stationId: number;
  order: number;
}

export interface CreateRoutePayload {
  code: string;
  name: string;
  nameRevert: string;
  stations: CreateRouteStationPayload[];
}
