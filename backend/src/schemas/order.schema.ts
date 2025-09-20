import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema({ timestamps: true })
export class Order {
  @Prop()
  school_id: string;

  @Prop()
  trustee_id?: string;

  @Prop({ type: Object })
  student_info?: { name?: string; id?: string; email?: string };

  @Prop()
  gateway_name?: string;

  @Prop()
  custom_order_id?: string; // optional custom id stored by app
}

export const OrderSchema = SchemaFactory.createForClass(Order);
