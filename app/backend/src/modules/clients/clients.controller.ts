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
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/presentation/auth.guard.js';
import { RolesGuard } from '../auth/presentation/roles.guard.js';
import { Roles } from '../auth/presentation/roles.decorator.js';
import { CurrentUser } from '../auth/presentation/auth.decorator.js';
import type { AuthenticatedUser } from '../../domain-contracts/index.js';
import { CreateClientUseCase } from './application/use-cases/create-client.use-case.js';
import { ListClientsUseCase } from './application/use-cases/list-clients.use-case.js';
import { GetClientByIdUseCase } from './application/use-cases/get-client-by-id.use-case.js';
import { GetCatalogsUseCase } from './application/use-cases/get-catalogs.use-case.js';
import { CreateClientDto } from './presentation/dto/create-client.dto.js';
import { ListClientsDto } from './presentation/dto/list-clients.dto.js';
import { ClientDomainErrorsFilter } from './presentation/filters/client-domain-errors.filter.js';

@Controller('clientes')
@UseFilters(ClientDomainErrorsFilter)
export class ClientsController {
  constructor(
    private readonly createClientUseCase: CreateClientUseCase,
    private readonly listClientsUseCase: ListClientsUseCase,
    private readonly getClientByIdUseCase: GetClientByIdUseCase,
    private readonly getCatalogsUseCase: GetCatalogsUseCase,
  ) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('DIRECTOR')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateClientDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    let contactoNombre = dto.contacto_nombre;
    let contactoCargo = dto.contacto_cargo;
    let contactoTelefono = dto.contacto_telefono;
    let contactoCelular = dto.contacto_celular;
    let contactoEmail = dto.contacto_email;

    if (!contactoNombre && dto.contactos && dto.contactos.length > 0) {
      const primary =
        dto.contactos.find((c) => c.principal) ?? dto.contactos[0];
      contactoNombre = primary.nombre;
      contactoCargo = primary.cargo;
      contactoTelefono = primary.telefono;
      contactoCelular = primary.celular;
      contactoEmail = primary.email;
    } else if (!contactoNombre && dto.contacto) {
      contactoNombre = dto.contacto.nombre;
      contactoCargo = dto.contacto.cargo;
      contactoTelefono = dto.contacto.telefono;
      contactoCelular = dto.contacto.celular;
      contactoEmail = dto.contacto.email;
    }

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
        contacto_nombre: contactoNombre || 'Contacto Principal',
        contacto_cargo: contactoCargo,
        contacto_telefono: contactoTelefono,
        contacto_celular: contactoCelular,
        contacto_email: contactoEmail,
      },
      user,
    );
  }

  @Get('catalogos')
  async getCatalogos() {
    return this.getCatalogsUseCase.execute();
  }

  @Get()
  @UseGuards(AuthGuard)
  async list(@Query() query: ListClientsDto) {
    return this.listClientsUseCase.execute(query);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.getClientByIdUseCase.execute(id);
  }
}
