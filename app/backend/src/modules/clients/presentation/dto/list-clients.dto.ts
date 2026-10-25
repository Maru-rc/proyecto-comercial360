import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../../domain-contracts/index.js';

export class ListClientsDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  tipo?: string;

  @IsOptional()
  @IsString()
  zona?: string;

  @IsOptional()
  @IsString()
  municipio?: string;

  @IsOptional()
  @IsString()
  potencial?: string;
}
