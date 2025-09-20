import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from './auth/auth.module';
import { PaymentsModule } from './payment/payments.module';
import { TransactionsModule } from './transactions/transactions.module';
import { WebhookModule } from './webhook/webhook.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URI || '', { autoCreate: true }),
    AuthModule,
    PaymentsModule,
    TransactionsModule,
    WebhookModule
  ],
})
export class AppModule {}




// import { Module } from '@nestjs/common';
// import { AppController } from './app.controller';
// import { AppService } from './app.service';
// import { AuthModule } from './auth/auth.module';
// import { OrdersModule } from './orders/orders.module';
// import { OrderStatusModule } from './order-status/order-status.module';
// import { WebhookModule } from './webhook/webhook.module';
// import { TransactionsModule } from './transactions/transactions.module';

// @Module({
//   imports: [AuthModule, OrdersModule, OrderStatusModule, WebhookModule, TransactionsModule],
//   controllers: [AppController],
//   providers: [AppService],
// })
// export class AppModule {}
