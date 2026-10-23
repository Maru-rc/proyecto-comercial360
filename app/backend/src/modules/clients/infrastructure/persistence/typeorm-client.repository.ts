import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import {
  ClientRepository,
  ClientSummaryRecord,
  SaveClientTransactionData,
} from '../../application/ports/client.repository.port.js';
import { ClientReader } from '../../application/ports/client-reader.port.js';
import { CustomerOrmEntity } from './entities/customer.orm-entity.js';
import { CustomerContactOrmEntity } from './entities/customer-contact.orm-entity.js';
import { CustomerPortfolioOrmEntity } from './entities/customer-portfolio.orm-entity.js';
import { CustomerHistoryOrmEntity } from './entities/customer-history.orm-entity.js';

@Injectable()
export class TypeOrmClientRepository implements ClientRepository, ClientReader {
  private readonly customerRepo: Repository<CustomerOrmEntity>;

  constructor(private readonly dataSource: DataSource) {
    this.customerRepo = this.dataSource.getRepository(CustomerOrmEntity);
  }

  async findByTaxId(taxId: string): Promise<ClientSummaryRecord | null> {
    const entity = await this.customerRepo.findOne({
      where: { taxId: taxId.trim() },
      relations: {
        zone: true,
        customerType: true,
        customerPotential: true,
        customerStatus: true,
        contacts: true,
        portfolios: {
          portfolio: true,
        },
      },
    });
    if (!entity) return null;
    return this.mapToSummaryRecord(entity);
  }

  async findById(id: number): Promise<ClientSummaryRecord | null> {
    const entity = await this.customerRepo.findOne({
      where: { id },
      relations: {
        zone: true,
        customerType: true,
        customerPotential: true,
        customerStatus: true,
        contacts: true,
        portfolios: {
          portfolio: true,
        },
      },
    });
    if (!entity) return null;
    return this.mapToSummaryRecord(entity);
  }

  async findAll(filter?: {
    search?: string;
    tipo?: string;
    zona?: string;
  }): Promise<ClientSummaryRecord[]> {
    const qb = this.customerRepo
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.zone', 'zone')
      .leftJoinAndSelect('c.customerType', 'customerType')
      .leftJoinAndSelect('c.customerPotential', 'customerPotential')
      .leftJoinAndSelect('c.customerStatus', 'customerStatus')
      .leftJoinAndSelect('c.contacts', 'contacts')
      .leftJoinAndSelect('c.portfolios', 'portfolios')
      .leftJoinAndSelect('portfolios.portfolio', 'portfolioItem');

    if (filter?.search && filter.search.trim()) {
      const term = `%${filter.search.trim()}%`;
      qb.andWhere(
        '(c.taxId ILIKE :term OR c.legalName ILIKE :term OR c.commercialName ILIKE :term OR c.municipality ILIKE :term)',
        { term },
      );
    }

    if (filter?.tipo && filter.tipo !== 'Todos') {
      qb.andWhere('(customerType.name = :tipo OR c.customerTypeId = :tipoId)', {
        tipo: filter.tipo,
        tipoId: isNaN(Number(filter.tipo)) ? -1 : Number(filter.tipo),
      });
    }

    if (filter?.zona && filter.zona !== 'Todas') {
      qb.andWhere('(zone.name = :zona OR c.zoneId = :zonaId)', {
        zona: filter.zona,
        zonaId: isNaN(Number(filter.zona)) ? -1 : Number(filter.zona),
      });
    }

    qb.orderBy('c.createdAt', 'DESC');
    const entities = await qb.getMany();
    return entities.map((e) => this.mapToSummaryRecord(e));
  }

