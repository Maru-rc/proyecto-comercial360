import { Injectable } from '@nestjs/common';
import {
  DataSource,
  EntityManager,
  FindOptionsRelations,
  Repository,
} from 'typeorm';
import {
  ClientRepository,
  ClientSummaryRecord,
  SaveClientTransactionData,
} from '../../application/ports/client.repository.port.js';
import {
  type ClientReader,
  type ClientSummaryContractDto,
  type ClientCoordinatesContractDto,
  type ClientContractDto,
} from '../../../../domain-contracts/index.js';
import { Client } from '../../domain/entities/client.entity.js';
import { ClientContact } from '../../domain/entities/client-contact.entity.js';
import { ClientHistory } from '../../domain/entities/client-history.entity.js';
import { CustomerOrmEntity } from './entities/customer.orm-entity.js';
import { CustomerContactOrmEntity } from './entities/customer-contact.orm-entity.js';
import { CustomerPortfolioOrmEntity } from './entities/customer-portfolio.orm-entity.js';
import { CustomerHistoryOrmEntity } from './entities/customer-history.orm-entity.js';

const CLIENT_RELATIONS: FindOptionsRelations<CustomerOrmEntity> = {
  zone: true,
  customerType: true,
  customerPotential: true,
  customerStatus: true,
  contacts: true,
  portfolios: {
    portfolio: true,
  },
};

@Injectable()
export class TypeOrmClientRepository implements ClientRepository, ClientReader {
  private readonly customerRepo: Repository<CustomerOrmEntity>;

  constructor(private readonly dataSource: DataSource) {
    this.customerRepo = this.dataSource.getRepository(CustomerOrmEntity);
  }

  async findByTaxId(taxId: string): Promise<ClientSummaryRecord | null> {
    const entity = await this.customerRepo.findOne({
      where: { taxId: taxId.trim() },
      relations: CLIENT_RELATIONS,
    });
    return entity ? this.mapToSummaryRecord(entity) : null;
  }

