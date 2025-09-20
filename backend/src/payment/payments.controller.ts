import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Controller('payment')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('create-payment')
  async createPayment(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.createCollectRequest(createPaymentDto);
  }

  @Get('status')
  async checkStatus(
    @Query('collect_request_id') collect_request_id: string,
    @Query('school_id') school_id: string,
  ) {
    return this.paymentsService.checkPaymentStatus(collect_request_id, school_id);
  }
}

// import { Controller, Post, Body, Get, Query, Param } from '@nestjs/common';
// import { PaymentsService } from './payments.service';
// import { CreatePaymentDto } from './dto/create-payment.dto';

// @Controller('payment')
// export class PaymentsController {
//   constructor(private paymentsService: PaymentsService) {}

//   @Post('create-payment')
//   async createPayment(@Body() createPaymentDto: CreatePaymentDto) {
//     return this.paymentsService.createCollectRequest(createPaymentDto);
//   }

//   @Get('status')
//   async checkStatus(
//     @Query('collect_request_id') collect_request_id: string,
//     @Query('school_id') school_id: string,
//   ) {
//     return this.paymentsService.checkPaymentStatus(collect_request_id, school_id);
//   }

//   // New endpoint for checking status by our internal order ID
//   // @Get('check-status/:orderId')
//   // async checkStatusByOrderId(@Param('orderId') orderId: string) {
//   //   return this.paymentsService.checkStatusByOrderId(orderId);
//   // }

//   // Alternative endpoint that matches your frontend
//   @Get('status/:collect_request_id/:school_id')
//   async checkStatusByParams(
//     @Param('collect_request_id') collect_request_id: string,
//     @Param('school_id') school_id: string,
//   ) {
//     return this.paymentsService.checkPaymentStatus(collect_request_id, school_id);
//   }
// }