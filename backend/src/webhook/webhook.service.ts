import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { WebhookLog, WebhookLogDocument } from '../schemas/webhook-log.schema';
import { OrderStatus, OrderStatusDocument } from '../schemas/order-status.schema';

@Injectable()
export class WebhookService {
  private logger = new Logger(WebhookService.name);

  constructor(
    @InjectModel(WebhookLog.name) private logModel: Model<WebhookLogDocument>,
    @InjectModel(OrderStatus.name) private orderStatusModel: Model<OrderStatusDocument>
  ) {}

  async processWebhook(payload: any) {
    // store raw payload
    const log = new this.logModel({ payload, processedAt: new Date() });
    await log.save();

    const orderInfo = payload.order_info || {};
    const order_id = orderInfo.order_id || orderInfo.collect_id || orderInfo.transaction_id || orderInfo.custom_order_id;

    // Try to match by custom_order_id or by collect_id if present
    // NOTE: collect_id in DB is an ObjectId referencing Order._id (we stored order._id as collect_id earlier).
    // If external collect_request_id maps to your DB order._id, you'd update accordingly. Here we'll attempt a few heuristics.

    // If webhook passes custom_order_id, prefer that:
    if (orderInfo.custom_order_id) {
      await this.orderStatusModel.findOneAndUpdate(
        { custom_order_id: orderInfo.custom_order_id },
        {
          $set: {
            transaction_amount: orderInfo.transaction_amount || orderInfo.order_amount,
            payment_mode: orderInfo.payment_mode,
            payment_details: orderInfo.payemnt_details || orderInfo.payment_details,
            bank_reference: orderInfo.bank_reference,
            payment_message: orderInfo.Payment_message || orderInfo.payment_message,
            status: orderInfo.status || 'unknown',
            error_message: orderInfo.error_message || null,
            payment_time: orderInfo.payment_time ? new Date(orderInfo.payment_time) : undefined,
            gateway: orderInfo.gateway || undefined,
          },
        },
        { new: true }
      );
      return;
    }

    // If webhook order_id might be the collect_request_id (not DB ObjectId), try matching collect_id by stored mapping field:
    // If your implementation saved collect_request_id in OrderStatus.custom_order_id earlier, adjust accordingly.
    // We'll update any OrderStatus that has matching custom_order_id or matching collect_id string via ObjectId conversion attempt.

    // attempt to convert to ObjectId (if matches)
    try {
      if (Types.ObjectId.isValid(order_id)) {
        const objId = new Types.ObjectId(order_id);
        await this.orderStatusModel.findOneAndUpdate(
          { collect_id: objId },
          {
            $set: {
              transaction_amount: orderInfo.transaction_amount || orderInfo.order_amount,
              payment_mode: orderInfo.payment_mode,
              payment_details: orderInfo.payemnt_details || orderInfo.payment_details,
              bank_reference: orderInfo.bank_reference,
              payment_message: orderInfo.Payment_message || orderInfo.payment_message,
              status: orderInfo.status || 'unknown',
              error_message: orderInfo.error_message || null,
              payment_time: orderInfo.payment_time ? new Date(orderInfo.payment_time) : undefined,
              gateway: orderInfo.gateway || undefined,
            },
          },
          { new: true }
        );
        return;
      }
    } catch (err) {
      this.logger.warn('Failed to parse order_id as ObjectId: ' + err.message);
    }

    // As last resort, try matching by custom_order_id equals order_id string
    await this.orderStatusModel.findOneAndUpdate(
      { custom_order_id: order_id },
      {
        $set: {
          transaction_amount: orderInfo.transaction_amount || orderInfo.order_amount,
          payment_mode: orderInfo.payment_mode,
          payment_details: orderInfo.payemnt_details || orderInfo.payment_details,
          bank_reference: orderInfo.bank_reference,
          payment_message: orderInfo.Payment_message || orderInfo.payment_message,
          status: orderInfo.status || 'unknown',
          error_message: orderInfo.error_message || null,
          payment_time: orderInfo.payment_time ? new Date(orderInfo.payment_time) : undefined,
          gateway: orderInfo.gateway || undefined,
        },
      },
      { new: true }
    );

    // done
  }
}
