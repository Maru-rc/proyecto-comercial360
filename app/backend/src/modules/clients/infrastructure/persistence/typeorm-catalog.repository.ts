import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import {
  CatalogItem,
  CatalogRepository,
  CatalogsGroup,
  PortfolioCatalogItem,
  PotentialCatalogItem,
} from '../../application/ports/catalog.repository.port.js';
import { ZoneOrmEntity } from './entities/zone.orm-entity.js';
import { CustomerTypeOrmEntity } from './entities/customer-type.orm-entity.js';
import { PotentialOrmEntity } from './entities/potential.orm-entity.js';
import { CustomerStatusOrmEntity } from './entities/customer-status.orm-entity.js';
import { PortfolioOrmEntity } from './entities/portfolio.orm-entity.js';

@Injectable()
export class TypeOrmCatalogRepository implements CatalogRepository {
  constructor(
    @InjectRepository(ZoneOrmEntity)
    private readonly zoneRepo: Repository<ZoneOrmEntity>,
    @InjectRepository(CustomerTypeOrmEntity)
    private readonly typeRepo: Repository<CustomerTypeOrmEntity>,
    @InjectRepository(PotentialOrmEntity)
    private readonly potentialRepo: Repository<PotentialOrmEntity>,
    @InjectRepository(CustomerStatusOrmEntity)
    private readonly statusRepo: Repository<CustomerStatusOrmEntity>,
    @InjectRepository(PortfolioOrmEntity)
    private readonly portfolioRepo: Repository<PortfolioOrmEntity>,
  ) {}

  async getAll(): Promise<CatalogsGroup> {
    const [zonas, tipos, potenciales, estados, portafolios] = await Promise.all(
      [
        this.zoneRepo.find({ order: { name: 'ASC' } }),
        this.typeRepo.find({ order: { name: 'ASC' } }),
        this.potentialRepo.find({ order: { sortOrder: 'ASC' } }),
        this.statusRepo.find({ order: { name: 'ASC' } }),
        this.portfolioRepo.find({ order: { name: 'ASC' } }),
      ],
    );

    return {
      zonas: zonas.map((z) => ({ id: z.id, nombre: z.name })),
      tipos: tipos.map((t) => ({ id: t.id, nombre: t.name })),
      potenciales: potenciales.map((p) => ({
        id: p.id,
        nombre: p.name,
        orden: p.sortOrder,
      })),
      estados: estados.map((e) => ({ id: e.id, nombre: e.name })),
      portafolios: portafolios.map((p) => ({
        id: p.id,
        nombre: p.name,
        descripcion: p.description,
      })),
    };
  }

  private async findByIdOrName<T extends { id: number; name: string }>(
    repo: Repository<T>,
    idOrName: string | number,
  ): Promise<T | null> {
    if (typeof idOrName === 'number' || !isNaN(Number(idOrName))) {
      const entity = await repo.findOne({
        where: { id: Number(idOrName) } as never,
      });
      if (entity) return entity;
    }
    return repo.findOne({
      where: { name: ILike(String(idOrName).trim()) } as never,
    });
  }

  async findZone(idOrName: string | number): Promise<CatalogItem | null> {
    const entity = await this.findByIdOrName(this.zoneRepo, idOrName);
    return entity ? { id: entity.id, nombre: entity.name } : null;
  }

  async findCustomerType(
    idOrName: string | number,
  ): Promise<CatalogItem | null> {
    const entity = await this.findByIdOrName(this.typeRepo, idOrName);
    return entity ? { id: entity.id, nombre: entity.name } : null;
  }

  async findPotential(
    idOrName: string | number,
  ): Promise<PotentialCatalogItem | null> {
    const entity = await this.findByIdOrName(this.potentialRepo, idOrName);
    return entity
      ? { id: entity.id, nombre: entity.name, orden: entity.sortOrder }
      : null;
  }

  async findCustomerStatus(
    idOrName: string | number,
  ): Promise<CatalogItem | null> {
    const entity = await this.findByIdOrName(this.statusRepo, idOrName);
    return entity ? { id: entity.id, nombre: entity.name } : null;
  }

  async findPortfolios(
    idsOrNames: (string | number)[],
  ): Promise<PortfolioCatalogItem[]> {
    if (!idsOrNames || idsOrNames.length === 0) return [];

    const numIds = idsOrNames
      .filter((v) => typeof v === 'number' || !isNaN(Number(v)))
      .map((v) => Number(v));

    const stringNames = idsOrNames
      .filter((v) => typeof v === 'string' && isNaN(Number(v)))
      .map((v) => String(v).trim().toLowerCase());

    const all = await this.portfolioRepo.find();
    const matched = all.filter(
      (p) =>
        numIds.includes(p.id) ||
        stringNames.includes(p.name.trim().toLowerCase()),
    );

    return matched.map((p) => ({
      id: p.id,
      nombre: p.name,
      descripcion: p.description,
    }));
  }
}
