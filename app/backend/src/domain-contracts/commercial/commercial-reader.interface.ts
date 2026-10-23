import type {
  OrderContractDto,
  QuotationContractDto,
} from './commercial-contract.dto.js';

export interface QuotationReader {
  getQuotationById(id: number): Promise<QuotationContractDto | null>;
}

export interface OrderReader {
  getOrderById(id: number): Promise<OrderContractDto | null>;
  hasOrderByVisit(visitId: number): Promise<boolean>;
  getOrdersByVisit?(visitId: number): Promise<OrderContractDto[]>;
}
