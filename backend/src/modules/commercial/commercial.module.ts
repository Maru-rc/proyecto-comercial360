import { Module } from '@nestjs/common';
import { CommercialController } from './commercial.controller.js';

@Module({
  controllers: [CommercialController],
})
export class CommercialModule {}
