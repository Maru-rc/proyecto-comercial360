export interface QuotationContractDto {
  readonly id: number;
  readonly quotationNumber: string;
  readonly number?: string;
  readonly visitId?: number | null;
  readonly clientId: number;
  readonly advisorId?: number;
  readonly amount: number;
  readonly currency: string;
  readonly status: string;
  readonly date?: Date | string;
  readonly createdAt?: Date | string;
}

export interface OrderContractDto {
  readonly id: number;
  readonly orderNumber: string;
  readonly number?: string;
  readonly visitId?: number | null;
  readonly quotationId?: number | null;
  readonly clientId: number;
  readonly advisorId?: number;
  readonly amount: number;
  readonly status: string;
  readonly date?: Date | string;
  readonly estimatedDeliveryDate?: Date | string | null;
  readonly createdAt?: Date | string;
}
