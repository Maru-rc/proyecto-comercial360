import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import {
  Auth,
  CurrentUser,
  BypassTransform,
  type AuthenticatedUser,
} from '../../domain-contracts/index.js';
import { CreateClientUseCase } from './application/use-cases/create-client.use-case.js';
import { ListClientsUseCase } from './application/use-cases/list-clients.use-case.js';
import { GetClientByIdUseCase } from './application/use-cases/get-client-by-id.use-case.js';
import { GetCatalogsUseCase } from './application/use-cases/get-catalogs.use-case.js';
import { ImportClientsUseCase } from './application/use-cases/import-clients.use-case.js';
import { GetClientHistoryUseCase } from './application/use-cases/get-client-history.use-case.js';
import { UpdateClientUseCase } from './application/use-cases/update-client.use-case.js';
import type { ClientFormCommand } from './application/services/client-aggregate.builder.js';
import { CreateClientDto } from './presentation/dto/create-client.dto.js';
import { ListClientsDto } from './presentation/dto/list-clients.dto.js';

interface UploadedFilePayload {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

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

function toClientFormCommand(dto: CreateClientDto): ClientFormCommand {
  return {
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
    ...extractPrimaryContact(dto),
  };
}

@Controller('clientes')
export class ClientsController {
  constructor(
    private readonly createClientUseCase: CreateClientUseCase,
    private readonly listClientsUseCase: ListClientsUseCase,
    private readonly getClientByIdUseCase: GetClientByIdUseCase,
    private readonly getCatalogsUseCase: GetCatalogsUseCase,
    private readonly importClientsUseCase: ImportClientsUseCase,
    private readonly getClientHistoryUseCase: GetClientHistoryUseCase,
    private readonly updateClientUseCase: UpdateClientUseCase,
  ) {}

  @Post()
  @Auth('DIRECTOR')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateClientDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.createClientUseCase.execute(toClientFormCommand(dto), user);
  }

  // HU-23: same payload as creation; logs "Cliente actualizado" in the history
  @Put(':id')
  @Auth('DIRECTOR')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateClientDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.updateClientUseCase.execute(id, toClientFormCommand(dto), user);
  }

  @Get('catalogos')
  @Auth()
  async getCatalogos() {
    return this.getCatalogsUseCase.execute();
  }

  @Post('importar')
  @Auth('DIRECTOR')
  @UseInterceptors(FileInterceptor('archivo'))
  async importar(
    @UploadedFile() file: UploadedFilePayload | undefined,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (!file || !file.buffer) {
      throw new BadRequestException(
        'Debe proporcionar un archivo CSV o Excel válido en el campo "archivo"',
      );
    }

    const filename = file.originalname || 'importacion.csv';
    const isAllowed =
      filename.endsWith('.csv') ||
      filename.endsWith('.xlsx') ||
      filename.endsWith('.xls') ||
      file.mimetype.includes('csv') ||
      file.mimetype.includes('spreadsheet') ||
      file.mimetype.includes('excel');

    if (!isAllowed) {
      throw new BadRequestException(
        'Formato no compatible. Solo se admiten archivos .csv y .xlsx',
      );
    }

    return this.importClientsUseCase.execute(
      {
        buffer: file.buffer,
        filename,
        mimeType: file.mimetype,
      },
      user,
    );
  }

  @Get('plantilla')
  @Auth()
  @BypassTransform()
  getPlantilla(@Res() res: Response) {
    const csvContent =
      'nit,razon_social,nombre_comercial,direccion,departamento,municipio,barrio,telefono,email,zona,tipo_cliente,potencial,estado_cliente,frecuencia_visita_dias,latitud,longitud,contacto_nombre,contacto_cargo,contacto_telefono,contacto_celular,contacto_email\n' +
      '900.123.456-1,Metalúrgicas S.A.S,Metalúrgicas,Cra 38 # 74-120,Atlántico,Barranquilla,Betania,3001234567,contacto@metalurgicas.com,NORTE,Industrial,Alto,Activo,7,,,Carlos Julio Mendoza,Jefe de Compras,3001234567,3001234567,cmendoza@metalurgicas.com\n';

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="plantilla_clientes.csv"',
    );
    return res.send(csvContent);
  }

  @Get()
  @Auth()
  async list(@Query() query: ListClientsDto) {
    return this.listClientsUseCase.execute(query);
  }

  @Get(':id/historial')
  @Auth()
  async getHistorial(
    @Param('id', ParseIntPipe) id: number,
    @Query('limit') limit?: string,
  ) {
    const parsedLimit = limit ? Math.max(1, parseInt(limit, 10) || 3) : 3;
    return this.getClientHistoryUseCase.execute(id, parsedLimit);
  }

  @Get(':id')
  @Auth()
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.getClientByIdUseCase.execute(id);
  }
}
