import type { GeneratedVisit } from '../../domain/services/route-agenda-calculator.js';

export interface RouteVisitGeneratorPort {
  generateVisits(visits: GeneratedVisit[]): Promise<number>;
}

export const ROUTE_VISIT_GENERATOR = Symbol('ROUTE_VISIT_GENERATOR');
