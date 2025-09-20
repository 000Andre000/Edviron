import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../shared/jwt-auth.guard';
import { TransactionsService } from './transactions.service';

@Controller()
export class TransactionsController {
  constructor(private txSvc: TransactionsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('transactions')
  async getAll() {
    return this.txSvc.fetchAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('transactions/school/:schoolId')
  async getBySchool(@Param('schoolId') schoolId: string) {
    return this.txSvc.fetchBySchool(schoolId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('transaction-status/:custom_order_id')
  async getStatus(@Param('custom_order_id') custom_order_id: string) {
    return this.txSvc.checkStatusByCustomOrderId(custom_order_id);
  }
}
