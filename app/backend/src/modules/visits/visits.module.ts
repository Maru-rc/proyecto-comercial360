import { Module } from '@nestjs/common';
import { VisitsController } from './visits.controller.js';

@Module({
  controllers: [VisitsController],
})
export class VisitsModule {}
