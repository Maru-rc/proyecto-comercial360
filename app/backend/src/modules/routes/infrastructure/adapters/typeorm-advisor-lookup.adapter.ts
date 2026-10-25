import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import type { AdvisorReader } from '../../../../domain-contracts/advisors/advisor-reader.interface.js';
import type { AdvisorContractDto } from '../../../../domain-contracts/advisors/advisor-contract.dto.js';

interface RawSalesRepresentative {
  sales_representative_id: number;
  name: string;
  email: string;
  phone: string | null;
  status: string;
}

@Injectable()
export class TypeOrmAdvisorLookupAdapter implements AdvisorReader {
  constructor(private readonly dataSource: DataSource) {}

  async existsById(id: number): Promise<boolean> {
    const rows = await this.dataSource.query<RawSalesRepresentative[]>(
      `SELECT 1 FROM "sales_representatives" 
       WHERE "sales_representative_id" = $1 
         AND UPPER("status") IN ('ACTIVE', 'ACTIVO')
       LIMIT 1`,
      [id],
    );
    return rows.length > 0;
  }

  async getSummaryById(id: number): Promise<AdvisorContractDto | null> {
    const rows = await this.dataSource.query<RawSalesRepresentative[]>(
      `SELECT "sales_representative_id", "name", "email", "phone", "status"
       FROM "sales_representatives"
       WHERE "sales_representative_id" = $1
       LIMIT 1`,
      [id],
    );

    if (rows.length === 0) return null;
    const raw = rows[0];

    return {
      id: raw.sales_representative_id,
      name: raw.name,
      email: raw.email,
      phone: raw.phone,
      isActive: ['ACTIVE', 'ACTIVO'].includes((raw.status || '').toUpperCase()),
    };
  }

  async listActive(): Promise<AdvisorContractDto[]> {
    const rows = await this.dataSource.query<RawSalesRepresentative[]>(
      `SELECT "sales_representative_id", "name", "email", "phone", "status"
       FROM "sales_representatives"
       WHERE UPPER("status") IN ('ACTIVE', 'ACTIVO')
       ORDER BY "name" ASC`,
    );

    return rows.map((raw) => ({
      id: raw.sales_representative_id,
      name: raw.name,
      email: raw.email,
      phone: raw.phone,
      isActive: true,
    }));
  }
}