  async saveWithRelations(
    data: SaveClientTransactionData,
  ): Promise<ClientSummaryRecord> {
    return this.dataSource.transaction(async (manager) => {
      // 1. Guardar cliente
      const customerOrm = manager.create(CustomerOrmEntity, {
        taxId: data.client.nit.value,
        legalName: data.client.legalName,
        commercialName: data.client.commercialName,
        address: data.client.address,
        department: data.client.department,
        municipality: data.client.municipality,
        neighborhood: data.client.neighborhood,
        phone: data.client.phone,
        email: data.client.email,
        latitude: data.client.coordinates.latitude,
        longitude: data.client.coordinates.longitude,
        visitFrequencyDays: data.client.visitFrequencyDays,
        isActive: data.client.isActive,
        zoneId: data.client.zoneId,
        customerTypeId: data.client.customerTypeId,
        potentialId: data.client.potentialId,
        customerStatusId: data.client.customerStatusId,
      });
      const savedCustomer = await manager.save(CustomerOrmEntity, customerOrm);

      // 2. Guardar contacto principal
      const contactOrm = manager.create(CustomerContactOrmEntity, {
        customerId: savedCustomer.id,
        name: data.primaryContact.name,
        position: data.primaryContact.position,
        phone: data.primaryContact.phone,
        mobilePhone: data.primaryContact.mobilePhone,
        email: data.primaryContact.email,
        isPrimary: true,
      });
      await manager.save(CustomerContactOrmEntity, contactOrm);

      // 3. Guardar portafolios
      if (data.portfolioIds && data.portfolioIds.length > 0) {
        const portfolioEntities = data.portfolioIds.map((pId) =>
          manager.create(CustomerPortfolioOrmEntity, {
            customerId: savedCustomer.id,
            portfolioId: pId,
          }),
        );
        await manager.save(CustomerPortfolioOrmEntity, portfolioEntities);
      }

      // 4. Guardar bitácora en customer_history (HU-15)
      const historyOrm = manager.create(CustomerHistoryOrmEntity, {
        customerId: savedCustomer.id,
        action: data.history.action,
        user: data.history.user,
        description: data.history.description,
      });
      await manager.save(CustomerHistoryOrmEntity, historyOrm);

      // 5. Cargar entidad completa con relaciones
      const full = await manager.findOne(CustomerOrmEntity, {
        where: { id: savedCustomer.id },
        relations: {
          zone: true,
          customerType: true,
          customerPotential: true,
          customerStatus: true,
          contacts: true,
          portfolios: {
            portfolio: true,
          },
        },
      });

      return this.mapToSummaryRecord(full ?? savedCustomer);
    });
  }

  private mapToSummaryRecord(entity: CustomerOrmEntity): ClientSummaryRecord {
    return {
      id_cliente: entity.id,
      nit: entity.taxId,
      razon_social: entity.legalName,
      nombre_comercial: entity.commercialName ?? entity.legalName,
      codigo: `CLI-${String(entity.id).padStart(6, '0')}`,
      direccion: entity.address,
      departamento: entity.department,
      municipio: entity.municipality,
      barrio: entity.neighborhood,
      telefono: entity.phone,
      email: entity.email,
      latitud: entity.latitude ? Number(entity.latitude) : null,
      longitud: entity.longitude ? Number(entity.longitude) : null,
      frecuencia_visita_dias: entity.visitFrequencyDays,
      activo: entity.isActive,
      zona_id: entity.zoneId,
      zona_nombre: entity.zone?.name ?? null,
      tipo_cliente_id: entity.customerTypeId,
      tipo_cliente_nombre: entity.customerType?.name ?? null,
      potencial_id: entity.potentialId,
      potencial_nombre: entity.customerPotential?.name ?? null,
      estado_cliente_id: entity.customerStatusId,
      estado_cliente_nombre: entity.customerStatus?.name ?? 'Activo',
      contactos: entity.contacts?.map((c) => ({
        id: c.id,
        nombre: c.name,
        cargo: c.position,
        telefono: c.phone,
        celular: c.mobilePhone,
        email: c.email,
        principal: c.isPrimary,
      })),
      portafolios: entity.portfolios?.map((p) => ({
        id: p.portfolio?.id ?? p.portfolioId ?? 0,
        nombre: p.portfolio?.name ?? '',
      })),
    };
  }
}
