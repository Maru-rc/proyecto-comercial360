import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Auth } from '../auth/public-api.js';
@ApiTags('routes')
@Auth('DIRECTOR')
@Controller('routes')
export class RoutesController {}
