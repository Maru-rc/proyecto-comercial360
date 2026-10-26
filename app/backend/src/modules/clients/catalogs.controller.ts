import { Controller, Get } from '@nestjs/common';
import { Auth } from '../../domain-contracts/index.js';
import { GetCatalogsUseCase } from './application/use-cases/get-catalogs.use-case.js';

@Controller('catalogos')
export class CatalogsController {
  constructor(private readonly getCatalogsUseCase: GetCatalogsUseCase) {}

  @Get()
  @Auth()
  async getCatalogos() {
    return this.getCatalogsUseCase.execute();
  }
}
