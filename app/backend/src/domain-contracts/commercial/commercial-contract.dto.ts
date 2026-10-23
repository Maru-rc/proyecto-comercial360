export interface QuotationContractDto {
  id: number;
  quotationNumber: string;
  number?: string;
  visitId?: number | null;
  clientId: number;
  advisorId?: number;
  amount: number;
  currency: string;
  status: string;
  date?: Date | string;
  createdAt?: Date | string;
}

export interface OrderContractDto {
  id: number;
  orderNumber: string;
  number?: string;
  visitId?: number | null;
  quotationId?: number | null;
  clientId: number;
  advisorId?: number;
  amount: number;
  status: string;
  date?: Date | string;
  estimatedDeliveryDate?: Date | string | null;
  createdAt?: Date | string;
}
