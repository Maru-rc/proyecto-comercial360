export interface VisitStats {
  scheduled: number;
  completed: number;
}

export interface OrderStats {
  closedOrders: number;
  billing: number;
}

export interface WeeklyKpisRaw {
  visits: VisitStats;
  quotedValue: number;
  orders: OrderStats;
  weeklyTarget: number;
}

export interface WeeklyKpisFilter {
  weekStart: Date;
  weekEnd: Date;
  asesorId: number | null;
  zoneId: number | null;
}

export interface IDashboardRepository {
  getWeeklyKpis(filter: WeeklyKpisFilter): Promise<WeeklyKpisRaw>;
}

export const DASHBOARD_REPOSITORY = Symbol('DASHBOARD_REPOSITORY');
