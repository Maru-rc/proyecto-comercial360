import type {
  VisitAgendaItemContractDto,
  VisitContractDto,
  VisitMapStopContractDto,
} from './visit-contract.dto.js';

export interface VisitReader {
  getVisitById(id: number): Promise<VisitContractDto | null>;
  getDailyAgenda(
    date: string,
    advisorId?: number,
  ): Promise<VisitAgendaItemContractDto[]>;
  getMapStops?(
    date: string,
    advisorId?: number,
  ): Promise<VisitMapStopContractDto[]>;
}