  async findById(id: number): Promise<ClientSummaryRecord | null> {
    const entity = await this.customerRepo.findOne({
      where: { id },
      relations: CLIENT_RELATIONS,
    });
    return entity ? this.mapToSummaryRecord(entity) : null;
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
      const customerOrm = manager.create(
        CustomerOrmEntity,
        this.buildCustomerData(data.client),
      );
      const savedCustomer = await manager.save(CustomerOrmEntity, customerOrm);

      await this.saveContactRecord(
        manager,
        savedCustomer.id,
        data.primaryContact,
      );

      if (data.portfolioIds && data.portfolioIds.length > 0) {
        await this.savePortfolios(manager, savedCustomer.id, data.portfolioIds);
      }

      await this.saveHistoryRecord(manager, savedCustomer.id, data.history);

      const full = await manager.findOne(CustomerOrmEntity, {
        where: { id: savedCustomer.id },
        relations: CLIENT_RELATIONS,
      });

      return this.mapToSummaryRecord(full ?? savedCustomer);
    });
  }

  async upsertWithRelations(
    data: SaveClientTransactionData,
  ): Promise<'created' | 'updated'> {
    return this.dataSource.transaction(async (manager) => {
      const existing = await manager.findOne(CustomerOrmEntity, {
        where: { taxId: data.client.nit.value },
        relations: { contacts: true },
      });

      if (existing) {
        Object.assign(existing, this.buildCustomerData(data.client));
        await manager.save(CustomerOrmEntity, existing);

        await this.upsertContactRecord(
          manager,
          existing.id,
          existing.contacts,
          data.primaryContact,
        );

        await this.saveHistoryRecord(manager, existing.id, {
          ...data.history,
          action: 'Cliente actualizado',
        });

        return 'updated';
      }

      const customerOrm = manager.create(
        CustomerOrmEntity,
        this.buildCustomerData(data.client),
      );
      const savedCustomer = await manager.save(CustomerOrmEntity, customerOrm);

      await this.saveContactRecord(
        manager,
        savedCustomer.id,
        data.primaryContact,
      );

      await this.saveHistoryRecord(manager, savedCustomer.id, data.history);

      return 'created';
    });
  }

  private buildCustomerData(client: Client): Partial<CustomerOrmEntity> {
    return {
      taxId: client.nit.value,
      legalName: client.legalName,
      commercialName: client.commercialName,
      address: client.address,
      department: client.department,
      municipality: client.municipality,
      neighborhood: client.neighborhood,
      phone: client.phone,
      email: client.email,
      isActive: client.isActive,
      latitude: client.coordinates.latitude ?? undefined,
      longitude: client.coordinates.longitude ?? undefined,
      visitFrequencyDays: client.visitFrequencyDays ?? undefined,
      zoneId: client.zoneId ?? undefined,
      customerTypeId: client.customerTypeId ?? undefined,
      potentialId: client.potentialId ?? undefined,
      customerStatusId: client.customerStatusId ?? undefined,
    };
  }

  private async saveContactRecord(
    manager: EntityManager,
    customerId: number,
    contact: ClientContact,
  ): Promise<void> {
    const contactOrm = manager.create(CustomerContactOrmEntity, {
      customerId,
      name: contact.name,
      position: contact.position,
      phone: contact.phone,
      mobilePhone: contact.mobilePhone,
      email: contact.email,
      isPrimary: true,
    });
    await manager.save(CustomerContactOrmEntity, contactOrm);
  }

  private async upsertContactRecord(
    manager: EntityManager,
    customerId: number,
    existingContacts: CustomerContactOrmEntity[] | undefined,
    contact: ClientContact,
  ): Promise<void> {
    const primaryContact = existingContacts?.find((c) => c.isPrimary);
    if (primaryContact) {
      primaryContact.name = contact.name;
      primaryContact.position = contact.position;
      primaryContact.phone = contact.phone;
      primaryContact.mobilePhone = contact.mobilePhone;
      primaryContact.email = contact.email;
      await manager.save(CustomerContactOrmEntity, primaryContact);
    } else {
      await this.saveContactRecord(manager, customerId, contact);
    }
  }

  private async savePortfolios(
    manager: EntityManager,
    customerId: number,
    portfolioIds: number[],
  ): Promise<void> {
    const portfolioEntities = portfolioIds.map((pId) =>
      manager.create(CustomerPortfolioOrmEntity, {
        customerId,
        portfolioId: pId,
      }),
    );
    await manager.save(CustomerPortfolioOrmEntity, portfolioEntities);
  }

  private async saveHistoryRecord(
    manager: EntityManager,
    customerId: number,
    history: { action: string; user: string; description: string | null },
  ): Promise<void> {
    const historyOrm = manager.create(CustomerHistoryOrmEntity, {
      customerId,
      action: history.action,
      user: history.user,
      description: history.description,
    });
    await manager.save(CustomerHistoryOrmEntity, historyOrm);
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

  async existsById(id: number): Promise<boolean> {
    return this.customerRepo.exists({ where: { id } });
  }

  async getSummaryById(id: number): Promise<ClientSummaryContractDto | null> {
    const entity = await this.customerRepo.findOne({
      where: { id },
      relations: {
        customerPotential: true,
        customerStatus: true,
        contacts: true,
      },
    });
    if (!entity) return null;
    const primary =
      entity.contacts?.find((c) => c.isPrimary) ?? entity.contacts?.[0];
    return {
      id: entity.id,
      nit: entity.taxId,
      legalName: entity.legalName,
      commercialName: entity.commercialName,
      address: entity.address,
      city: entity.municipality,
      state: entity.department,
      phone: entity.phone,
      email: entity.email,
      isActive: entity.isActive,
      potential: entity.customerPotential?.name ?? null,
      clientStatus: entity.customerStatus?.name ?? null,
      latitude: entity.latitude ? Number(entity.latitude) : null,
      longitude: entity.longitude ? Number(entity.longitude) : null,
      primaryContact: primary
        ? {
            name: primary.name,
            phone: primary.phone ?? '',
            email: primary.email,
            position: primary.position,
          }
        : null,
    };
  }

  async getCoordinatesById(
    id: number,
  ): Promise<ClientCoordinatesContractDto | null> {
    const entity = await this.customerRepo.findOne({
      where: { id },
      select: { id: true, latitude: true, longitude: true },
    });
    if (!entity) return null;
    return {
      latitude: entity.latitude ? Number(entity.latitude) : null,
      longitude: entity.longitude ? Number(entity.longitude) : null,
    };
  }

  async getById(id: number): Promise<ClientContractDto | null> {
    const entity = await this.customerRepo.findOne({ where: { id } });
    if (!entity) return null;
    return {
      id: entity.id,
      nit: entity.taxId,
      legalName: entity.legalName,
      commercialName: entity.commercialName,
      address: entity.address,
      city: entity.municipality,
      state: entity.department,
      phone: entity.phone,
      email: entity.email,
      isActive: entity.isActive,
      latitude: entity.latitude ? Number(entity.latitude) : null,
      longitude: entity.longitude ? Number(entity.longitude) : null,
      createdAt: entity.createdAt,
    };
  }
}
