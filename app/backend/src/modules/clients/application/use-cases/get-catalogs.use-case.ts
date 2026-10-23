import { Inject, Injectable } from '@nestjs/common';
import {
  CATALOG_REPOSITORY,
  type CatalogRepository,
  type CatalogsGroup,
} from '../ports/catalog.repository.port.js';

@Injectable()
export class GetCatalogsUseCase {
  constructor(
    @Inject(CATALOG_REPOSITORY)
    private readonly catalogRepo: CatalogRepository,
  ) {}

  async execute(): Promise<CatalogsGroup> {
    return this.catalogRepo.getAll();
  }
}
