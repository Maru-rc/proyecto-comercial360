export type TrackingPeriod = 'today' | 'week' | 'month';

export interface VisitTrackingRow {
  visitId: number;
  date: string;
  advisorName: string | null;
  territory: string | null;
  week: number;
  day: string;
  route: string | null;
  customer: string;
  municipality: string | null;
  customerType: string | null;
  potential: string | null;
  visitStatus: string;
  outcome: string | null;
  quoteNumber: string | null;
  quoteAmount: number;
  orderNumber: string | null;
  nextFollowUpDate: string | null;
}

export interface VisitTrackingFilter {
  period: TrackingPeriod;
  status: string | null;
  routeId: number | null;
  customerType: string | null;
  potential: string | null;
  advisorId: number | null;
  page: number;
  limit: number;
}

export interface VisitTrackingPage {
  rows: VisitTrackingRow[];
  total: number;
}

export interface IVisitTrackingRepository {
  findPage(filter: VisitTrackingFilter): Promise<VisitTrackingPage>;
}

export const VISIT_TRACKING_REPOSITORY = Symbol('VISIT_TRACKING_REPOSITORY');
