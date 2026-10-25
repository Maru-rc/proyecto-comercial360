import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Auth } from '../auth/public-api.js';
@ApiTags('reports')
@Auth()
@Controller('reports')
export class ReportsController {}
