/** Raw visit stats returned from the database. */
export interface VisitStats {
  scheduled: number;
  completed: number;
}

/** Raw order stats returned from the database. */
export interface OrderStats {
  closedOrders: number;
  billing: number;
}

/** All raw KPI values before mapping to the response DTO. */
export interface WeeklyKpisRaw {
  visits: VisitStats;
  quotedValue: number;
  orders: OrderStats;
  weeklyTarget: number;
}

/** Filter passed to the repository by the use case. */
export interface WeeklyKpisFilter {
  weekStart: Date;
  weekEnd: Date;
  /** null = all asesores (DIRECTOR with no filter) */
  asesorId: number | null;
  /** null = all zones */
  zonaId: number | null;
}

/** Port: how the dashboard use case fetches KPI data. */
export interface IDashboardRepository {
  getWeeklyKpis(filter: WeeklyKpisFilter): Promise<WeeklyKpisRaw>;
}

export const DASHBOARD_REPOSITORY = Symbol('DASHBOARD_REPOSITORY');
