import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Auth } from '../../../auth/public-api.js';
import { CreateOrderUseCase } from '../../application/create-order/create-order.use-case.js';
import { CreateQuotationUseCase } from '../../application/create-quotation/create-quotation.use-case.js';
import { GetOrderUseCase } from '../../application/get-order/get-order.use-case.js';
import { GetQuotationUseCase } from '../../application/get-quotation/get-quotation.use-case.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { CreateQuotationDto } from './dto/create-quotation.dto.js';

// HU-10: requires a valid session (401 without a session)
@Auth()
@ApiTags('Commercial')
@Controller('commercial')
export class CommercialController {
  constructor(
    private readonly createQuotationUseCase: CreateQuotationUseCase,
    private readonly getQuotationUseCase: GetQuotationUseCase,
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly getOrderUseCase: GetOrderUseCase,
  ) {}

  @Post('quotations')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a commercial quotation with currency COP' })
  @ApiResponse({ status: 201, description: 'Quotation created successfully' })
  @ApiResponse({
    status: 400,
    description: 'Validation error (non-COP currency, negative amount)',
  })
  @ApiResponse({ status: 409, description: 'Quotation number already exists' })
  async createQuotation(@Body() dto: CreateQuotationDto) {
    const q = await this.createQuotationUseCase.execute({
      number: dto.resolvedNumber,
      clientId: dto.resolvedClientId,
      advisorId: dto.resolvedAdvisorId,
      visitId: dto.resolvedVisitId,
      amount: dto.resolvedAmount,
      currency: dto.resolvedCurrency,
      status: dto.resolvedStatus,
      date: dto.resolvedDate,
    });

    return {
      id: q.id,
      quotationNumber: q.number,
      number: q.number,
      clientId: q.clientId,
      advisorId: q.advisorId,
      visitId: q.visitId,
      amount: q.amount,
      currency: q.currency,
      status: q.status,
      date: q.date,
      createdAt: q.createdAt,
    };
  }

  @Get('quotations/:id')
  @ApiOperation({ summary: 'Get quotation by ID' })
  @ApiResponse({ status: 200, description: 'Quotation found' })
  @ApiResponse({ status: 404, description: 'Quotation not found' })
  async getQuotation(@Param('id', ParseIntPipe) id: number) {
    const q = await this.getQuotationUseCase.execute(id);
    return {
      id: q.id,
      quotationNumber: q.number,
      number: q.number,
      clientId: q.clientId,
      advisorId: q.advisorId,
      visitId: q.visitId,
      amount: q.amount,
      currency: q.currency,
      status: q.status,
      date: q.date,
      createdAt: q.createdAt,
    };
  }

  @Post('orders')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create an order linked to client and optional quotation',
  })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 404, description: 'Referenced quotation not found' })
  @ApiResponse({ status: 409, description: 'Order number already exists' })
  async createOrder(@Body() dto: CreateOrderDto) {
    const o = await this.createOrderUseCase.execute({
      number: dto.resolvedNumber,
      clientId: dto.resolvedClientId,
      advisorId: dto.resolvedAdvisorId,
      visitId: dto.resolvedVisitId,
      quotationId: dto.resolvedQuotationId,
      amount: dto.resolvedAmount,
      status: dto.resolvedStatus,
      date: dto.resolvedDate,
      estimatedDeliveryDate: dto.resolvedEstimatedDeliveryDate,
    });

    return {
      id: o.id,
      orderNumber: o.number,
      number: o.number,
      clientId: o.clientId,
      advisorId: o.advisorId,
      visitId: o.visitId,
      quotationId: o.quotationId,
      amount: o.amount,
      status: o.status,
      date: o.date,
      estimatedDeliveryDate: o.estimatedDeliveryDate,
      createdAt: o.createdAt,
    };
  }

  @Get('orders/:id')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiResponse({ status: 200, description: 'Order found' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async getOrder(@Param('id', ParseIntPipe) id: number) {
    const o = await this.getOrderUseCase.execute(id);
    return {
      id: o.id,
      orderNumber: o.number,
      number: o.number,
      clientId: o.clientId,
      advisorId: o.advisorId,
      visitId: o.visitId,
      quotationId: o.quotationId,
      amount: o.amount,
      status: o.status,
      date: o.date,
      estimatedDeliveryDate: o.estimatedDeliveryDate,
      createdAt: o.createdAt,
    };
  }
}
