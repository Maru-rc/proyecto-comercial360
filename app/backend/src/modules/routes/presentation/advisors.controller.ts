import { Controller, Get, Inject } from '@nestjs/common';
import { Auth, ADVISOR_READER } from '../../../domain-contracts/index.js';
import type { AdvisorReader } from '../../../domain-contracts/advisors/advisor-reader.interface.js';

@Controller('asesores')
export class AdvisorsController {
  constructor(
    @Inject(ADVISOR_READER)
    private readonly advisorReader: AdvisorReader,
  ) {}

  @Get()
  @Auth()
  async getActiveAdvisors() {
    return this.advisorReader.listActive();
  }
}
