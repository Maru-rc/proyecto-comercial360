import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  Auth,
  CurrentUser,
  type AuthenticatedUser,
} from '../../../../domain-contracts/index.js';
import type { Order } from '../../domain/entities/order.entity.js';
import type { Quotation } from '../../domain/entities/quotation.entity.js';
import { ListOrdersUseCase } from '../../application/list-orders/list-orders.use-case.js';
import { ListQuotationsUseCase } from '../../application/list-quotations/list-quotations.use-case.js';
import { ListCommercialQueryDto } from './dto/list-commercial.dto.js';
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
    private readonly listQuotationsUseCase: ListQuotationsUseCase,
    private readonly listOrdersUseCase: ListOrdersUseCase,
  ) {}

  @Get('quotations')
  @ApiOperation({
    summary: 'List quotations: an advisor sees their own, a director all',
  })
  async listQuotations(
    @Query() query: ListCommercialQueryDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const page = await this.listQuotationsUseCase.execute({
      requester: user,
      advisorId: query.advisorId,
      page: query.page,
      limit: query.limit,
    });
    return {
      data: page.data.map((item) => ({
        ...toQuotationResponse(item.quotation),
        clientName: item.clientName,
      })),
      meta: page.meta,
    };
  }

  @Get('orders')
  @ApiOperation({
    summary: 'List orders: an advisor sees their own, a director all',
  })
  async listOrders(
    @Query() query: ListCommercialQueryDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const page = await this.listOrdersUseCase.execute({
      requester: user,
      advisorId: query.advisorId,
      page: query.page,
      limit: query.limit,
    });
    return {
      data: page.data.map((item) => ({
        ...toOrderResponse(item.order),
        clientName: item.clientName,
      })),
      meta: page.meta,
    };
  }

  @Post('quotations')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a commercial quotation with currency COP' })
  @ApiResponse({ status: 201, description: 'Quotation created successfully' })
  @ApiResponse({
    status: 400,
    description: 'Validation error (non-COP currency, negative amount)',
  })
  @ApiResponse({ status: 409, description: 'Quotation number already exists' })
  async createQuotation(
    @Body() dto: CreateQuotationDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const q = await this.createQuotationUseCase.execute({
      number: dto.resolvedNumber,
      clientId: dto.resolvedClientId,
      advisorId: dto.resolvedAdvisorId,
      visitId: dto.resolvedVisitId,
      amount: dto.resolvedAmount,
      currency: dto.resolvedCurrency,
      status: dto.resolvedStatus,
      date: dto.resolvedDate,
      requester: user,
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
  async getQuotation(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const q = await this.getQuotationUseCase.execute(id, user);
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
  async createOrder(
    @Body() dto: CreateOrderDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
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
      requester: user,
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
  async getOrder(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const o = await this.getOrderUseCase.execute(id, user);
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

function toQuotationResponse(q: Quotation) {
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

function toOrderResponse(o: Order) {
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
