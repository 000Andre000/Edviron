import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderStatusDocument = OrderStatus & Document;

@Schema({ timestamps: true })
export class OrderStatus {
  @Prop({ type: Types.ObjectId, ref: 'Order' })
  collect_id: Types.ObjectId;

  @Prop()
  order_amount: number;

  @Prop()
  transaction_amount?: number;

  @Prop()
  payment_mode?: string;

  @Prop()
  payment_details?: string;

  @Prop()
  bank_reference?: string;

  @Prop()
  payment_message?: string;

  @Prop()
  status?: string;

  @Prop()
  error_message?: string;

  @Prop()
  payment_time?: Date;

  @Prop()
  gateway?: string;

  @Prop()
  custom_order_id?: string;
}

export const OrderStatusSchema = SchemaFactory.createForClass(OrderStatus);
