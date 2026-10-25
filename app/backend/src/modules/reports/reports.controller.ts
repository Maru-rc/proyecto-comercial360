import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Auth } from '../../domain-contracts/index.js';
@ApiTags('reports')
@Auth()
@Controller('reports')
export class ReportsController {}
