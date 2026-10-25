import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ORDER_READER,
  QUOTATION_READER,
} from '../../domain-contracts/index.js';
import { CreateOrderUseCase } from './application/create-order/create-order.use-case.js';
import { CreateQuotationUseCase } from './application/create-quotation/create-quotation.use-case.js';
import { GetOrderUseCase } from './application/get-order/get-order.use-case.js';
import { GetQuotationUseCase } from './application/get-quotation/get-quotation.use-case.js';
import { CommercialController } from './interfaces/http/commercial.controller.js';
import { ORDER_REPOSITORY } from './domain/repositories/order-repository.port.js';
import { QUOTATION_REPOSITORY } from './domain/repositories/quotation-repository.port.js';
import { OrderOrmEntity } from './infrastructure/persistence/entities/order.orm-entity.js';
import { QuotationOrmEntity } from './infrastructure/persistence/entities/quotation.orm-entity.js';
import { TypeOrmOrderRepository } from './infrastructure/persistence/typeorm-order.repository.js';
import { TypeOrmQuotationRepository } from './infrastructure/persistence/typeorm-quotation.repository.js';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([QuotationOrmEntity, OrderOrmEntity]),
  ],
  controllers: [CommercialController],
  providers: [
    TypeOrmQuotationRepository,
    {
      provide: QUOTATION_REPOSITORY,
      useExisting: TypeOrmQuotationRepository,
    },
    {
      provide: QUOTATION_READER,
      useExisting: TypeOrmQuotationRepository,
    },
    TypeOrmOrderRepository,
    {
      provide: ORDER_REPOSITORY,
      useExisting: TypeOrmOrderRepository,
    },
    {
      provide: ORDER_READER,
      useExisting: TypeOrmOrderRepository,
    },
    CreateQuotationUseCase,
    GetQuotationUseCase,
    CreateOrderUseCase,
    GetOrderUseCase,
  ],
  exports: [
    QUOTATION_READER,
    ORDER_READER,
    QUOTATION_REPOSITORY,
    ORDER_REPOSITORY,
    CreateQuotationUseCase,
    GetQuotationUseCase,
    CreateOrderUseCase,
    GetOrderUseCase,
    TypeOrmQuotationRepository,
    TypeOrmOrderRepository,
  ],
})
export class CommercialModule {}
