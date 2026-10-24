import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import {
  Auth,
  CurrentUser,
  type AuthenticatedUser,
} from '../../domain-contracts/index.js';
import { CreateClientUseCase } from './application/use-cases/create-client.use-case.js';
import { ListClientsUseCase } from './application/use-cases/list-clients.use-case.js';
import { GetClientByIdUseCase } from './application/use-cases/get-client-by-id.use-case.js';
import { GetCatalogsUseCase } from './application/use-cases/get-catalogs.use-case.js';
import { CreateClientDto } from './presentation/dto/create-client.dto.js';
import { ListClientsDto } from './presentation/dto/list-clients.dto.js';

function extractPrimaryContact(dto: CreateClientDto) {
  const primaryFromList =
    dto.contactos?.find((c) => c.principal) ?? dto.contactos?.[0];
  const source = primaryFromList ?? dto.contacto;

  return {
    contacto_nombre:
      dto.contacto_nombre || source?.nombre || 'Contacto Principal',
    contacto_cargo: dto.contacto_cargo ?? source?.cargo,
    contacto_telefono: dto.contacto_telefono ?? source?.telefono,
    contacto_celular: dto.contacto_celular ?? source?.celular,
    contacto_email: dto.contacto_email ?? source?.email,
  };
}

@Controller('clientes')
export class ClientsController {
  constructor(
    private readonly createClientUseCase: CreateClientUseCase,
    private readonly listClientsUseCase: ListClientsUseCase,
    private readonly getClientByIdUseCase: GetClientByIdUseCase,
    private readonly getCatalogsUseCase: GetCatalogsUseCase,
  ) {}

  @Post()
  @Auth('DIRECTOR')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateClientDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const contact = extractPrimaryContact(dto);

    return this.createClientUseCase.execute(
      {
        nit: dto.nit,
        razon_social: dto.razon_social,
        nombre_comercial: dto.nombre_comercial,
        direccion: dto.direccion,
        departamento: dto.departamento,
        municipio: dto.municipio,
        barrio: dto.barrio,
        telefono: dto.telefono,
        email: dto.email,
        zona: dto.zona,
        tipo_cliente: dto.tipo_cliente,
        potencial: dto.potencial,
        estado_cliente: dto.estado_cliente,
        frecuencia_visita_dias: dto.frecuencia_visita_dias,
        portafolios: dto.portafolios,
        latitud: dto.latitud,
        longitud: dto.longitud,
        ...contact,
      },
      user,
    );
  }

  @Get('catalogos')
  async getCatalogos() {
    return this.getCatalogsUseCase.execute();
  }

  @Get()
  @Auth()
  async list(@Query() query: ListClientsDto) {
    return this.listClientsUseCase.execute(query);
  }

  @Get(':id')
  @Auth()
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.getClientByIdUseCase.execute(id);
  }
}
