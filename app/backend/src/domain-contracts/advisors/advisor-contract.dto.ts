export interface AdvisorContractDto {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  role?: string;
  isActive: boolean;
}
