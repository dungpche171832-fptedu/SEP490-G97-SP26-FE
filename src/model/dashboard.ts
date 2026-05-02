export interface RoutePerformance {
  routeId: number;
  routeName: string;
  totalTickets: number;
}

export interface DashboardData {
  topRoutes: RoutePerformance[];
  totalPlans: number;
  totalRevenue: number;
  totalTickets: number;
}
