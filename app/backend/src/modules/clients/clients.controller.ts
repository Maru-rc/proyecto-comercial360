import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Auth } from '../auth/public-api.js';
@ApiTags('clients')
@Auth('DIRECTOR')
@Controller('clients')
export class ClientsController {}
