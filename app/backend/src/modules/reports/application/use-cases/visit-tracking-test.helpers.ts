import type {
  IVisitTrackingRepository,
  VisitTrackingFilter,
  VisitTrackingPage,
  VisitTrackingRow,
} from '../ports/visit-tracking.port.js';

const advisorUser = {
  id: 'u1',
  email: 'ana@x.com',
  role: 'ADVISOR' as const,
};
const directorUser = {
  id: 'u9',
  email: 'dir@x.com',
  role: 'DIRECTOR' as const,
};

const baseRow: VisitTrackingRow = {
  visitId: 42,
  date: '2026-10-21',
  advisorName: 'Juan Perez',
  territory: 'NORTE',
  week: 43,
  day: 'Tuesday',
  route: 'RUT-002',
  customer: 'Metalurgicas S.A.S',
  municipality: 'Barranquilla',
  customerType: 'Industrial',
  potential: 'Alto',
  visitStatus: 'VISITADO',
  outcome: 'Interesado',
  quoteNumber: 'COT-1242',
  quoteAmount: 24800000,
  orderNumber: null,
  nextFollowUpDate: '2026-10-28',
};

function makeTrackingRepo(page: VisitTrackingPage = { rows: [], total: 0 }): {
  repo: IVisitTrackingRepository;
  captured: VisitTrackingFilter[];
} {
  const captured: VisitTrackingFilter[] = [];
  const repo: IVisitTrackingRepository = {
    async findPage(filter) {
      captured.push(filter);
      return page;
    },
    async findAll(filter) {
      captured.push(filter);
      return page.rows;
    },
  };
  return { repo, captured };
}

export { advisorUser, directorUser, baseRow, makeTrackingRepo };
export type { VisitTrackingFilter };
